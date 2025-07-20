'use client';

import { useEffect, useMemo } from 'react';
import { ChatList as DobrunniaChatList, LoadingSpinner, Alert, Button } from 'dobruniaui';
import { useSelector, useDispatch } from 'react-redux';
import { selectProfile } from '@/shared/store/profileSlice';
import {
  selectChats,
  selectChatLoading,
  selectChatError,
  selectChatsLoaded,
  fetchChats,
  fetchChat,
} from '@/shared/store/chatSlice';
import { fetchLastMessage, selectChatMessages } from '@/shared/store/messageSlice';
import {
  fetchChatParticipants,
  selectAllParticipants,
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

  // Получаем все данные сразу на верхнем уровне
  const allChatMessages = useSelector(selectChatMessages);
  const allParticipants = useSelector(selectAllParticipants);

  // Получаем текущий chatId из URL
  const selectedId = pathname.startsWith('/chats/') ? pathname.split('/')[2] : null;

  useEffect(() => {
    if (!me?.id) return;

    // Загружаем чаты только если они еще не загружены
    if (!chatsLoaded) {
      dispatch(fetchChats(me.id));
    }
  }, [me?.id, chatsLoaded, dispatch]);

  // Автозагрузка недостающих данных для чатов
  useEffect(() => {
    if (chats.length === 0) return;

    chats.forEach((chat) => {
      // Если нет сообщений для чата - загружаем последнее
      if (!allChatMessages[chat.id]) {
        dispatch(fetchLastMessage(chat.id));
      }

      // Если нет участников для чата - загружаем их
      if (!allParticipants[chat.id]) {
        dispatch(fetchChatParticipants(chat.id));
      }
    });
  }, [chats, allChatMessages, allParticipants, dispatch]);

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

    // Подписываемся на создание новых чатов
    statusService.subscribeToTable('chat_participants', 'INSERT', (payload) => {
      console.log('📡 New chat participant:', payload);

      // Если новый участник - это текущий пользователь, загружаем чат
      if (payload.new.user_id === me?.id) {
        const chatId = payload.new.chat_id;
        console.log('🆕 Loading new chat:', chatId);

        // Загружаем информацию о чате через сервис
        dispatch(fetchChat(chatId))
          .unwrap()
          .then(() => {
            // Также загружаем участников и последнее сообщение
            dispatch(fetchChatParticipants(chatId));
            dispatch(fetchLastMessage(chatId));
          })
          .catch(console.error);
      }
    });

    // Очистка подписки при размонтировании или изменении зависимостей
    return () => {
      console.log('🔕 Unsubscribing from realtime changes');
      statusService.unsubscribeFromChannel('profiles:UPDATE');
      statusService.unsubscribeFromChannel('chat_participants:INSERT');
    };
  }, [me?.id, chats.length, dispatch]);

  // Мемоизированное получение всех данных для чатов
  const chatItems: ChatListItem[] = useMemo(() => {
    return chats.map((chat) => {
      // Получаем данные для конкретного чата из уже загруженных данных
      const chatMessages = allChatMessages[chat.id];
      const chatLastMessage =
        chatMessages && chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;
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
        messageStatus: chatLastMessage?.status === 'read' ? 'read' : 'unread',
        isOutgoing: chatLastMessage?.sender_id === me?.id,
        status:
          chat.type === 'direct'
            ? (companion?.status as 'online' | 'offline' | 'dnd' | 'invisible') || 'offline'
            : 'offline',
      };
    });
  }, [chats, allChatMessages, allParticipants, me?.id]);

  const handleChatSelect = (chatId: string) => {
    router.push(`/chats/${chatId}`);
  };

  if (error) {
    return (
      <div className='md:w-80 w-full flex flex-col bg-[var(--c-bg-subtle)] items-center'>
        <Alert type='error'>{error}</Alert>
        <Button onClick={() => dispatch(fetchChats(me?.id || ''))} className='mt-4'>
          Попробовать снова
        </Button>
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
