import { SupabaseCore } from '../supabaseCore';
import type { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeService extends SupabaseCore {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Подписка на изменения чатов пользователя
   * @param userId - ID пользователя
   * @param onChatsChange - колбэк при изменении чатов
   * @returns функция отписки
   */
  subscribeToUserChats(userId: string, onChatsChange: () => void): () => void {
    const channelName = `user_chats_${userId}`;

    // Отписываемся от предыдущей подписки если есть
    this.unsubscribe(channelName);

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_participants',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log('Chat participants changed for user:', userId);
          onChatsChange();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          console.log('New message received, updating chats...');
          onChatsChange();
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Подписка на сообщения в конкретном чате
   * @param chatId - ID чата
   * @param onNewMessage - колбэк при новом сообщении
   * @returns функция отписки
   */
  subscribeToChatMessages(chatId: string, onNewMessage: () => void): () => void {
    const channelName = `chat_messages_${chatId}`;

    // Отписываемся от предыдущей подписки если есть
    this.unsubscribe(channelName);

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          console.log('New message in chat:', chatId);
          onNewMessage();
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Отписка от конкретного канала
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  /**
   * Отписка от всех каналов
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }

  /**
   * Получить список активных подписок
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

// Singleton экземпляр
export const realtimeService = new RealtimeService();
