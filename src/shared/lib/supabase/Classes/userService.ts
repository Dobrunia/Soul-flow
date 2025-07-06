import { Presence } from 'dobruniaui'; // тип статуса
import { SupabaseCore } from './supabaseCore';

/* ---------- типы таблиц (минимально) ---------- */
type Chat = { id: string; name: string; type: 'group' | 'direct'; updated_at: string };
export interface Profile {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'dnd' | 'invisible';
  created_at: string;
  updated_at: string;
}
type Message = {
  chat_id: string;
  content: string;
  created_at: string;
  sender_id: string;
  status?: 'error' | 'unread' | 'read';
  profiles?: Profile | Profile[];
};
type ChatPart = {
  chat_id: string;
  user_id: string;
  profiles?: Profile | Profile[];
  chats?: Chat | Chat[];
};

/* Итоговый объект для списка чатов (≈ ChatListItem из UI) */
export interface ChatBrief {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  messageStatus?: 'error' | 'unread' | 'read';
  isOutgoing: boolean;
  status: Presence;
}

/* ---------- сервис ---------- */
export class UserService extends SupabaseCore {
  /** Получить список чатов пользователя, отсортированный по активности */
  async listChats(userId: string): Promise<ChatBrief[]> {
    /* 1. проверяем токен только при необходимости */
    await this.ensureValidToken();

    /* 2. мои чаты */
    const { data: cps, error: cpErr } = await this.supabase
      .from('chat_participants')
      .select('chat_id, chats(id,name,type,updated_at)')
      .eq('user_id', userId)
      .returns<ChatPart[]>();

    if (cpErr) throw cpErr;
    if (!cps?.length) return [];

    const chatIds = cps.map((c) => c.chat_id);

    /* 3. участники */
    const { data: parts } = await this.supabase
      .from('chat_participants')
      .select('chat_id,user_id,profiles(username,avatar_url,status)')
      .in('chat_id', chatIds)
      .returns<ChatPart[]>();

    const byChat = new Map<string, ChatPart[]>();
    (parts ?? []).forEach((p) => {
      if (!byChat.has(p.chat_id)) byChat.set(p.chat_id, []);
      byChat.get(p.chat_id)!.push(p);
    });

    /* 4. последние сообщения */
    const { data: msgs } = await this.supabase
      .from('messages')
      .select('chat_id,content,created_at,sender_id,status,profiles(username)')
      .in('chat_id', chatIds)
      .order('created_at', { ascending: false })
      .returns<Message[]>();

    const last = new Map<string, Message>();
    msgs?.forEach((m) => {
      if (!last.has(m.chat_id)) last.set(m.chat_id, m);
    });

    /* 5. собираем итог */
    const list: (ChatBrief & { _t: string })[] = [];

    cps.forEach((row) => {
      const chat = Array.isArray(row.chats) ? row.chats[0] : row.chats;
      if (!chat) return;

      const recent = last.get(chat.id);
      const mine = recent?.sender_id === userId;

      /* текст последнего сообщения */
      let text = 'Пока нет сообщений';
      if (recent) {
        const senderName = Array.isArray(recent.profiles)
          ? recent.profiles[0]?.username
          : recent.profiles?.username;
        text =
          chat.type === 'group' && !mine
            ? `${senderName ?? 'Неизвестный'}: ${recent.content}`
            : recent.content;
      }

      /* данные для direct-чата */
      let name = chat.name,
        avatar: string | undefined,
        status: Presence = 'offline';

      if (chat.type === 'direct') {
        const others = byChat.get(chat.id)?.filter((p) => p.user_id !== userId);
        const p = others?.[0]?.profiles;
        const prof = Array.isArray(p) ? p[0] : p;
        if (prof) {
          name = prof.username ?? name;
          avatar = prof.avatar_url ?? avatar;
          status = (prof.status as Presence) ?? status;
        }
      }

      list.push({
        id: chat.id,
        name,
        avatar,
        lastMessage: text,
        time: recent
          ? new Date(recent.created_at).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        messageStatus: recent?.status as 'error' | 'unread' | 'read' | undefined,
        isOutgoing: mine,
        status,
        _t: recent?.created_at ?? chat.updated_at,
      });
    });

    /* сортируем по времени */
    return list.sort((a, b) => (a._t < b._t ? 1 : -1));
  }

  /** Поиск пользователей (по username), исключая текущего */
  async searchUsers(query: string, excludeId?: string, limit = 10): Promise<Profile[]> {
    if (!query.trim()) return [];

    await this.ensureValidToken();

    let rq = this.supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query.trim()}%`)
      .limit(limit);

    if (excludeId) rq = rq.neq('id', excludeId);

    const { data, error } = await rq;
    if (error) throw error;

    return data ?? [];
  }

  async getProfile(id: string): Promise<Profile | null> {
    await this.ensureValidToken(); // проверяем токен только при необходимости

    const { data, error } = await this.supabase.from('profiles').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  }

  async getMyProfile(): Promise<Profile | null> {
    await this.ensureValidToken(); // проверяем токен только при необходимости
    const user = await this.getCurrentUser();
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (error) throw error;
    return data;
  }
}

/* ---------- экспорт “боевого” экземпляра ---------- */
export const userService = new UserService();
