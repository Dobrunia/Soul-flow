'use client';

import { useParams, notFound } from 'next/navigation';
import { Message, MessageContainer, Avatar, Row } from 'dobruniaui';
import MessageInput from './MessageInput';

interface MessageData {
  id: string;
  type: 'incoming' | 'outgoing';
  text: string;
  time: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  isRead?: boolean;
}

// Валидация chatId
const isValidChatId = (chatId: string): boolean => {
  // Только буквы, цифры, дефис, подчеркивание, длина 1-50
  const chatIdRegex = /^[a-zA-Z0-9_-]{1,50}$/;
  return chatIdRegex.test(chatId);
};

// Проверка доступа к чату (mock)
const hasAccessToChat = (chatId: string, userId: string): boolean => {
  // TODO: Реальная проверка через API
  // Например, проверка что пользователь является участником чата
  const allowedChats = ['1', '2', '3', 'general', 'team-chat'];
  return allowedChats.includes(chatId);
};

const mockMessages: MessageData[] = [
  {
    id: '1',
    type: 'incoming',
    text: 'Привет! Как дела?',
    time: '12:30',
    sender: {
      id: '2',
      name: 'Собеседник',
    },
    isRead: true,
  },
  {
    id: '2',
    type: 'outgoing',
    text: 'Отлично! А у тебя?',
    time: '12:32',
    isRead: true,
  },
  {
    id: '3',
    type: 'incoming',
    text: 'Тоже хорошо! Работаю над новым проектом',
    time: '12:35',
    sender: {
      id: '2',
      name: 'Собеседник',
    },
    isRead: false,
  },
  {
    id: '4',
    type: 'outgoing',
    text: 'Интересно! Расскажи подробнее',
    time: '12:36',
    isRead: true,
  },
  {
    id: '5',
    type: 'incoming',
    text: 'Это веб-приложение на React и Next.js. Использую новую библиотеку компонентов dobruniaui',
    time: '12:38',
    sender: {
      id: '2',
      name: 'Собеседник',
    },
    isRead: true,
  },
  {
    id: '6',
    type: 'outgoing',
    text: 'Звучит круто! 🚀',
    time: '12:39',
    isRead: true,
  },
  {
    id: '7',
    type: 'incoming',
    text: 'Да, компоненты очень красивые и функциональные. Есть чаты, сообщения, реакции...',
    time: '12:41',
    sender: {
      id: '2',
      name: 'Собеседник',
    },
    isRead: true,
  },
  {
    id: '8',
    type: 'outgoing',
    text: 'А что с производительностью?',
    time: '12:42',
    isRead: true,
  },
  {
    id: '9',
    type: 'incoming',
    text: 'Отличная! Автоматический инжект CSS, никаких лишних зависимостей',
    time: '12:44',
    sender: {
      id: '2',
      name: 'Собеседник',
    },
    isRead: true,
  },
  {
    id: '10',
    type: 'outgoing',
    text: 'Можешь скинуть ссылку на документацию?',
    time: '12:45',
    isRead: true,
  },
  {
    id: '11',
    type: 'incoming',
    text: 'Конечно! https://www.npmjs.com/package/dobruniaui',
    time: '12:46',
    sender: {
      id: '2',
      name: 'Собеседник',
    },
    isRead: true,
  },
  {
    id: '12',
    type: 'outgoing',
    text: 'Спасибо! Обязательно изучу 📚',
    time: '12:47',
    isRead: true,
  },
  {
    id: '13',
    type: 'incoming',
    text: 'Кстати, у них есть поддержка тем и CSS переменных',
    time: '12:49',
    sender: {
      id: '2',
      name: 'Собеседник',
    },
    isRead: true,
  },
  {
    id: '14',
    type: 'outgoing',
    text: 'Это то что нужно! Наш дизайнер будет в восторге 🎨',
    time: '12:50',
    isRead: true,
  },
  {
    id: '15',
    type: 'incoming',
    text: 'А еще компоненты поддерживают TypeScript из коробки',
    time: '12:52',
    sender: {
      id: '2',
      name: 'Собеседник',
    },
    isRead: true,
  },
  {
    id: '16',
    type: 'outgoing',
    text: 'Perfect! Это решает многие проблемы 💯',
    time: '12:53',
    isRead: true,
  },
  {
    id: '17',
    type: 'incoming',
    text: 'Да, и автокомплит работает отлично. IntelliSense показывает все пропсы',
    time: '12:55',
    sender: {
      id: '2',
      name: 'Собеседник',
    },
    isRead: true,
  },
  {
    id: '18',
    type: 'outgoing',
    text: 'Когда планируешь запуск проекта?',
    time: '12:56',
    isRead: true,
  },
  {
    id: '19',
    type: 'incoming',
    text: 'Через пару недель должна быть первая версия. Сейчас дорабатываю аутентификацию через Supabase',
    time: '12:58',
    sender: {
      id: '2',
      name: 'Собеседник',
    },
    isRead: true,
  },
  {
    id: '20',
    type: 'outgoing',
    text: 'Отличный выбор! Supabase + Next.js - мощная связка 🔥',
    time: '13:00',
    isRead: false,
  },
];

export default function ChatPage() {
  const params = useParams();
  const rawChatId = params?.chatId as string;

  // Валидация chatId
  if (!rawChatId || !isValidChatId(rawChatId)) {
    notFound(); // Показать 404 страницу
  }

  const chatId = rawChatId;
  const currentUserId = '1'; // TODO: Получить из контекста аутентификации

  // Проверка доступа к чату
  if (!hasAccessToChat(chatId, currentUserId)) {
    notFound(); // Или можно редиректить на страницу ошибки доступа
  }

  const handleSendMessage = (message: string) => {
    console.log('Отправка сообщения:', message);
    // TODO: Добавить сообщение в массив и отправить на сервер
  };

  const handleReaction = (emoji: string, messageId: string) => {
    console.log('Реакция:', emoji, 'на сообщение:', messageId);
    // TODO: Добавить реакцию к сообщению
  };

  return (
    <div className='flex-1 flex flex-col bg-[var(--c-bg-default)] h-full'>
      {/* Шапка чата */}
      <Row
        left={<Avatar name={`Чат ${chatId}`} size='md' status='online' showStatus />}
        center={
          <div className='align-left w-full'>
            <h2 className='font-medium'>Чат #{chatId}</h2>
            <p className='text-sm text-[var(--c-text-secondary)]'>онлайн</p>
          </div>
        }
        className='bg-[var(--c-bg-subtle)] border-b border-[var(--c-border)]'
      />

      {/* История сообщений */}
      <MessageContainer
        autoScrollToBottom={true}
        lastMessageId={mockMessages[mockMessages.length - 1]?.id}
      >
        {mockMessages.map((msg) => (
          <Message
            key={msg.id}
            type={msg.type}
            text={msg.text}
            time={msg.time}
            sender={msg.sender}
            isRead={msg.isRead}
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
