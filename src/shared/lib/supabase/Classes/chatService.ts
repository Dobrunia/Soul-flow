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
}

export const chatService = new ChatService();
