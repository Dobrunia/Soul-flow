'use client';

import { useState } from 'react';
import { Avatar, Skeleton, DESIGN_TOKENS, ActionsMenu, type ActionsMenuAction } from 'dobruniaui';

import { useSelector } from 'react-redux';
import { auth } from '@/shared/lib/supabase/Classes/authService';
import {
  selectProfileLoading,
  selectUsername,
  selectUserEmail,
  selectUserAvatar,
  selectUserStatus,
} from '@/shared/store/profileSlice';
import { useRouter } from 'next/navigation';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import SettingsModal from './Settings/SettingsModal';

export default function UserDropdown() {
  const loading = useSelector(selectProfileLoading);
  const username = useSelector(selectUsername);
  const email = useSelector(selectUserEmail);
  const avatar = useSelector(selectUserAvatar);
  const status = useSelector(selectUserStatus);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Используем кастомный хук для обработки кликов вне элемента
  const dropdownRef = useClickOutside<HTMLDivElement>(isOpen, () => setIsOpen(false));

  const menuItems: ActionsMenuAction[] = [
    {
      label: 'Настройки',
      icon: (
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
        </svg>
      ),
      onClick: () => {
        setIsSettingsOpen(true);
        setIsOpen(false);
      },
    },
    {
      label: 'Выйти',
      icon: (
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
          />
        </svg>
      ),
      onClick: async () => {
        try {
          console.log('Attempting to sign out...');
          await auth.signOutLocal(); // ← вызов сервиса
          console.log('Sign out successful');
          router.push('/login');
        } catch (e) {
          console.error('Sign out failed', e);
        } finally {
          setIsOpen(false);
        }
      },
      type: 'destructive',
    },
  ];

  return (
    <div className='relative' ref={dropdownRef}>
      {/* триггер */}
      <div
        className='flex items-center space-x-3 cursor-pointer p-2 rounded-md
                   hover:bg-[var(--c-bg-elevated)] transition-colors'
        onClick={() => setIsOpen((o) => !o)}
      >
        {/* Аватар */}
        {!loading ? (
          <Avatar src={avatar} name={username} status={status} />
        ) : (
          <Skeleton
            variant='circular'
            width={DESIGN_TOKENS.baseHeight.medium}
            height={DESIGN_TOKENS.baseHeight.medium}
          />
        )}

        {/* Имя / почта */}
        <div className='flex flex-col'>
          {!loading ? (
            <>
              <span className='text-sm font-medium'>{username}</span>
              <span className='text-xs text-[var(--c-text-secondary)]'>{email}</span>
            </>
          ) : (
            <>
              <Skeleton width={90} height={DESIGN_TOKENS.baseHeight.tiny} />
              <Skeleton width={118} height={DESIGN_TOKENS.baseHeight.tiny} />
            </>
          )}
        </div>

        {/* стрелка */}
        <svg
          className={`w-4 h-4 text-[var(--c-text-secondary)] transition-transform ${
            isOpen ? 'rotate-0' : '-rotate-90'
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </div>

      {/* dropdown */}
      {isOpen && (
        <ActionsMenu items={menuItems} onClose={() => setIsOpen(false)} className='mt-1 w-full!' />
      )}

      {/* Модальное окно настроек */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
