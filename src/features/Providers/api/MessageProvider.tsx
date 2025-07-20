'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectProfile } from '@/shared/store/profileSlice';
import { addMessage } from '@/shared/store/messageSlice';
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

    return () => {
      console.log('🔕 Stopping global message subscription');
      statusService.unsubscribeFromChannel('messages:INSERT');
    };
  }, [me?.id, dispatch]);

  return <>{children}</>;
}
