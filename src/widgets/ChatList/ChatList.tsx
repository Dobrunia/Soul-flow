'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatList, type ChatListItem } from 'dobruniaui';
import { getSupabaseBrowser } from '@/shared/lib/supabase';

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
      const supabase = getSupabaseBrowser();
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
          user_id,
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

      // Получаем id всех direct чатов
      const directChatIds = chatParticipants
        .filter((cp: any) => cp.chats.type === 'direct')
        .map((cp: any) => cp.chat_id);

      // Получаем профили участников для direct чатов
      let directChatProfiles: Record<string, any> = {};
      if (directChatIds.length > 0) {
        const { data: participantsData } = await supabase
          .from('chat_participants')
          .select('chat_id, user_id, profiles(username, avatar_url)')
          .in('chat_id', directChatIds);

        for (const p of participantsData || []) {
          if (!directChatProfiles[p.chat_id]) directChatProfiles[p.chat_id] = [];
          directChatProfiles[p.chat_id].push(p);
        }
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
            profiles!inner(username)
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
          let senderName = 'Неизвестный';
          if (lastMessage.profiles) {
            if (Array.isArray(lastMessage.profiles)) {
              senderName =
                (lastMessage.profiles[0] as { username?: string })?.username || senderName;
            } else {
              senderName = (lastMessage.profiles as { username?: string })?.username || senderName;
            }
          }

          if (chat.type === 'group' && !isMyMessage) {
            displayMessage = `${senderName}: ${lastMessage.content}`;
          } else {
            displayMessage = lastMessage.content;
          }
        }

        // Для direct чатов имя и аватар — это собеседник
        let name = chat.name;
        let avatar = undefined;
        if (chat.type === 'direct' && directChatProfiles[chat.id]) {
          const other = directChatProfiles[chat.id].find((p: any) => p.user_id !== user.id);
          if (other && other.profiles) {
            if (Array.isArray(other.profiles)) {
              name = other.profiles[0]?.username || name;
              avatar = other.profiles[0]?.avatar_url;
            } else {
              name = other.profiles.username || name;
              avatar = other.profiles.avatar_url;
            }
          }
        }

        return {
          id: chat.id,
          avatar,
          name,
          lastMessage: displayMessage,
          time: lastMessage
            ? new Date(lastMessage.created_at).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          messageStatus: lastMessage?.status as 'unread' | 'read' | 'error' | undefined,
          isOutgoing: isMyMessage,
          status: 'offline' as const,
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
      skeletonCount={4}
      className='h-full mt-[1px] border-r border-[var(--c-border)]'
    />
  );
}
