'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatList, type ChatListItem, type Presence } from 'dobruniaui';
import { useSelector } from 'react-redux';
import { selectUser } from '@/shared/store/userSlice';
import { getSupabaseBrowser } from '@/shared/lib/supabase';

// Типы для данных
interface Chat {
  id: string;
  name: string;
  type: string;
  updated_at: string;
}
interface Profile {
  username?: string;
  avatar_url?: string;
  status?: string;
}
interface ChatParticipant {
  chat_id: string;
  user_id: string;
  profiles?: Profile | Profile[];
  chats?: Chat | Chat[];
}
interface Message {
  chat_id: string;
  content: string;
  created_at: string;
  sender_id: string;
  status?: string;
  profiles?: Profile | Profile[];
}

export default function ChatListComponent() {
  const router = useRouter();
  const { chatId: selectedChatId } = useParams() as { chatId?: string };

  const me = useSelector(selectUser);
  const supabase = getSupabaseBrowser();

  const [items, setItems] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dead = useRef(false); // флаг «компонент жив»

  /* ---------------- основная загрузка ---------------- */
  const loadChats = useCallback(async () => {
    if (!me?.id) return; // профиль ещё не пришёл
    setLoading(true);
    setError(null);

    try {
      /* 1. мои чаты */
      const { data: cp, error: cpErr } = (await supabase
        .from('chat_participants')
        .select('chat_id, chats(id,name,type,updated_at)')
        .eq('user_id', me.id)) as { data: ChatParticipant[] | null; error: any };

      if (cpErr) throw cpErr;
      if (!cp?.length) {
        if (!dead.current) setItems([]);
        return;
      }

      const chatIds = cp.map((c) => c.chat_id);

      /* 2. участники + профили */
      const { data: parts } = (await supabase
        .from('chat_participants')
        .select('chat_id,user_id,profiles(username,avatar_url,status)')
        .in('chat_id', chatIds)) as { data: ChatParticipant[] | null };

      const participants = new Map<string, ChatParticipant[]>(); // группируем по chat_id
      (parts ?? []).forEach((p) => {
        if (!participants.has(p.chat_id)) participants.set(p.chat_id, []);
        participants.get(p.chat_id)!.push(p);
      });

      /* 3. последние сообщения (по одному) */
      const { data: msgs } = (await supabase
        .from('messages')
        .select('chat_id,content,created_at,sender_id,status,profiles(username)')
        .in('chat_id', chatIds)
        .order('created_at', { ascending: false })) as { data: Message[] | null };

      const last = new Map<string, Message>();
      (Array.isArray(msgs) ? msgs : []).forEach((m) => {
        if (!last.has(m.chat_id)) last.set(m.chat_id, m);
      });

      /* 4. строим список */
      const list = cp
        .map((row): (ChatListItem & { _lastMessageTime: string }) | undefined => {
          // chats всегда массив, берём первый
          const chatArr = Array.isArray(row.chats) ? row.chats : [row.chats];
          const chat = chatArr[0];
          if (!chat) return undefined;
          const recent = last.get(chat.id);
          const mine = recent?.sender_id === me.id;

          let text = 'Пока нет сообщений';
          if (recent) {
            // profiles всегда массив или undefined
            let sender = 'Неизвестный';
            if (recent.profiles && Array.isArray(recent.profiles) && recent.profiles.length > 0) {
              sender = recent.profiles[0]?.username ?? sender;
            } else if (recent.profiles && !Array.isArray(recent.profiles)) {
              sender = (recent.profiles as Profile).username ?? sender;
            }
            text = chat.type === 'group' && !mine ? `${sender}: ${recent.content}` : recent.content;
          }

          let avatar: string | undefined;
          let name = chat.name;
          let status: Presence = 'offline';

          if (chat.type === 'direct') {
            const others = participants.get(chat.id)?.filter((p) => p.user_id !== me.id);
            const otherProfile = others && others[0]?.profiles;
            if (otherProfile && Array.isArray(otherProfile) && otherProfile.length > 0) {
              name = otherProfile[0]?.username ?? name;
              avatar = otherProfile[0]?.avatar_url ?? undefined;
              status = (otherProfile[0]?.status as Presence) ?? status;
            } else if (otherProfile && !Array.isArray(otherProfile)) {
              name = (otherProfile as Profile).username ?? name;
              avatar = (otherProfile as Profile).avatar_url ?? undefined;
              status = ((otherProfile as Profile).status as Presence) ?? status;
            }
          }

          return {
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
            messageStatus: ['error', 'unread', 'read'].includes(recent?.status as string)
              ? (recent?.status as 'error' | 'unread' | 'read')
              : undefined,
            isOutgoing: mine,
            status,
            // Для сортировки
            _lastMessageTime: recent?.created_at ?? chat.updated_at,
          };
        })
        .filter((x): x is ChatListItem & { _lastMessageTime: string } => Boolean(x));

      list.sort((a, b) =>
        new Date(a._lastMessageTime).getTime() < new Date(b._lastMessageTime).getTime() ? 1 : -1
      );
      if (!dead.current) setItems(list);
    } catch (e) {
      console.error(e);
      if (!dead.current) setError('Не удалось загрузить чаты');
    } finally {
      if (!dead.current) setLoading(false);
    }
  }, [me?.id, supabase]);

  /* подписка на монт / размонт */
  useEffect(() => {
    dead.current = false;
    loadChats();
    return () => {
      dead.current = true;
    };
  }, [loadChats]);

  /* ---------------- UI ---------------- */
  if (error)
    return (
      <div className='p-4 text-center text-[var(--c-warning)]'>
        <p>{error}</p>
        <button onClick={loadChats} className='mt-2 text-[var(--c-accent)] hover:underline'>
          Повторить попытку
        </button>
      </div>
    );

  return (
    <ChatList
      items={items}
      selectedId={selectedChatId}
      onSelect={(id) => router.push(`/chats/${id}`)}
      loading={loading}
      skeletonCount={4}
      className='h-full mt-[1px] border-r border-[var(--c-border)]'
    />
  );
}
