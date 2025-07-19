import { SupabaseCore } from './supabaseCore';
import type { Chat } from '@/types/types';

export class ChatService extends SupabaseCore {
  /**
   * Получить список N самых "активных" чатов пользователя,
   * отсортированных по updated_at DESC
   */
  async listRecentChats(userId: string, chatLimit = 10): Promise<Chat[]> {
    await this.ensureValidToken();

    // 1) ID чатов пользователя
    const { data: cps, error: cpErr } = await this.supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', userId);
    if (cpErr) throw cpErr;
    const chatIds = cps?.map((r) => r.chat_id) || [];
    if (chatIds.length === 0) return [];

    // 2) Собственно чаты
    const { data: chats, error: chatErr } = await this.supabase
      .from('chats')
      .select('*')
      .in('id', chatIds)
      .order('updated_at', { ascending: false })
      .limit(chatLimit);
    if (chatErr) throw chatErr;

    return chats || [];
  }

  /**
   * Получить чат по ID
   */
  async getChat(chatId: string): Promise<Chat> {
    await this.ensureValidToken();

    const { data: chat, error } = await this.supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error) throw error;
    if (!chat) throw new Error('Чат не найден');

    return chat;
  }

  /**
   * Создать прямой чат между двумя пользователями
   */
  async createDirectChat(userId1: string, userId2: string): Promise<Chat> {
    await this.ensureValidToken();

    // Проверяем, не существует ли уже прямой чат между этими пользователями
    const existingChat = await this.findDirectChat(userId1, userId2);
    if (existingChat) {
      return existingChat;
    }

    // Создаем новый чат
    const { data: chat, error: chatError } = await this.supabase
      .from('chats')
      .insert({
        name: 'Direct Chat',
        type: 'direct',
        created_by: userId1,
      })
      .select()
      .single();

    if (chatError) throw chatError;

    // Добавляем участников
    const { error: participantsError } = await this.supabase
      .from('chat_participants')
      .insert([
        { chat_id: chat.id, user_id: userId1 },
        { chat_id: chat.id, user_id: userId2 },
      ]);

    if (participantsError) throw participantsError;

    console.log('✅ Direct chat created:', chat.id);
    return chat;
  }

  /**
   * Найти существующий прямой чат между двумя пользователями
   */
  async findDirectChat(userId1: string, userId2: string): Promise<Chat | null> {
    await this.ensureValidToken();

    // Ищем чаты где участвуют оба пользователя
    const { data: chatIds, error } = await this.supabase
      .from('chat_participants')
      .select('chat_id')
      .in('user_id', [userId1, userId2]);

    if (error) throw error;
    if (!chatIds || chatIds.length === 0) return null;

    // Группируем по chat_id и ищем чаты где оба пользователя
    const chatCounts = chatIds.reduce((acc, { chat_id }) => {
      acc[chat_id] = (acc[chat_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const directChatIds = Object.keys(chatCounts).filter(
      (chatId) => chatCounts[chatId] === 2
    );

    if (directChatIds.length === 0) return null;

    // Получаем первый найденный прямой чат
    const { data: chat, error: chatError } = await this.supabase
      .from('chats')
      .select('*')
      .eq('id', directChatIds[0])
      .eq('type', 'direct')
      .single();

    if (chatError) return null;
    return chat;
  }
}

export const chatService = new ChatService();
