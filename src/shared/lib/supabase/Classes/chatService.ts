import { SupabaseCore } from './supabaseCore';
import type { Chat, Message, Profile } from '@/types/types';

export class ChatService extends SupabaseCore {
  /**
   * Проверить, имеет ли пользователь доступ к указанному чату
   */
  async hasAccess(chatId: string, userId: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from('chat_participants')
      .select('id', { head: true, count: 'exact' })
      .eq('chat_id', chatId)
      .eq('user_id', userId);
    return !error && (count ?? 0) > 0;
  }

  /**
   * Получить список N самых "активных" чатов пользователя,
   * отсортированных по updated_at DESC, и к каждому подцепить:
   *  - lastMessage (самое свежее сообщение + sender)
   *  - participants (для direct-чата массив профилей участников)
   */
  async listRecentChatsWithLastMessage(
    userId: string,
    chatLimit = 10
  ): Promise<
    Array<{
      chat: Chat;
      lastMessage?: Message & { sender: Profile };
      participants?: Profile[];
    }>
  > {
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

    // 3) Для каждого чата достаём lastMessage и, если direct, — участников
    const result = await Promise.all(
      (chats || []).map(async (chat) => {
        // a) последнее сообщение
        const last = await this.getLastMessage(chat.id);

        // b) участники (только для direct)
        let participants: Profile[] | undefined;
        if (chat.type === 'direct') {
          const { data: parts, error: pErr } = await this.supabase
            .from('chat_participants')
            .select('profiles:user_id(id, username, avatar_url, status)')
            .eq('chat_id', chat.id);
          if (pErr) throw pErr;
          participants = parts
            ? (parts.flatMap((r: any) => {
                const p = r.profiles;
                if (!p) return [];
                return Array.isArray(p) ? p : [p];
              }) as Profile[])
            : [];
        }

        return {
          chat,
          lastMessage: last ?? undefined,
          participants,
        };
      })
    );

    return result;
  }

  /**
   * Получить одно (последнее) сообщение с профилем отправителя
   */
  private async getLastMessage(chatId: string): Promise<(Message & { sender: Profile }) | null> {
    const resp = await this.supabase
      .from('messages')
      .select('*, profiles:sender_id(id, username, avatar_url, status)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (resp.error) throw resp.error;
    const row = resp.data as (Message & { profiles: Profile[] }) | null;
    if (!row) return null;
    return {
      id: row.id,
      chat_id: row.chat_id,
      sender_id: row.sender_id,
      content: row.content,
      message_type: row.message_type,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      sender: row.profiles[0],
    };
  }

  /**
   *  Получить чат + участников (для direct) + до N последних сообщений с sender.
   */
  async getChatWithMessages(
    chatId: string,
    userId: string,
    messageLimit = 10
  ): Promise<{
    chat: Chat;
    participants?: Profile[];
    messages: Array<Message & { sender: Profile }>;
  }> {
    await this.ensureValidToken();

    // 1) Проверяем доступ
    if (!(await this.hasAccess(chatId, userId))) {
      throw new Error('Доступ запрещён');
    }

    // 2) Берём сам чат
    const { data: chat, error: cErr } = await this.supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();
    if (cErr || !chat) throw cErr ?? new Error('Чат не найден');

    // 3) Если direct, подгружаем участников
    let participants: Profile[] | undefined;
    if (chat.type === 'direct') {
      const { data: parts, error: pErr } = await this.supabase
        .from('chat_participants')
        .select('profiles:user_id(id, username, avatar_url, status)')
        .eq('chat_id', chatId);
      if (pErr) throw pErr;
      participants = parts
        ? (parts.flatMap((r: any) => {
            const p = r.profiles;
            if (!p) return [];
            return Array.isArray(p) ? p : [p];
          }) as Profile[])
        : [];
    }

    // 4) Берём последние сообщения + профили отправителей
    const resp = await this.supabase
      .from('messages')
      .select('*, profiles:sender_id(id, username, avatar_url, status)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(messageLimit);
    if (resp.error) throw resp.error;

    const messages = (resp.data ?? []).map((m) => ({
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

    return {
      chat,
      participants,
      messages,
    };
  }
}

export const chatService = new ChatService();
