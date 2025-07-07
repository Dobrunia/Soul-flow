'use client';

import { useState, useMemo } from 'react';
import { type ChatListItem } from 'dobruniaui';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { userService, type ChatBrief } from '@/shared/lib/supabase/Classes/userService';
import { selectProfile } from '@/shared/store/profileSlice';
import MyChatsSearchInput from './SearchBlock/MyChatsSearchInput';
import ChatListComponent from './ChatList/ChatList';

/* -------- утилита: ChatBrief ➜ ChatListItem -------- */
const toListItem = ({ _t, ...rest }: any): ChatListItem => rest as ChatListItem;

export default function ChatListBlock() {
  /* берём id из Redux через селектор (null-safe) */
  const meId = useSelector(selectProfile)?.id;

  const [allItems, setAllItems] = useState<ChatListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false); // отмена setState после unmount

  const loadChats = useCallback(async () => {
    if (!meId) return; // профиль ещё не готов
    setLoading(true);
    setError(null);

    try {
      const list: ChatBrief[] = await userService.listChats(meId);
      if (!cancelled.current) {
        const items = list.map(toListItem);
        setAllItems(items);
      }
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

  /* фильтрация чатов по поисковому запросу */
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return allItems;
    }

    const query = searchQuery.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) || item.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery, allItems]);

  return (
    <div className='w-80 flex flex-col bg-[var(--c-bg-subtle)]'>
      {/* Поиск по чатам */}
      <MyChatsSearchInput searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Список чатов */}
      <ChatListComponent
        items={filteredItems}
        loading={loading}
        error={error}
        onRetry={loadChats}
      />
    </div>
  );
}
