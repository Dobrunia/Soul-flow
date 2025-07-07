'use client';

import { useParams, notFound } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
  Message,
  MessageContainer,
  Avatar,
  Row,
  LoadingSpinner,
  type MessageProps,
} from 'dobruniaui';

import MessageInput from './MessageInput';

import { chatService, type ChatMessage } from '@/shared/lib/supabase/Classes/chatService';
import { useSelector } from 'react-redux';
import { selectProfile } from '@/shared/store/profileSlice';
import { useSetProfile } from '@/features/Providers/api/SetProfileProvider';
import { useChatMessagesSubscription } from '@/shared/lib/supabase/Classes/ws/hooks';

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default function ChatPage() {
  const { chatId: rawChatId } = useParams() as { chatId?: string };
  const me = useSelector(selectProfile);
  const { loading: profileLoading } = useSetProfile();

  const [accessChecked, setChecked] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [chatName, setChatName] = useState<string>('Чат');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatAvatar, setChatAvatar] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<'online' | 'offline' | 'dnd' | 'invisible'>(
    'offline'
  );

  /* 1. валидация chatId */
  if (!rawChatId || !isUUID(rawChatId)) notFound();

  const chatId = rawChatId;

  const currentUserId = me?.id;

  /* функция загрузки сообщений */
  const loadMessages = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const msgs = await chatService.listMessages(chatId);
      const formatted: MessageProps[] = msgs.map(toMessageProps(currentUserId));
      setMessages(formatted);
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  }, [chatId, currentUserId]);

  /* ------------ загрузка чата + сообщений ------------ */
  useEffect(() => {
    if (!currentUserId || profileLoading) return;

    (async () => {
      try {
        setError(null);

        /* доступ? */
        const ok = await chatService.hasAccess(chatId, currentUserId);
        if (!ok) {
          setError('У вас нет доступа к этому чату');
          setLoading(false);
          return;
        }

        /* инфо о чате */
        const chat = await chatService.getChatWithParticipants(chatId);
        if (!chat) {
          setError('Чат не найден');
          setLoading(false);
          return;
        }
        setChatName(chat.name);

        // Для direct чата подтягиваем аватар и статус собеседника
        if (chat.type === 'direct' && chat.participants) {
          const other = chat.participants.find((p) => p.id !== currentUserId);
          setChatAvatar(other?.avatar_url ?? null);
          setChatStatus((other?.status as any) ?? 'offline');
        } else {
          setChatAvatar(null);
          setChatStatus('offline');
        }

        /* сообщения */
        await loadMessages();

        setChecked(true);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError('Ошибка загрузки чата');
        setLoading(false);
      }
    })();
  }, [chatId, currentUserId, profileLoading, loadMessages]);

  /* WebSocket подписка на новые сообщения */
  useChatMessagesSubscription(chatId, loadMessages, accessChecked);

  /* ------------ отправка / реакция ------------ */
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentUserId) return;
    await chatService.sendMessage(chatId, text);
    // Сообщения обновятся автоматически через WebSocket
  };

  const handleReaction = async (emoji: string, msgId: string) => {
    await chatService.addReaction(msgId, emoji);
  };

  /* ------------ UI ------------ */
  if (loading && !error)
    return (
      <div className='flex-1 flex items-center justify-center'>
        <LoadingSpinner size='large' />
      </div>
    );

  if (error)
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center text-[var(--c-text-secondary)]'>
          <p className='text-lg mb-2'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='text-[var(--c-accent)] hover:underline'
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );

  return (
    <div className='flex flex-col bg-[var(--c-bg-default)] h-full'>
      {/* шапка */}
      <Row
        left={
          <Avatar
            name={chatName}
            src={chatAvatar || undefined}
            size='md'
            status={chatStatus}
            showStatus
          />
        }
        center={<h2 className='font-medium'>{chatName}</h2>}
        className='bg-[var(--c-bg-subtle)] border-b border-[var(--c-border)]'
        centerJustify='left'
      />

      {/* история */}
      <MessageContainer autoScrollToBottom lastMessageId={messages[messages.length - 1]?.id}>
        {messages.map((m) => (
          <Message
            key={m.id}
            {...m}
            currentUserId={currentUserId}
            reactionEmojis={['❤️', '😂', '👍', '🔥']}
            onReaction={(e) => handleReaction(e, m.id!)}
            showActionsOnClick
          />
        ))}
      </MessageContainer>

      {/* ввод */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}

/* ------------- helper ------------- */

const toMessageProps =
  (meId: string) =>
  (m: ChatMessage): MessageProps => ({
    id: m.id,
    type: m.sender_id === meId ? 'outgoing' : 'incoming',
    text: m.content,
    time: new Date(m.created_at).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    sender:
      m.sender_id !== meId && m.sender
        ? { id: m.sender_id, name: m.sender.username ?? 'Неизвестный' }
        : undefined,
    isRead: m.status === 'read',
  });
