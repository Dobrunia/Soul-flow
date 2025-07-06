import { SupabaseCore } from './supabaseCore';
import type { Presence } from 'dobruniaui';

/* ---------------- модели, которые понадобятся UI ---------------- */

export interface ChatData {
  id: string;
  name: string;
  type: 'direct' | 'group';
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
    await this.refresh();

    const { data, error } = await this.supabase
      .from('chat_participants')
      .select('id')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  }

  /** Информация о чате (id, name, type) */
  async getChat(chatId: string): Promise<ChatData | null> {
    await this.refresh();

    const { data, error } = await this.supabase
      .from('chats')
      .select('id, name, type')
      .eq('id', chatId)
      .single();

    if (error) throw error;
    return data;
  }

  /** Список сообщений + данные отправителя */
  async listMessages(chatId: string): Promise<ChatMessage[]> {
    await this.refresh();

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
        sender: m.profiles
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
    await this.refresh();

    const { error } = await this.supabase.from('messages').insert({
      chat_id: chatId,
      content,
      status: 'unread',
    });

    if (error) throw error;
  }

  /** Добавить реакцию (emoji) к сообщению */
  async addReaction(messageId: string, emoji: string): Promise<void> {
    await this.refresh();

    const { error } = await this.supabase
      .from('message_reactions')
      .insert({ message_id: messageId, emoji });

    if (error) throw error;
  }
}

/* “Боевой” singleton-экземпляр */
export const chatService = new ChatService();
