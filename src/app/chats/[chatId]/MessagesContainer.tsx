'use client';

import React, { useMemo } from 'react';
import { Message } from 'dobruniaui';
import type { Profile, Message as MessageType } from '@/types/types';

interface MessagesContainerProps {
  messages: MessageType[];
  participants: Profile[];
  currentUserId: string;
}

// Мемоизированный компонент сообщения
const MemoizedMessage = React.memo<{
  message: MessageType;
  sender: Profile | undefined;
  currentUserId: string;
}>(
  ({ message, sender, currentUserId }) => {
    return (
      <Message
        key={message.id}
        id={message.id}
        showActionsOnClick
        type={message.sender_id === currentUserId ? 'outgoing' : 'incoming'}
        text={message.content}
        time={new Date(message.created_at).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })}
        sender={{
          id: message.sender_id,
          name: sender?.username ?? 'Неизвестный',
          avatar: sender?.avatar_url ?? undefined,
        }}
        isRead={message.sender_id === currentUserId ? message.status === 'read' : undefined}
      />
    );
  },
  (prevProps, nextProps) => {
    // Сообщение не изменилось если ID и статус тот же
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.status === nextProps.message.status &&
      prevProps.sender?.id === nextProps.sender?.id &&
      prevProps.currentUserId === nextProps.currentUserId
    );
  }
);

MemoizedMessage.displayName = 'MemoizedMessage';

export default function MessagesContainer({
  messages,
  participants,
  currentUserId,
}: MessagesContainerProps) {
  // Мемоизируем отдельно участников чтобы избежать лишних пересчетов
  const participantsMap = useMemo(() => {
    const map = new Map<string, Profile>();
    participants.forEach((p) => map.set(p.id, p));
    return map;
  }, [participants]);

  if (messages.length === 0) {
    return (
      <div className='flex-1 overflow-y-auto space-y-2'>
        <div className='flex items-center justify-center h-full text-[var(--c-text-secondary)]'>
          Сообщений пока нет
        </div>
      </div>
    );
  }
  console.log('render messages');
  return (
    <div className='flex-1 overflow-y-auto space-y-2'>
      {messages.map((message) => {
        // Получаем отправителя из Map по sender_id
        const sender = participantsMap.get(message.sender_id);

        return (
          <MemoizedMessage
            key={message.id}
            message={message}
            sender={sender}
            currentUserId={currentUserId}
          />
        );
      })}
    </div>
  );
}
