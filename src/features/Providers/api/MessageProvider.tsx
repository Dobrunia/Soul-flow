'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectProfile } from '@/shared/store/profileSlice';
import { addMessage, updateMessageStatus } from '@/shared/store/messageSlice';
import { statusService } from '@/shared/lib/supabase/Classes/realtime';
import type { AppDispatch } from '@/shared/store';

export default function MessageProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const me = useSelector(selectProfile);

  useEffect(() => {
    if (!me?.id) return;

    console.log('🔔 Starting global message subscription');

    statusService.subscribeToTable('messages', 'INSERT', (payload) => {
      console.log('📨 New message received globally:', payload);

      const chatId = payload.new.chat_id;

      console.log('🚀 Dispatching addMessage to store');
      // Добавляем сообщение в стор для любого чата
      dispatch(
        addMessage({
          chatId,
          message: {
            id: payload.new.id,
            chat_id: payload.new.chat_id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            message_type: payload.new.message_type,
            status: payload.new.status,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at,
          },
        })
      );
    });

    // Подписываемся на изменения статуса сообщений (когда помечают как прочитанные)
    statusService.subscribeToTable('messages', 'UPDATE', (payload) => {
      console.log('📝 Message status updated:', payload);

      // Обновляем статус сообщения в сторе
      dispatch(updateMessageStatus({
        messageId: payload.new.id,
        status: payload.new.status,
      }));
      console.log('Message status changed from', payload.old.status, 'to', payload.new.status);
    });

    return () => {
      console.log('🔕 Stopping global message subscription');
      statusService.unsubscribeFromChannel('messages:INSERT');
      statusService.unsubscribeFromChannel('messages:UPDATE');
    };
  }, [me?.id, dispatch]);

  return <>{children}</>;
}
