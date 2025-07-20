import { SupabaseCore } from './supabaseCore';
import type { Message, Profile } from '@/types/types';

export class MessageService extends SupabaseCore {
  /**
   * Получить N последних сообщений чата
   */
  async getChatMessages(chatId: string, messageLimit = 10): Promise<Array<Message>> {
    await this.ensureValidToken();

    // Получаем последние сообщения в обратном порядке
    const { data: messages, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(messageLimit);

    if (error) throw error;

    // Разворачиваем массив для хронологического порядка (старые сверху, новые снизу)
    return (messages || []).reverse();
  }

  /**
   * Получить только последнее сообщение чата
   */
  async getLastMessage(chatId: string): Promise<Message | null> {
    await this.ensureValidToken();

    const { data: message, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return message;
  }

  /**
   * Отправить новое сообщение
   */
  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    await this.ensureValidToken();

    const { data: message, error } = await this.supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content: content.trim(),
        message_type: 'text',
        status: 'unread',
      })
      .select('*')
      .single();

    if (error) throw error;
    return message;
  }

  /**
   * Отметить сообщение как прочитанное (когда отображается в чате)
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    await this.ensureValidToken();

    const { error } = await this.supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('id', messageId)
      .eq('status', 'unread'); // Обновляем только если сообщение было unread

    if (error) throw error;
  }
}

export const messageService = new MessageService();
