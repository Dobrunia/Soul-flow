'use client';

import { useParams, notFound } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Message, Avatar, Row, LoadingSpinner, Button, Alert } from 'dobruniaui';
import MessageInput from './MessageInput';
import type { Profile } from '@/types/types';
import { useSelector, useDispatch } from 'react-redux';
import { selectProfile, selectProfileLoading } from '@/shared/store/profileSlice';
import {
  fetchChatParticipants,
  selectAllParticipants,
  selectParticipantLoading,
  selectParticipantError,
} from '@/shared/store/participantSlice';
import { fetchChat, selectChatById, selectChatLoaded } from '@/shared/store/chatSlice';
import {
  fetchChatMessages,
  selectChatMessages,
  selectMessageLoading,
  selectMessageError,
} from '@/shared/store/messageSlice';
import type { AppDispatch, RootState } from '@/shared/store';

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export default function ChatPage() {
  const { chatId: rawChatId } = useParams() as { chatId?: string };
  const dispatch = useDispatch<AppDispatch>();

  // Проверяем валидность chatId
  const isValidChatId = rawChatId && isUUID(rawChatId);
  const chatId = isValidChatId ? rawChatId : '';

  // Получаем все данные на верхнем уровне
  const me = useSelector(selectProfile);
  const profileLoading = useSelector(selectProfileLoading);
  const currentChat = useSelector((state: RootState) => selectChatById(state, chatId));
  const chatLoaded = useSelector((state: RootState) => selectChatLoaded(state, chatId));
  const allChatMessages = useSelector(selectChatMessages);
  const allParticipants = useSelector(selectAllParticipants);
  const messageLoading = useSelector(selectMessageLoading);
  const messageError = useSelector(selectMessageError);
  const participantLoading = useSelector(selectParticipantLoading);
  const participantError = useSelector(selectParticipantError);

  // Получаем данные для конкретного чата
  const chatMessages = useMemo(() => allChatMessages[chatId] || [], [allChatMessages, chatId]);

  const participants = useMemo(() => allParticipants[chatId] || [], [allParticipants, chatId]);

  const companion = useMemo(
    () => participants.find((p: Profile) => p.id !== me?.id) || null,
    [participants, me?.id]
  );

  // Автозагрузка недостающих данных
  useEffect(() => {
    if (!isValidChatId || !me?.id || profileLoading) return;

    // Загружаем чат если его нет
    if (!chatLoaded) {
      dispatch(fetchChat(chatId));
    }

    // Загружаем сообщения если их нет
    if (!chatMessages.length) {
      dispatch(fetchChatMessages({ chatId, messageLimit: 50 }));
    }

    // Загружаем участников если их нет
    if (!participants.length) {
      dispatch(fetchChatParticipants(chatId));
    }
  }, [
    chatId,
    isValidChatId,
    me?.id,
    profileLoading,
    chatLoaded,
    chatMessages.length,
    participants.length,
    dispatch,
  ]);

  const loading = messageLoading || participantLoading;
  const error = messageError || participantError;

  // Ранние возвраты
  if (!isValidChatId) notFound();
  if (!me?.id) return null;

  if (loading && !error) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <LoadingSpinner size='large' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <Alert type='error'>{error}</Alert>
          <Button onClick={() => window.location.reload()} className='mt-4'>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

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
      <MessageInput>
        {chatMessages.map((m: any) => (
          <Message
            key={m.id}
            showActionsOnClick
            type={m.sender_id === me.id ? 'outgoing' : 'incoming'}
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
            isRead={m.sender_id === me.id ? m.status === 'read' : undefined}
          />
        ))}
      </MessageInput>
    </div>
  );
}
