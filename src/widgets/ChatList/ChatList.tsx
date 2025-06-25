'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatList, type ChatListItem } from 'dobruniaui';
import { createBrowserClient } from '@/shared/lib/supabase';

// Типы для Supabase
interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group';
  created_at: string;
  updated_at: string;
}

export default function ChatListComponent() {
  const params = useParams();
  const router = useRouter();
  const selectedChatId = params?.chatId as string;

  const [chats, setChats] = useState<ChatListItem[]>([]);
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

      // Получаем последние сообщения для каждого чата с информацией об отправителе
      const chatIds = chatParticipants.map((cp: any) => cp.chat_id);

      const lastMessagesPromises = chatIds.map(async (chatId: string) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select(
            `
            content, 
            created_at, 
            sender_id,
            status,
            profiles!inner(full_name)
          `
          )
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
      const formattedChats: ChatListItem[] = chatParticipants.map((cp: any) => {
        const chat = cp.chats;
        const lastMessage = lastMessagesMap.get(chat.id);

        // Форматируем последнее сообщение
        const isMyMessage = lastMessage?.sender_id === user.id;
        let displayMessage = 'Пока нет сообщений';

        if (lastMessage) {
          const senderName =
            (lastMessage.profiles && lastMessage.profiles[0])?.full_name || 'Неизвестный';

          if (chat.type === 'group' && !isMyMessage) {
            // В групповых чатах показываем имя отправителя для чужих сообщений
            displayMessage = `${senderName}: ${lastMessage.content}`;
          } else {
            // В остальных случаях просто текст сообщения
            displayMessage = lastMessage.content;
          }
        }

        return {
          id: chat.id,
          avatar: undefined, // TODO: Добавить аватары
          name: chat.name,
          lastMessage: displayMessage,
          time: lastMessage
            ? new Date(lastMessage.created_at).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          messageStatus: lastMessage?.status as 'unread' | 'read' | 'error' | undefined,
          isOutgoing: isMyMessage,
          status: 'offline' as const, // TODO: Реальный статус пользователей
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
