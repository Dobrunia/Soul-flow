'use client';

import { Avatar, IconBtn, Skeleton, DESIGN_TOKENS } from 'dobruniaui';
import { useSelector } from 'react-redux';
import {
  selectProfileLoading,
  selectUsername,
  selectUserAvatar,
  selectUserStatus,
} from '@/shared/store/profileSlice';
import { auth } from '@/shared/lib/supabase/Classes/authService';
import { useRouter } from 'next/navigation';
import SettingsModal from './Settings/SettingsModal';
import SearchModal from './Search/SearchModal';
import { useState } from 'react';

export default function Header() {
  const loading = useSelector(selectProfileLoading);
  const username = useSelector(selectUsername);
  const avatar = useSelector(selectUserAvatar);
  const status = useSelector(selectUserStatus);
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      console.log('Attempting to sign out...');
      await auth.signOutLocal();
      console.log('Sign out successful');
      router.push('/login');
    } catch (e) {
      console.error('Sign out failed', e);
    }
  };

  return (
    <header className='w-full h-[72px] px-[16px] py-[8px] border-b bg-[var(--c-bg-subtle)] border-[var(--c-border)]'>
      <div className='w-full h-full flex items-center justify-between'>
        {/* Avatar пользователя */}
        <div className='flex items-center space-x-3'>
          {!loading ? (
            <Avatar src={avatar} name={username} status={status} />
          ) : (
            <Skeleton
              variant='circular'
              width={DESIGN_TOKENS.baseHeight.medium}
              height={DESIGN_TOKENS.baseHeight.medium}
            />
          )}
          {!loading ? (
            <span className='font-medium'>{username}</span>
          ) : (
            <Skeleton width={100} height={DESIGN_TOKENS.baseHeight.tiny} />
          )}
        </div>

        {/* Кнопки действий */}
        <div className='flex items-center space-x-2'>
          <IconBtn
            icon='add'
            variant='ghost'
            title='Найти пользователей'
            onClick={() => setIsSearchOpen(true)}
          />
          <IconBtn
            icon='settings'
            variant='ghost'
            title='Настройки'
            onClick={() => setIsSettingsOpen(true)}
          />
          <IconBtn
            icon='exit'
            variant='ghost'
            title='Выйти'
            onClick={handleSignOut}
            iconColor='var(--c-error)'
          />
        </div>
      </div>

      {/* Модальное окно настроек */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Модальное окно поиска пользователей */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
