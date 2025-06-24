'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  isOnline?: boolean;
  unreadCount?: number;
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Добрыня',
    lastMessage: '',
    time: '',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Алиса Морозова',
    lastMessage: 'Отлично! Встречаемся завтра',
    time: '12:45',
    unreadCount: 2,
  },
  {
    id: '3',
    name: 'Максим Dev',
    lastMessage: 'Проверь последний коммит, там...',
    time: '11:23',
  },
  {
    id: '4',
    name: 'Артём Кузнецов',
    lastMessage: 'Кофе не забудь! ☕',
    time: '10:07',
    unreadCount: 1,
  },
  {
    id: '5',
    name: 'Мария Белкина',
    lastMessage: 'Документы отправила на почту, ...',
    time: '09:41',
  },
  {
    id: '6',
    name: 'Денис Волков',
    lastMessage: 'Спасибо за помощь ! 🙏',
    time: '08:15',
    unreadCount: 1,
  },
  {
    id: '7',
    name: 'Софья Лебедева',
    lastMessage: 'Презентацию нужно на дораб...',
    time: '07:52',
  },
  {
    id: '8',
    name: 'Frontend Team',
    lastMessage: 'Релиз откладывался но начать...',
    time: 'Вчера',
  },
];

export default function ChatList() {
  const params = useParams();
  const selectedChatId = params?.chatId;

  return (
    <div className='flex-1 overflow-y-auto'>
      {mockChats.map((chat) => (
        <Link key={chat.id} href={`/chats/${chat.id}`}>
          <div
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedChatId === chat.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className='flex items-center'>
              {/* Аватар */}
              <div className='relative'>
                <div className='w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-medium mr-3'>
                  {chat.name[0]}
                </div>
                {chat.isOnline && (
                  <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
                )}
              </div>

              {/* Содержимое */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between mb-1'>
                  <h3 className='font-medium text-gray-900 truncate'>{chat.name}</h3>
                  <div className='flex items-center ml-2'>
                    {chat.time && <span className='text-xs text-gray-500'>{chat.time}</span>}
                    {chat.unreadCount && (
                      <div className='ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
                {chat.lastMessage && (
                  <p className='text-sm text-gray-500 truncate'>{chat.lastMessage}</p>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
