'use client';

import { useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Message,
  MessageContainer,
  Avatar,
  Row,
  type MessageProps,
  LoadingSpinner,
} from 'dobruniaui';
import MessageInput from './MessageInput';
import { createBrowserClient } from '@/shared/lib/supabase';

interface ChatData {
  id: string;
  name: string;
  type: 'direct' | 'group';
}

// Валидация chatId (UUID формат)
const isValidChatId = (chatId: string): boolean => {
  // UUID формат: 8-4-4-4-12 символов
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(chatId);
};

// Проверка доступа к чату через Supabase
const checkChatAccess = async (chatId: string, userId: string): Promise<boolean> => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('chat_participants')
    .select('id')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .single();

  return !error && !!data;
};

export default function ChatPage() {
  const params = useParams();
  const rawChatId = params?.chatId as string;

  // Валидация chatId
  if (!rawChatId || !isValidChatId(rawChatId)) {
    notFound(); // Показать 404 страницу
  }

  const chatId = rawChatId;
  const currentUserId = '1'; // TODO: Получить из контекста аутентификации

  // Проверка доступа к чату (будет выполнена в useEffect)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [chat, setChat] = useState<ChatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных чата и сообщений
  useEffect(() => {
    const loadChatData = async () => {
      const supabase = createBrowserClient();

      // Получаем текущего пользователя
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        notFound();
        return;
      }

      // Проверяем доступ к чату
      const access = await checkChatAccess(chatId, user.id);
      if (!access) {
        notFound();
        return;
      }

      setHasAccess(true);

      // Загружаем информацию о чате
      const { data: chatData } = await supabase
        .from('chats')
        .select('id, name, type')
        .eq('id', chatId)
        .single();

      if (chatData) {
        setChat(chatData);
      }

      // Загружаем сообщения
      const { data: messagesData } = await supabase
        .from('messages')
        .select(
          `
          id,
          content,
          created_at,
          sender_id,
          status,
          profiles!inner(full_name)
        `
        )
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        const formattedMessages: MessageProps[] = messagesData.map((msg) => ({
          id: msg.id,
          type: msg.sender_id === user.id ? 'outgoing' : 'incoming',
          text: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          sender:
            msg.sender_id !== user.id
              ? {
                  id: msg.sender_id,
                  name: (msg.profiles as any)?.full_name || 'Неизвестный',
                }
              : undefined,
          isRead: msg.status === 'read',
        }));

        setMessages(formattedMessages);
      }

      setIsLoading(false);
    };

    loadChatData();
  }, [chatId]);

  const handleSendMessage = (message: string) => {
    console.log('Отправка сообщения:', message);
    // TODO: Добавить сообщение в массив и отправить на сервер
  };

  const handleReaction = (emoji: string, messageId: string) => {
    console.log('Реакция:', emoji, 'на сообщение:', messageId);
    // TODO: Добавить реакцию к сообщению
  };

  // Показываем лоадер пока проверяем доступ
  if (hasAccess === null || isLoading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <LoadingSpinner size='large' />
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col bg-[var(--c-bg-default)] h-full'>
      {/* Шапка чата */}
      <Row
        left={<Avatar name={chat?.name || 'Чат'} size='md' status='online' showStatus />}
        center={
          <div className='align-left w-full'>
            <h2 className='font-medium'>{chat?.name || 'Чат'}</h2>
          </div>
        }
        className='bg-[var(--c-bg-subtle)] border-b border-[var(--c-border)]'
      />

      {/* История сообщений */}
      <MessageContainer autoScrollToBottom={true} lastMessageId={messages[messages.length - 1]?.id}>
        {messages.map((msg) => (
          <Message
            key={msg.id}
            {...msg}
            currentUserId={currentUserId}
            reactionEmojis={['❤️', '😂', '👍', '🔥']}
            onReaction={(emoji: string) => handleReaction(emoji, msg.id || '')}
            showActionsOnClick={true}
          />
        ))}
      </MessageContainer>

      {/* Поле ввода */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}
