import React from 'react';
import ChatListBlock from '@/widgets/ChatListBlock/ChatListBlock';
import MobileLayout from './MobileLayout';
import Header from '@/widgets/Header/Header';
import AppProviders from '@/features/Providers/Providers';

interface ChatsLayoutProps {
  children: React.ReactNode;
}

export default function ChatsLayout({ children }: ChatsLayoutProps) {
  return (
    <AppProviders>
      <Header />
      <div className='flex h-[calc(100vh-72px)]'>
        {/* Desktop Layout */}
        <div className='hidden md:flex flex-1'>
          {/* Sidebar с списком чатов */}
          <ChatListBlock />
          <div className='flex-1 flex flex-col bg-[var(--c-bg-default)]'>{children}</div>
        </div>

        {/* Mobile Layout */}
        <MobileLayout>{children}</MobileLayout>
      </div>
    </AppProviders>
  );
}
