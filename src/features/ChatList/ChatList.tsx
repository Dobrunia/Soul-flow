'use client';

import { useEffect, useMemo } from 'react';
import { ChatList as DobrunniaChatList, LoadingSpinner, Alert } from 'dobruniaui';
import { useSelector, useDispatch } from 'react-redux';
import { selectProfile } from '@/shared/store/profileSlice';
import {
  selectChats,
  selectChatLoading,
  selectChatError,
  selectChatsLoaded,
  fetchChats,
} from '@/shared/store/chatSlice';
import {
  selectLastMessages,
  selectLastMessageLoaded,
  fetchLastMessage,
} from '@/shared/store/messageSlice';
import {
  selectAllParticipants,
  selectChatParticipantsLoaded,
  fetchChatParticipants,
  updateUserStatus,
} from '@/shared/store/participantSlice';
import { useRouter, usePathname } from 'next/navigation';
import type { AppDispatch } from '@/shared/store';
import type { ChatListItem } from 'dobruniaui';
import { statusService } from '@/shared/lib/supabase/Classes/realtime';

export default function ChatList() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const me = useSelector(selectProfile);
  const chats = useSelector(selectChats);
  const loading = useSelector(selectChatLoading);
  const error = useSelector(selectChatError);
  const chatsLoaded = useSelector(selectChatsLoaded);
  const lastMessages = useSelector(selectLastMessages);
  const allParticipants = useSelector(selectAllParticipants);

  // Получаем текущий chatId из URL
  const selectedId = pathname.startsWith('/chats/') ? pathname.split('/')[2] : null;

  // Преобразуем сырые данные БД в UI формат
  const chatItems: ChatListItem[] = useMemo(() => {
    return chats.map((chat) => {
      // Получаем данные для конкретного чата
      const chatLastMessage = lastMessages[chat.id];
      const chatParticipants = allParticipants[chat.id];

      // Находим собеседника для direct чата
      let companion = undefined;
      if (chat.type === 'direct' && chatParticipants) {
        companion = chatParticipants.find((p: any) => p.id !== me?.id);
      }

      return {
        id: chat.id,
        name: chat.type === 'direct' ? companion?.username || 'Direct Chat' : chat.name || 'Группа',
        avatar: chat.type === 'direct' ? companion?.avatar_url || undefined : undefined,
        lastMessage: chatLastMessage?.content || '',
        time: chatLastMessage?.created_at
          ? new Date(chatLastMessage.created_at).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        isOnline: chat.type === 'direct' ? companion?.status === 'online' : false,
        messageStatus: chatLastMessage?.status === 'read' ? 'read' : 'unread', // приводим к типу ChatListItem
        isOutgoing: chatLastMessage?.sender_id === me?.id, // true если сообщение от текущего пользователя
        status:
          chat.type === 'direct'
            ? (companion?.status as 'online' | 'offline' | 'dnd' | 'invisible') || 'offline'
            : 'offline', // статус пользователя
      };
    });
  }, [chats, me?.id, lastMessages, allParticipants]);

  useEffect(() => {
    if (!me?.id) return;

    // Загружаем чаты только если они еще не загружены
    if (!chatsLoaded) {
      dispatch(fetchChats(me.id));
    }
  }, [me?.id, chatsLoaded, dispatch]);

  // Загружаем данные для каждого чата параллельно
  useEffect(() => {
    if (chats.length === 0) return;

    // Загружаем последние сообщения и участников только для тех чатов, которые еще не загружены
    chats.forEach((chat) => {
      const lastMessageLoaded = selectLastMessageLoaded(
        { message: { lastMessages } } as any,
        chat.id
      );
      const participantsLoaded = selectChatParticipantsLoaded(
        { participant: { participants: allParticipants } } as any,
        chat.id
      );

      if (!lastMessageLoaded) {
        dispatch(fetchLastMessage(chat.id));
      }
      if (!participantsLoaded) {
        dispatch(fetchChatParticipants(chat.id));
      }
    });
  }, [chats, lastMessages, allParticipants, dispatch]);

  // Подписываемся на изменения статусов пользователей
  useEffect(() => {
    if (!me?.id || chats.length === 0) return;

    console.log('🔔 Subscribing to status changes for chat participants');

    statusService.subscribeToStatusChanges((payload) => {
      console.log('📡 Status change received:', payload);

      // Обновляем статус пользователя в сторе напрямую
      const updatedUserId = payload.new.id;
      const newStatus = payload.new.status;

      // Диспатчим action для обновления статуса во всех чатах
      dispatch(
        updateUserStatus({
          userId: updatedUserId,
          status: newStatus,
        })
      );
    });

    // Очистка подписки при размонтировании или изменении зависимостей
    return () => {
      console.log('🔕 Unsubscribing from status changes');
      statusService.unsubscribeFromChannel('profiles:UPDATE');
    };
  }, [me?.id, chats.length, dispatch]);

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
        selectedId={selectedId || undefined}
        loading={loading}
        className='flex-1'
      />
    </div>
  );
}
