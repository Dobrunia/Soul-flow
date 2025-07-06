'use client';

import { useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
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

  /* 1. валидация chatId */
  if (!rawChatId || !isUUID(rawChatId)) notFound();

  const chatId = rawChatId;

  const currentUserId = me?.id;

  /* ------------ загрузка чата + сообщений ------------ */
  useEffect(() => {
    if (!currentUserId || profileLoading) return;

    (async () => {
      try {
        /* доступ? */
        const ok = await chatService.hasAccess(chatId, currentUserId);
        if (!ok) notFound();

        /* инфо о чате */
        const chat = await chatService.getChat(chatId);
        if (!chat) notFound();
        setChatName(chat.name);

        /* сообщения */
        const msgs = await chatService.listMessages(chatId);
        const formatted: MessageProps[] = msgs.map(toMessageProps(currentUserId));
        setMessages(formatted);

        setChecked(true);
        setLoading(false);
      } catch (e) {
        console.error(e);
        notFound();
      }
    })();
  }, [chatId, currentUserId, profileLoading]);

  /* ------------ отправка / реакция ------------ */
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentUserId) return;
    await chatService.sendMessage(chatId, text);
    // перезагрузить или слушать realtime — упрощённо:
    const msgs = await chatService.listMessages(chatId);
    setMessages(msgs.map(toMessageProps(currentUserId)));
  };

  const handleReaction = async (emoji: string, msgId: string) => {
    await chatService.addReaction(msgId, emoji);
  };

  /* ------------ UI ------------ */
  if (!accessChecked || loading)
    return (
      <div className='flex-1 flex items-center justify-center'>
        <LoadingSpinner size='large' />
      </div>
    );

  return (
    <div className='flex flex-col bg-[var(--c-bg-default)] h-full'>
      {/* шапка */}
      <Row
        left={<Avatar name={chatName} size='md' status='online' showStatus />}
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
