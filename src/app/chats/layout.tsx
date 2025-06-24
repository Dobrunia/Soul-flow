import React from 'react';
import ChatList from './components/ChatList';

interface ChatsLayoutProps {
  children: React.ReactNode;
}

export default function ChatsLayout({ children }: ChatsLayoutProps) {
  return (
    <div className='flex flex-1 h-full'>
      {/* Sidebar с списком чатов */}
      <div className='w-80 border-r border-gray-200 flex flex-col'>
        {/* Заголовок */}
        <div className='p-4 border-b border-gray-200'>
          <h1 className='text-xl font-semibold text-[var(--c-text-primary)]'>Чаты</h1>
        </div>

        {/* Список чатов */}
        <ChatList />
      </div>

      {/* Основной контент - история сообщений */}
      <div className='flex-1 flex flex-col'>{children}</div>
    </div>
  );
}
