'use client';

import { useParams } from 'next/navigation';
import BackButton from './BackButton';
import ChatListBlock from '@/widgets/ChatListBlock/ChatListBlock';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const params = useParams();
  const chatId = params?.chatId as string;
  const isInChat = !!chatId;

  return (
    <div className='md:hidden w-full flex flex-1 flex-col h-[calc(100vh-72px)]'>
      {!isInChat ? (
        /* Мобильный список чатов */
        <div className='flex flex-col w-full h-full bg-[var(--c-bg-subtle)]'>
          <ChatListBlock />
        </div>
      ) : (
        /* Мобильный чат с кнопкой назад */
        <div className='flex flex-col h-full bg-[var(--c-bg-default)]'>
          {/* Шапка с кнопкой назад */}
          <BackButton />

          {/* Контент чата */}
          <>{children}</>
        </div>
      )}
    </div>
  );
}
