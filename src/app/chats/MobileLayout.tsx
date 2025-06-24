'use client';

import { useParams } from 'next/navigation';
import ChatList from '../../widgets/ChatList/ChatList';
import Search from '../../features/SearchInput';
import BackButton from './BackButton';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const params = useParams();
  const chatId = params?.chatId as string;
  const isInChat = !!chatId;

  return (
    <div className='md:hidden flex flex-1 flex-col h-[calc(100vh-72px)]'>
      {!isInChat ? (
        /* Мобильный список чатов */
        <div className='flex flex-col h-full bg-[var(--c-bg-subtle)]'>
          {/* Поиск по чатам */}
          <Search />

          {/* Список чатов */}
          <ChatList />
        </div>
      ) : (
        /* Мобильный чат с кнопкой назад */
        <div className='flex flex-col h-[calc(100vh-118px)] bg-[var(--c-bg-default)]'>
          {/* Шапка с кнопкой назад */}
          <BackButton />

          {/* Контент чата */}
          <>{children}</>
        </div>
      )}
    </div>
  );
}
