'use client';

import { useEffect, useMemo } from 'react';
import { ChatList as DobrunniaChatList, LoadingSpinner, Alert } from 'dobruniaui';
import { useSelector, useDispatch } from 'react-redux';
import { selectProfile } from '@/shared/store/profileSlice';
import {
  selectChats,
  selectChatLoading,
  selectChatError,
  fetchChats,
} from '@/shared/store/chatSlice';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/shared/store';
import type { ChatListItem } from 'dobruniaui';

export default function ChatList() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const me = useSelector(selectProfile);
  const chats = useSelector(selectChats);
  const loading = useSelector(selectChatLoading);
  const error = useSelector(selectChatError);

  // Преобразуем сырые данные БД в UI формат
  const chatItems: ChatListItem[] = useMemo(() => {
    return chats.map(({ chat, lastMessage, participants }) => {
      // Находим собеседника для direct чата
      let companion = undefined;
      if (chat.type === 'direct' && participants) {
        companion = participants.find((p) => p.id !== me?.id);
      }

      return {
        id: chat.id,
        name: chat.type === 'direct' ? companion?.username || 'Неизвестный' : chat.name || 'Группа',
        avatar: chat.type === 'direct' ? companion?.avatar_url || undefined : undefined,
        lastMessage: lastMessage?.content || '',
        time: lastMessage?.created_at
          ? new Date(lastMessage.created_at).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        unreadCount: 0, // TODO: добавить подсчет непрочитанных
        isOnline: chat.type === 'direct' ? companion?.status === 'online' : false,
        isTyping: false, // TODO: добавить индикатор печати
      };
    });
  }, [chats, me?.id]);

  useEffect(() => {
    if (!me?.id) return;

    dispatch(fetchChats(me.id));
  }, [me?.id, dispatch]);

  const handleChatSelect = (chatId: string) => {
    router.push(`/chats/${chatId}`);
  };

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center p-4'>
        <LoadingSpinner size='large' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center p-4'>
        <Alert type='error' className='text-center'>
          <p className='mb-2'>{error}</p>
          <button
            onClick={() => dispatch(fetchChats(me?.id || ''))}
            className='text-blue-500 hover:underline'
          >
            Попробовать снова
          </button>
        </Alert>
      </div>
    );
  }

  return (
    <div className='md:w-80 w-full flex flex-col bg-[var(--c-bg-subtle)]'>
      <DobrunniaChatList
        items={chatItems}
        onSelect={handleChatSelect}
        loading={loading}
        className='flex-1'
      />
    </div>
  );
}
