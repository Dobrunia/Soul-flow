import React from 'react';
import ChatList from '../../widgets/ChatList/ChatList';
import Search from '../../features/SearchInput';
interface ChatsLayoutProps {
  children: React.ReactNode;
}

export default function ChatsLayout({ children }: ChatsLayoutProps) {
  return (
    <div className='flex flex-1 h-[calc(100vh-72px)]'>
      {/* Sidebar с списком чатов */}
      <div className='w-80 flex flex-col bg-[var(--c-bg-subtle)]'>
        {/* Поиск по чатам */}
        <div className='p-4 border-b border-r border-[var(--c-border)]'>
          <Search />
        </div>

        {/* Список чатов */}
        <ChatList />
      </div>

      {/* Основной контент - история сообщений */}
      <div className='flex-1 flex flex-col bg-[var(--c-bg-default)]'>{children}</div>
    </div>
  );
}
