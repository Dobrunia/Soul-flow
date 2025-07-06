'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, Skeleton, DESIGN_TOKENS, ActionsMenu, type ActionsMenuAction } from 'dobruniaui';

import { useSelector } from 'react-redux';
import { auth } from '@/shared/lib/supabase/Classes/authService'; // ← sign-out
import { useSetProfile } from '@/features/Providers/api/SetProfileProvider';
import { selectProfile } from '@/shared/store/profileSlice';
import { useRouter } from 'next/navigation';

export default function UserDropdown() {
  const profile = useSelector(selectProfile);
  const router = useRouter();
  const { loading } = useSetProfile(); // только флаг
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* закрываем меню при клике вне */
  useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [isOpen]);

  /* --------- пункт меню «Выйти» --------- */
  const menuItems: ActionsMenuAction[] = [
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
        {!loading && profile ? (
          <Avatar src={profile.avatar_url ?? ''} name={profile.username ?? ''} status={profile.status} />
        ) : (
          <Skeleton
            variant='circular'
            width={DESIGN_TOKENS.baseHeight.medium}
            height={DESIGN_TOKENS.baseHeight.medium}
          />
        )}

        {/* Имя / почта */}
        <div className='flex flex-col'>
          {!loading && profile ? (
            <>
              <span className='text-sm font-medium'>{profile.username}</span>
              <span className='text-xs text-[var(--c-text-secondary)]'>{profile.email}</span>
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
    </div>
  );
}
