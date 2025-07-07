import { SupabaseCore } from './supabaseCore';
import type { Chat, Message, Profile } from '@/types/types';

export class ChatService extends SupabaseCore {
  /** Проверить, имеет ли юзер доступ к чату */
  async hasAccess(chatId: string, userId: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from('chat_participants')
      .select('id', { head: true, count: 'exact' })
      .eq('chat_id', chatId)
      .eq('user_id', userId);
    return !error && (count ?? 0) > 0;
  }

  /** Создать или вернуть существующий direct-чат */
  async createDirectChat(otherUserId: string): Promise<string> {
    await this.ensureValidToken();
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    // Ищем существующие direct-чаты
    const { data: myChats } = await this.supabase
      .from('chat_participants')
      .select('chat_id, chats!inner(type)')
      .eq('user_id', user.id)
      .eq('chats.type', 'direct');

    if (myChats) {
      for (const { chat_id } of myChats) {
        const { error, count } = await this.supabase
          .from('chat_participants')
          .select('id', { head: true, count: 'exact' })
          .eq('chat_id', chat_id)
          .eq('user_id', otherUserId);
        if (!error && (count ?? 0) > 0) return chat_id;
      }
    }

    // Создаём новый чат
    const { data: insertedChats, error: chatErr } = await this.supabase
      .from('chats')
      .insert({
        type: 'direct',
        name: '',
        created_by: user.id,
      })
      .select('id');
    if (chatErr || !insertedChats || insertedChats.length === 0) {
      throw chatErr ?? new Error('Не удалось создать чат');
    }
    const newChat = insertedChats[0];

    // Добавляем участников
    const { error: partErr } = await this.supabase.from('chat_participants').insert([
      { chat_id: newChat.id, user_id: user.id },
      { chat_id: newChat.id, user_id: otherUserId },
    ]);
    if (partErr) throw partErr;

    return newChat.id;
  }

  /** Базовая информация о чате */
  async getChat(chatId: string): Promise<Chat | null> {
    const { data, error } = await this.supabase.from('chats').select('*').eq('id', chatId).single();
    if (error) throw error;
    return data;
  }

  /** Данные чата вместе с профилями участников */
  async getChatWithParticipants(
    chatId: string
  ): Promise<(Chat & { participants: Profile[] }) | null> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    // 1) Сам чат
    const { data: chat, error: cErr } = await this.supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();
    if (cErr || !chat) throw cErr ?? new Error('Чат не найден');

    // 2) Профили участников
    const { data: parts, error: pErr } = await this.supabase
      .from('chat_participants')
      .select('*')
      .eq('chat_id', chatId);
    if (pErr) throw pErr;

    // parts.profiles может быть: undefined | Profile | Profile[]
    const participants: Profile[] = parts.flatMap((r: any) => {
      const p = r.profiles as any;
      if (!p) return [];
      return Array.isArray(p) ? p : [p];
    });

    // Для direct-чата — подставляем имя второго участника
    if (chat.type === 'direct') {
      const other = participants.find((p) => p && p.id !== user.id);
      if (other) chat.name = other.username ?? chat.name;
    }

    return { ...chat, participants };
  }

  /**
   * 1) Получить одно (последнее) сообщение вместе с профилем отправителя
   */
  async getLastMessage(chatId: string): Promise<(Message & { sender?: Profile }) | null> {
    await this.ensureValidToken();

    const resp = await this.supabase
      .from('messages')
      .select('*, profiles:sender_id(id, username, avatar_url, status)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // ← без дженериков

    if (resp.error) throw resp.error;
    const row = resp.data;
    if (!row) return null;

    // Явно приводим к нужному типу
    const m = row as Message & { profiles?: Profile[] };
    return {
      id: m.id,
      chat_id: m.chat_id,
      sender_id: m.sender_id,
      content: m.content,
      message_type: m.message_type,
      status: m.status,
      created_at: m.created_at,
      updated_at: m.updated_at,
      sender: m.profiles?.[0],
    };
  }

  /**
   * 2) Получить последние N сообщений вместе с профилями отправителей
   */
  async listRecentMessages(
    chatId: string,
    limit = 10
  ): Promise<Array<Message & { sender?: Profile }>> {
    await this.ensureValidToken();

    const resp = await this.supabase
      .from('messages')
      .select('*, profiles:sender_id(id, username, avatar_url, status)')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(limit); // ← тоже только один аргумент

    if (resp.error) throw resp.error;
    const rows = (resp.data ?? []) as Array<Message & { profiles?: Profile[] }>;

    return rows.map((m) => ({
      id: m.id,
      chat_id: m.chat_id,
      sender_id: m.sender_id,
      content: m.content,
      message_type: m.message_type,
      status: m.status,
      created_at: m.created_at,
      updated_at: m.updated_at,
      sender: m.profiles?.[0],
    }));
  }

  /**
   * Получить список чатов пользователя, отсортированный по активности,
   * и для каждого — только последнее сообщение с данными отправителя
   */
  async listUserChatsWithLastMessage(
    userId: string
  ): Promise<Array<Chat & { lastMessage?: Message & { sender?: Profile } }>> {
    // 1) Убедиться, что токен валиден
    await this.ensureValidToken();

    // 2) Получить все chat_id, в которых участвует пользователь
    const { data: cps, error: cpErr } = await this.supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', userId);
    if (cpErr) throw cpErr;
    const chatIds = cps?.map((r) => r.chat_id) || [];
    if (chatIds.length === 0) return [];

    // 3) Забрать сами чаты, сортируя по updated_at (т.о. по активности)
    const { data: chats, error: chatErr } = await this.supabase
      .from('chats')
      .select('*')
      .in('id', chatIds)
      .order('updated_at', { ascending: false });
    if (chatErr) throw chatErr;

    // 4) Для каждого чата получить только его последнее сообщение
    const result = await Promise.all(
      (chats || []).map(async (chat) => {
        const last = await this.getLastMessage(chat.id);
        return {
          ...chat,
          lastMessage: last ?? undefined,
        };
      })
    );

    return result;
  }

  /** Отправить сообщение */
  async sendMessage(chatId: string, content: string): Promise<void> {
    await this.ensureValidToken();
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    const { error } = await this.supabase
      .from('messages')
      .insert({ chat_id: chatId, sender_id: user.id, content, status: 'unread' });
    if (error) throw error;
  }

  /** Добавить реакцию к сообщению */
  async addReaction(messageId: string, emoji: string): Promise<void> {
    await this.ensureValidToken();
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Не авторизован');

    const { error } = await this.supabase
      .from('message_reactions')
      .insert({ message_id: messageId, user_id: user.id, emoji });
    if (error) throw error;
  }
}

export const chatService = new ChatService();
