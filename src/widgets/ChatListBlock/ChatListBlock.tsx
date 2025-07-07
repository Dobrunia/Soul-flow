'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { ChatListItem } from 'dobruniaui';
import { useSelector } from 'react-redux';

import { chatService } from '@/shared/lib/supabase/Classes/chatService';
import { selectProfile } from '@/shared/store/profileSlice';
import MyChatsSearchInput from './SearchBlock/MyChatsSearchInput';
import ChatListComponent from './ChatList/ChatList';
import { useUserChatsSubscription } from '@/shared/lib/supabase/Classes/ws/hooks';
import type { Chat, Message, Profile } from '@/types/types';

export default function ChatListBlock() {
  const meId = useSelector(selectProfile)?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [chatsList, setChatsList] = useState<
    Array<{
      chat: Chat;
      lastMessage?: Message & { sender: Profile };
      participants?: Profile[];
    }>
  >([]);

  const [inited, setInited] = useState(false);
  const cancelled = useRef(false);

  const loadChats = useCallback(async () => {
    if (!meId) return;
    setLoading(true);
    setError(null);

    try {
      const result = await chatService.listRecentChatsWithLastMessage(meId);

      if (!cancelled.current) {
        setChatsList(result);
        setInited(true);
      }
    } catch (e) {
      console.error('[ChatListBlock] loadChats', e);
      if (!cancelled.current) setError('Не удалось загрузить чаты');
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, [meId]);

  return (
    <div className='md:w-80 w-full flex flex-col bg-[var(--c-bg-subtle)]'>
      <MyChatsSearchInput searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ChatListComponent
        items={filteredItems}
        loading={loading}
        error={error}
        onRetry={loadChats}
      />
    </div>
  );
}
