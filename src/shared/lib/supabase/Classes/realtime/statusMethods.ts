import { RealtimeCore } from './realtimeCore';

export class StatusMethods extends RealtimeCore {
  private pingInterval: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 10000; // 10 секунд

  /**
   * Отправляет пинг для обновления статуса пользователя
   */
  async sendPing(): Promise<void> {
    try {
      await this.ensureValidToken();

      const { error } = await this.supabase.rpc('send_ping');

      if (error) {
        console.error('❌ Error sending ping:', error);
        throw error;
      }

      console.log('✅ Ping sent successfully');
    } catch (error) {
      console.error('❌ Failed to send ping:', error);
      throw error;
    }
  }

  /**
   * Запускает периодическую отправку пингов
   */
  startPinging(): void {
    if (this.pingInterval) {
      console.warn('⚠️ Ping interval already running');
      return;
    }

    console.log('🚀 Starting status ping interval');

    // Отправляем первый пинг сразу
    this.sendPing().catch(console.error);

    // Устанавливаем интервал
    this.pingInterval = setInterval(() => {
      this.sendPing().catch(console.error);
    }, this.PING_INTERVAL);
  }

  /**
   * Останавливает периодическую отправку пингов
   */
  stopPinging(): void {
    if (this.pingInterval) {
      console.log('🛑 Stopping status ping interval');
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Проверяет, активен ли пинг
   */
  isPinging(): boolean {
    return this.pingInterval !== null;
  }

  /**
   * Обновляет статус пользователя вручную
   */
  async updateStatus(status: 'online' | 'offline' | 'dnd' | 'invisible'): Promise<void> {
    try {
      await this.ensureValidToken();

      const { error } = await this.supabase
        .from('profiles')
        .update({ status })
        .eq('id', (await this.getCurrentUser())?.id);

      if (error) {
        console.error('❌ Error updating status:', error);
        throw error;
      }

      console.log(`✅ Status updated to: ${status}`);
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      throw error;
    }
  }

  /**
   * Подписывается на изменения статусов пользователей
   */
  subscribeToStatusChanges(callback: (payload: any) => void): void {
    this.subscribeToTable('profiles', 'UPDATE', (payload) => {
      // Фильтруем только изменения статуса
      if (payload.new.status !== payload.old.status) {
        callback(payload);
      }
    });
  }

  /**
   * Подписывается на изменения активности пользователей
   */
  subscribeToActivityChanges(callback: (payload: any) => void): void {
    this.subscribeToTable('user_activity', '*', callback);
  }
}
