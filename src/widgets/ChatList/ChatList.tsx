'use client';

import { ChatList, type ChatListItem } from 'dobruniaui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

import { userService, type ChatBrief } from '@/shared/lib/supabase/Classes/userService';
import { selectProfile } from '@/shared/store/profileSlice';

/* -------- утилита: ChatBrief ➜ ChatListItem -------- */
const toListItem = ({ _t, ...rest }: any): ChatListItem => rest as ChatListItem;

export default function ChatListComponent() {
  const router = useRouter();
  const { chatId: selectedChatId } = useParams() as { chatId?: string };

  /* берём id из Redux через селектор (null-safe) */
  const meId = useSelector(selectProfile)?.id;

  const [items, setItems] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false); // отмена setState после unmount

  /* ---------- загрузка чатов ---------- */
  const loadChats = useCallback(async () => {
    if (!meId) return; // профиль ещё не готов
    setLoading(true);
    setError(null);

    try {
      const list: ChatBrief[] = await userService.listChats(meId);
      if (!cancelled.current) setItems(list.map(toListItem));
    } catch (e) {
      console.error(e);
      if (!cancelled.current) setError('Не удалось загрузить чаты');
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, [meId]);

  /* запрашиваем при монтировании и при изменении meId */
  useEffect(() => {
    cancelled.current = false;
    loadChats();
    return () => {
      cancelled.current = true;
    };
  }, [loadChats]);

  /* ---------- UI ---------- */
  if (error) {
    return (
      <div className='p-4 text-center text-[var(--c-warning)]'>
        <p>{error}</p>
        <button onClick={loadChats} className='mt-2 text-[var(--c-accent)] hover:underline'>
          Повторить попытку
        </button>
      </div>
    );
  }

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
