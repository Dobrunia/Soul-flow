'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatList } from 'dobruniaui';
import { createBrowserClient } from '@/shared/lib/supabase';

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  isOnline?: boolean;
  unreadCount?: number;
}

// Типы для Supabase
interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group';
  created_at: string;
  updated_at: string;
}

interface ChatParticipantWithChat {
  chat_id: string;
  chats: Chat;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatListComponent() {
  const params = useParams();
  const router = useRouter();
  const selectedChatId = params?.chatId as string;

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createBrowserClient();

      // Получаем текущего пользователя
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Получаем чаты пользователя через chat_participants
      const { data: chatParticipants, error: chatsError } = await supabase
        .from('chat_participants')
        .select(
          `
          chat_id,
          chats!inner(
            id,
            name,
            type,
            created_at,
            updated_at
          )
        `
        )
        .eq('user_id', user.id);

      if (chatsError) {
        console.error('Error loading chats:', chatsError);
        setError('Ошибка загрузки чатов');
        return;
      }

      if (!chatParticipants || chatParticipants.length === 0) {
        setChats([]);
        return;
      }

      // Получаем последние сообщения для каждого чата
      const chatIds = chatParticipants.map((cp: any) => cp.chat_id);

      const lastMessagesPromises = chatIds.map(async (chatId: string) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return { chatId, lastMessage };
      });

      const lastMessagesResults = await Promise.all(lastMessagesPromises);
      const lastMessagesMap = new Map(
        lastMessagesResults.map(({ chatId, lastMessage }) => [chatId, lastMessage])
      );

      // Формируем данные для ChatList
      const formattedChats: ChatItem[] = chatParticipants.map((cp: any) => {
        const chat = cp.chats;
        const lastMessage = lastMessagesMap.get(chat.id);

        return {
          id: chat.id,
          name: chat.name,
          lastMessage: lastMessage?.content || 'Пока нет сообщений',
          time: lastMessage
            ? new Date(lastMessage.created_at).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          avatar: undefined, // TODO: Добавить аватары
          isOnline: false, // TODO: Добавить статус онлайн
          unreadCount: 0, // TODO: Подсчет непрочитанных
          // Добавляем поле для сортировки
          _lastMessageTime: lastMessage?.created_at || chat.updated_at,
        };
      });

      // Сортируем по времени последнего сообщения (самые новые сверху)
      formattedChats.sort(
        (a: any, b: any) =>
          new Date(b._lastMessageTime).getTime() - new Date(a._lastMessageTime).getTime()
      );

      setChats(formattedChats);
    } catch (error) {
      console.error('Error in loadChats:', error);
      setError('Произошла ошибка при загрузке');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const handleChatSelect = (chatId: string) => {
    // Используем Next.js router для бесшовной навигации
    router.push(`/chats/${chatId}`);
  };

  if (error) {
    return (
      <div className='p-4 text-center text-[var(--c-warning)]'>
        <p>{error}</p>
        <button onClick={loadChats} className='mt-2 text-[var(--c-accent)] hover:underline'>
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <ChatList
      items={chats}
      selectedId={selectedChatId}
      onSelect={handleChatSelect}
      loading={isLoading}
      skeletonCount={6}
      className='h-full mt-[1px] border-r border-[var(--c-border)]'
    />
  );
}
