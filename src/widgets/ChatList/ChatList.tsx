'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChatList } from 'dobruniaui';

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  isOnline?: boolean;
  unreadCount?: number;
}

const mockChats: ChatItem[] = [
  {
    id: '1',
    name: 'Добрыня',
    lastMessage: '',
    time: '',
    avatar: undefined,
    isOnline: true,
    unreadCount: 0,
  },
  {
    id: '2',
    name: 'Алиса Морозова',
    lastMessage: 'Отлично! Встречаемся завтра',
    time: '12:45',
    avatar: undefined,
    isOnline: false,
    unreadCount: 2,
  },
  {
    id: '3',
    name: 'Максим Dev',
    lastMessage: 'Проверь последний коммит, там...',
    time: '11:23',
    avatar: undefined,
    isOnline: false,
    unreadCount: 0,
  },
  {
    id: '4',
    name: 'Артём Кузнецов',
    lastMessage: 'Кофе не забудь! ☕',
    time: '10:07',
    avatar: undefined,
    isOnline: false,
    unreadCount: 1,
  },
  {
    id: '5',
    name: 'Мария Белкина',
    lastMessage: 'Документы отправила на почту, ...',
    time: '09:41',
    avatar: undefined,
    isOnline: false,
    unreadCount: 0,
  },
  {
    id: '6',
    name: 'Денис Волков',
    lastMessage: 'Спасибо за помощь ! 🙏',
    time: '08:15',
    avatar: undefined,
    isOnline: false,
    unreadCount: 1,
  },
  {
    id: '7',
    name: 'Софья Лебедева',
    lastMessage: 'Презентацию нужно на дораб...',
    time: '07:52',
    avatar: undefined,
    isOnline: false,
    unreadCount: 0,
  },
  {
    id: '8',
    name: 'Frontend Team',
    lastMessage: 'Релиз откладывался но начать...',
    time: 'Вчера',
    avatar: undefined,
    isOnline: false,
    unreadCount: 0,
  },
];

export default function ChatListComponent() {
  const params = useParams();
  const router = useRouter();
  const selectedChatId = params?.chatId as string;

  // Имитация загрузки
  const isLoading = false;

  const handleChatSelect = (chatId: string) => {
    // Используем Next.js router для бесшовной навигации
    router.push(`/chats/${chatId}`);
  };

  return (
    <ChatList
      items={mockChats}
      selectedId={selectedChatId}
      onSelect={handleChatSelect}
      loading={isLoading}
      skeletonCount={6}
      className='h-full'
    />
  );
}
