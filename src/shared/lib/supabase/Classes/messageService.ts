import { SupabaseCore } from './supabaseCore';
import type { Message, Profile } from '@/types/types';

export class MessageService extends SupabaseCore {
  /**
   * Получить N последних сообщений чата с профилями отправителей
   */
  async getChatMessages(
    chatId: string,
    messageLimit = 10
  ): Promise<Array<Message & { sender: Profile }>> {
    await this.ensureValidToken();

    const { data: messages, error } = await this.supabase
      .from('messages')
      .select('*, profiles:sender_id(id, username, avatar_url, status)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(messageLimit);

    if (error) throw error;

    return (messages || []).map((m) => ({
      id: m.id,
      chat_id: m.chat_id,
      sender_id: m.sender_id,
      content: m.content,
      message_type: m.message_type,
      status: m.status,
      created_at: m.created_at,
      updated_at: m.updated_at,
      sender: m.profiles[0],
    }));
  }

  /**
   * Получить только последнее сообщение чата с профилем отправителя
   */
  async getLastMessage(chatId: string): Promise<(Message & { sender: Profile }) | null> {
    await this.ensureValidToken();

    const { data: message, error } = await this.supabase
      .from('messages')
      .select('*, profiles:sender_id(id, username, avatar_url, status)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!message) return null;

    return {
      id: message.id,
      chat_id: message.chat_id,
      sender_id: message.sender_id,
      content: message.content,
      message_type: message.message_type,
      status: message.status,
      created_at: message.created_at,
      updated_at: message.updated_at,
      sender: message.profiles[0],
    };
  }
}

export const messageService = new MessageService();
