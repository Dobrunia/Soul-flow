import { SupabaseCore } from '../supabaseCore';
import { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeCore extends SupabaseCore {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Подписывается на изменения таблицы
   */
  subscribeToTable(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: (payload: any) => void
  ): RealtimeChannel {
    const channelName = `${table}:${event}`;

    // Если канал уже существует, возвращаем его
    if (this.channels.has(channelName)) {
      console.log(`⚠️ Channel ${channelName} already exists, reusing`);
      return this.channels.get(channelName)!;
    }

    console.log(`🔔 Creating new channel: ${channelName}`);

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Отписывается от канала
   */
  unsubscribeFromChannel(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      console.log(`🔕 Unsubscribing from channel: ${channelName}`);
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
    } else {
      console.log(`⚠️ Channel ${channelName} not found for unsubscribe`);
    }
  }

  /**
   * Отписывается от всех каналов
   */
  unsubscribeFromAll(): void {
    this.channels.forEach((channel, name) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  /**
   * Получает список активных каналов
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Проверяет, подключен ли канал
   */
  isChannelActive(channelName: string): boolean {
    return this.channels.has(channelName);
  }
}
