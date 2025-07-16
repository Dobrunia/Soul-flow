'use client';

import { useParams, notFound } from 'next/navigation';
import { useEffect } from 'react';
import { Message, Avatar, Row, LoadingSpinner } from 'dobruniaui';
import MessageInput from './MessageInput';
import type { Profile } from '@/types/types';
import { useSelector, useDispatch } from 'react-redux';
import { selectProfile, selectProfileLoading } from '@/shared/store/profileSlice';
import { fetchChatMessages } from '@/shared/store/messageSlice';
import { fetchChatParticipants } from '@/shared/store/participantSlice';
import { fetchChat, selectChats } from '@/shared/store/chatSlice';
import {
  selectChatMessages,
  selectMessageLoading,
  selectMessageError,
  selectChatMessagesLoaded,
} from '@/shared/store/messageSlice';
import {
  selectParticipants,
  selectParticipantLoading,
  selectParticipantError,
  selectChatParticipantsLoaded,
} from '@/shared/store/participantSlice';
import type { AppDispatch, RootState } from '@/shared/store';

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export default function ChatPage() {
  const { chatId: rawChatId } = useParams() as { chatId?: string };
  const me = useSelector(selectProfile);
  const profileLoading = useSelector(selectProfileLoading);
  const dispatch = useDispatch<AppDispatch>();

  // Проверяем валидность chatId
  const isValidChatId = rawChatId && isUUID(rawChatId);
  const chatId = isValidChatId ? rawChatId : '';
  const myId = me?.id;

  // Redux selectors (после определения chatId)
  const chatMessages = useSelector(
    (state: RootState) => selectChatMessages(state)[chatId] || [],
    (prev, next) => {
      // Мемоизируем результат, сравнивая массивы по содержимому
      if (prev.length !== next.length) return false;
      return prev.every((msg, index) => msg.id === next[index]?.id);
    }
  );
  const messageLoading = useSelector(selectMessageLoading);
  const messageError = useSelector(selectMessageError);
  const messagesLoaded = useSelector((state: RootState) => selectChatMessagesLoaded(state, chatId));
  const participants = useSelector((state: RootState) => selectParticipants(state, chatId));
  const participantLoading = useSelector(selectParticipantLoading);
  const participantError = useSelector(selectParticipantError);
  const participantsLoaded = useSelector((state: RootState) =>
    selectChatParticipantsLoaded(state, chatId)
  );
  const allChats = useSelector(selectChats);
  const currentChat = allChats.find((chat) => chat.id === chatId);

  useEffect(() => {
    if (profileLoading || !isValidChatId || !myId) return;

    // Загружаем данные через Redux только если они еще не загружены
    if (!currentChat) {
      dispatch(fetchChat(chatId));
    }
    if (!messagesLoaded) {
      dispatch(fetchChatMessages({ chatId, messageLimit: 10 }));
    }
    if (!participantsLoaded) {
      dispatch(fetchChatParticipants(chatId));
    }
  }, [
    chatId,
    dispatch,
    profileLoading,
    isValidChatId,
    myId,
    currentChat,
    messagesLoaded,
    participantsLoaded,
  ]);

  // Вычисляем companion из Redux данных
  const companion = participants?.find((p: Profile) => p.id !== myId) ?? null;

  const loading = messageLoading || participantLoading;
  const error = messageError || participantError;

  // Ранний возврат после всех хуков
  if (!isValidChatId) notFound();
  if (!myId) return null; // профайл ещё не поднят

  if (loading && !error)
    return (
      <div className='flex-1 flex items-center justify-center'>
        <LoadingSpinner size='large' />
      </div>
    );
  if (error)
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className='text-blue-500'>
            Попробовать снова
          </button>
        </div>
      </div>
    );

  return (
    <div className='flex flex-col h-full'>
      <Row
        left={
          <Avatar
            name={companion?.username ?? ''}
            src={companion?.avatar_url ?? undefined}
            size='md'
            status={companion?.status || 'offline'}
            showStatus
          />
        }
        center={
          <h2 className='font-medium'>
            {currentChat?.type === 'direct' ? companion?.username : currentChat?.name || 'Чат'}
          </h2>
        }
        className='border-b border-[var(--c-border)]'
        centerJustify='left'
      />
      <MessageInput onSendMessage={() => {}}>
        {chatMessages.map((m: any) => (
          <Message
            key={m.id}
            currentUserId={myId}
            reactionEmojis={['❤️', '😂', '👍', '🔥']}
            showActionsOnClick
            type={m.sender_id === myId ? 'outgoing' : 'incoming'}
            text={m.content}
            time={new Date(m.created_at).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            sender={{
              id: m.sender_id,
              name: m.sender?.username ?? 'Неизвестный',
              avatar: m.sender?.avatar_url ?? undefined,
            }}
            isRead={m.status === 'read'}
          />
        ))}
      </MessageInput>
    </div>
  );
}
