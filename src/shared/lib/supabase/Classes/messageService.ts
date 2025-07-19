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

    // Сначала получаем последние сообщения в обратном порядке
    const { data: messages, error } = await this.supabase
      .from('messages')
      .select(
        `
        *,
        sender:sender_id(id, username, avatar_url, status)
      `
      )
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(messageLimit);

    if (error) throw error;

    // Разворачиваем массив для хронологического порядка (старые сверху, новые снизу)
    const reversedMessages = (messages || []).reverse();

    return reversedMessages.map((m) => ({
      id: m.id,
      chat_id: m.chat_id,
      sender_id: m.sender_id,
      content: m.content,
      message_type: m.message_type,
      status: m.status,
      created_at: m.created_at,
      updated_at: m.updated_at,
      sender: m.sender,
    }));
  }

  /**
   * Получить только последнее сообщение чата с профилем отправителя
   */
  async getLastMessage(chatId: string): Promise<(Message & { sender: Profile }) | null> {
    await this.ensureValidToken();

    const { data: message, error } = await this.supabase
      .from('messages')
      .select(
        `
        *,
        sender:sender_id(id, username, avatar_url, status)
      `
      )
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
      sender: message.sender,
    };
  }

  /**
   * Отметить сообщения как прочитанные
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    await this.ensureValidToken();

    // Проверяем права доступа к чату
    const { data: chatAccess, error: accessError } = await this.supabase
      .from('chat_participants')
      .select('id')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .single();

    if (accessError) {
      console.error('❌ Access check failed:', accessError);
      throw accessError;
    }

    // Сначала получаем количество непрочитанных сообщений для логирования
    const { data: unreadCount, error: countError } = await this.supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('chat_id', chatId)
      .neq('sender_id', userId)
      .eq('status', 'unread');

    if (countError) {
      console.error('❌ Error counting unread messages:', countError);
      throw countError;
    }

    const { data: updateResult, error } = await this.supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('chat_id', chatId)
      .neq('sender_id', userId) // Не обновляем свои сообщения
      .eq('status', 'unread') // Только непрочитанные
      .select('id, status'); // Возвращаем обновленные записи

    if (error) {
      console.error('❌ Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Отметить конкретное сообщение как прочитанное
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    await this.ensureValidToken();

    const { error } = await this.supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('id', messageId)
      .eq('status', 'unread');

    if (error) throw error;
  }
}

export const messageService = new MessageService();
