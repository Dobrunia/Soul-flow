'use client';

import { useState, useMemo } from 'react';
import { type ChatListItem } from 'dobruniaui';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { chatService } from '@/shared/lib/supabase/Classes/chatService';
import { selectProfile } from '@/shared/store/profileSlice';
import MyChatsSearchInput from './SearchBlock/MyChatsSearchInput';
import ChatListComponent from './ChatList/ChatList';
import { useUserChatsSubscription } from '@/shared/lib/supabase/Classes/ws/hooks';

/* -------- утилита: Chat & lastMessage ➜ ChatListItem -------- */
const toListItem = (chat: any): ChatListItem => ({
  id: chat.id,
  name: chat.name || 'Чат',
  lastMessage: chat.lastMessage?.content ?? '',
  time: new Date(chat.updated_at ?? chat.lastMessage?.created_at ?? Date.now()).toLocaleTimeString(
    'ru-RU',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  ),
});

export default function ChatListBlock() {
  /* берём id из Redux через селектор (null-safe) */
  const meId = useSelector(selectProfile)?.id;

  const [allItems, setAllItems] = useState<ChatListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const cancelled = useRef(false); // отмена setState после unmount

  const loadChats = useCallback(async () => {
    if (!meId) return; // профиль ещё не готов
    setLoading(true);
    setError(null);

    try {
      const list = await chatService.listUserChatsWithLastMessage(meId);
      console.log('listChats result:', list);
      if (!cancelled.current) {
        const items = list.map(toListItem);
        console.log('mapped items:', items);
        setAllItems(items);
        setInitialLoaded(true);
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

  /* WebSocket подписка на изменения чатов */
  useUserChatsSubscription(meId, loadChats, !!meId && initialLoaded);

  /* фильтрация чатов по поисковому запросу */
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      if (allItems.length === 0) {
        console.warn('allItems пустой, чаты не отображаются');
      }
      return allItems;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) || item.lastMessage.toLowerCase().includes(query)
    );
    if (filtered.length === 0) {
      console.warn('filteredItems пустой, ничего не найдено по запросу:', query);
    }
    return filtered;
  }, [searchQuery, allItems]);

  // Лог финального списка
  console.log('filteredItems:', filteredItems);

  return (
    <div className='md:w-80 flex flex-col bg-[var(--c-bg-subtle)] w-full'>
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
