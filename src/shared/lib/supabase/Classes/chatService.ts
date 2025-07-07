import { SupabaseCore } from './supabaseCore';
import type { Presence } from 'dobruniaui';

/* ---------------- модели, которые понадобятся UI ---------------- */

export interface ChatData {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    status: Presence;
  }[];
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  created_at: string;
  content: string;
  status: 'error' | 'unread' | 'read';
  sender?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    status: Presence;
  };
}

/* ---------------- сервис ---------------- */

export class ChatService extends SupabaseCore {
  /** Проверка, является ли пользователь участником чата */
  async hasAccess(chatId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('chat_participants')
      .select('id')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  }

  /** Создать личный чат между двумя пользователями */
  async createDirectChat(otherUserId: string): Promise<string> {
    await this.ensureValidToken();

    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Ищем существующий личный чат между пользователями
    const { data: myChats } = await this.supabase
      .from('chat_participants')
      .select(
        `
        chat_id,
        chats!inner (id, type)
      `
      )
      .eq('user_id', user.id)
      .eq('chats.type', 'direct');

    if (myChats) {
      // Проверяем каждый мой direct чат - есть ли в нем второй пользователь
      for (const myChat of myChats) {
        const { data: otherParticipant } = await this.supabase
          .from('chat_participants')
          .select('id')
          .eq('chat_id', myChat.chat_id)
          .eq('user_id', otherUserId)
          .maybeSingle();

        if (otherParticipant) {
          return myChat.chat_id; // Чат уже существует
        }
      }
    }

    // Создаем новый чат
    const { data: newChat, error: chatError } = await this.supabase
      .from('chats')
      .insert({
        type: 'direct',
        name: '', // Для личных чатов имя не нужно
        created_by: user.id, // Обязательно для RLS политики
      })
      .select('id')
      .single();

    if (chatError) throw chatError;

    // Добавляем участников
    const { error: participantsError } = await this.supabase.from('chat_participants').insert([
      { chat_id: newChat.id, user_id: user.id },
      { chat_id: newChat.id, user_id: otherUserId },
    ]);

    if (participantsError) throw participantsError;

    return newChat.id;
  }

  /** Информация о чате (id, name, type) */
  async getChat(chatId: string): Promise<ChatData | null> {
    const { data, error } = await this.supabase
      .from('chats')
      .select('id, name, type')
      .eq('id', chatId)
      .single();

    if (error) throw error;
    return data;
  }

  /** Информация о чате с участниками (для direct чатов показываем имя собеседника) */
  async getChatWithParticipants(chatId: string): Promise<ChatData | null> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Получаем информацию о чате
    const { data: chat, error: chatError } = await this.supabase
      .from('chats')
      .select('id, name, type')
      .eq('id', chatId)
      .single();

    if (chatError) throw chatError;

    // Получаем участников
    const { data: participants, error: participantsError } = await this.supabase
      .from('chat_participants')
      .select(
        `
        profiles:user_id (
          id,
          username,
          avatar_url,
          status
        )
      `
      )
      .eq('chat_id', chatId);

    if (participantsError) throw participantsError;

    const participantsList = participants
      ?.map((p) => p.profiles)
      .filter(Boolean)
      .flat();

    // Для direct чатов используем имя собеседника
    if (chat.type === 'direct' && participantsList) {
      const otherUser = participantsList.find((p) => p.id !== user.id);
      if (otherUser) {
        chat.name = otherUser.username || 'Неизвестный пользователь';
      }
    }

    return {
      ...chat,
      participants: participantsList,
    };
  }

  /** Список сообщений + данные отправителя */
  async listMessages(chatId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select(
        `
          id,
          chat_id,
          content,
          created_at,
          sender_id,
          status,
          profiles:sender_id ( username, avatar_url, status )
        `
      )
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (
      data?.map((m) => ({
        id: m.id,
        chat_id: m.chat_id,
        sender_id: m.sender_id,
        created_at: m.created_at,
        content: m.content,
        status: m.status,
        sender:
          m.profiles && m.profiles.length > 0
            ? {
                id: m.sender_id,
                username: m.profiles[0].username,
                avatar_url: m.profiles[0].avatar_url,
                status: (m.profiles[0].status as Presence) || 'offline',
              }
            : undefined,
      })) ?? []
    );
  }

  /** Отправить текстовое сообщение */
  async sendMessage(chatId: string, content: string): Promise<void> {
    await this.ensureValidToken();

    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await this.supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: user.id,
      content,
      status: 'unread',
    });

    if (error) throw error;
  }

  /** Добавить реакцию (emoji) к сообщению */
  async addReaction(messageId: string, emoji: string): Promise<void> {
    await this.ensureValidToken();

    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await this.supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    });

    if (error) throw error;
  }
}

/* “Боевой” singleton-экземпляр */
export const chatService = new ChatService();
