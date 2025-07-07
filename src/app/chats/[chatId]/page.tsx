'use client';

import { useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Message, MessageContainer, Avatar, Row, LoadingSpinner } from 'dobruniaui';
import MessageInput from './MessageInput';
import { chatService } from '@/shared/lib/supabase/Classes/chatService';
import type { Chat, Message as DBMessage, Profile } from '@/types/types';
import { useSelector } from 'react-redux';
import { selectProfile } from '@/shared/store/profileSlice';
import { useSetProfile } from '@/features/Providers/api/SetProfileProvider';

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export default function ChatPage() {
  const { chatId: rawChatId } = useParams() as { chatId?: string };
  const me = useSelector(selectProfile);
  const { loading: profileLoading } = useSetProfile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chatData, setChatData] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<(DBMessage & { sender: Profile | undefined })[]>([]);
  const [companion, setCompanion] = useState<Profile | null>(null);

  if (!rawChatId || !isUUID(rawChatId)) notFound();
  const chatId = rawChatId;
  const myId = me?.id;
  if (!myId) return null; // профайл ещё не поднят

  useEffect(() => {
    if (profileLoading) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // проверяем доступ
        if (!(await chatService.hasAccess(chatId, myId))) {
          throw new Error('Нет доступа');
        }
        // загружаем чат + сообщения
        const {
          chat,
          participants,
          messages: dbMessages,
        } = await chatService.getChatWithMessages(chatId, myId, 10);

        setChatData(chat);
        setCompanion(participants?.find((p) => p.id !== myId) ?? null);
        setMessages(dbMessages);
      } catch (e) {
        console.error(e);
        setError((e as Error).message || 'Ошибка');
      } finally {
        setLoading(false);
      }
    })();
  }, [chatId, myId, profileLoading]);

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
    <div className='flex flex-col h-full bg-white'>
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
            {chatData?.type === 'direct' ? companion?.username : chatData?.name}
          </h2>
        }
        className='bg-gray-100 border-b'
        centerJustify='left'
      />
      <MessageContainer autoScrollToBottom lastMessageId={messages.at(-1)?.id}>
        {messages.map((m) => (
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
      </MessageContainer>
      <MessageInput onSendMessage={() => {}} />
    </div>
  );
}
