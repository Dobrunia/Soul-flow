'use client';

import React, { useMemo, useEffect } from 'react';
import { Message } from 'dobruniaui';
import type { Profile, Message as MessageType } from '@/types/types';
import { messageService } from '@/shared/lib/supabase/Classes/messageService';

interface MessagesContainerProps {
  messages: MessageType[];
  participants: Profile[];
  currentUserId: string;
}

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

  // Помечаем непрочитанные входящие сообщения как прочитанные
  useEffect(() => {
    const unreadIncomingMessages = messages.filter(
      (m) => m.sender_id !== currentUserId && m.status === 'unread'
    );

    unreadIncomingMessages.forEach((message) => {
      console.log('📖 Marking message as read:', message.id);
      messageService.markMessageAsRead(message.id).catch(console.error);
    });
  }, [messages, currentUserId]);

  if (messages.length === 0) {
    return (
      <div className='flex-1 overflow-y-auto space-y-2 custom-scrollbar'>
        <div className='flex items-center justify-center h-full text-[var(--c-text-secondary)]'>
          Сообщений пока нет
        </div>
      </div>
    );
  }

  console.log('render messages');
  return (
    <div className='flex-1 overflow-y-auto custom-scrollbar'>
      {messages.map((message) => {
        // Получаем отправителя из Map по sender_id
        const sender = participantsMap.get(message.sender_id);

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
      })}
    </div>
  );
}
