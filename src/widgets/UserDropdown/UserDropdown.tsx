'use client';

import { useState, useRef, useEffect } from 'react';
import UserActionsMenu from './UserActionsMenu';

interface UserDropdownProps {
  userName: string;
  userEmail: string;
}

export default function UserDropdown({ userName, userEmail }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Информация о пользователе - триггер для клика */}
      <div
        className='flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-[var(--c-bg-elevated)] transition-colors'
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Аватар */}
        <div className='w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-[var(--c-text-inverse)] bg-[var(--c-accent)]'>
          {userName[0]?.toUpperCase()}
        </div>

        {/* Имя пользователя */}
        <div className='flex flex-col'>
          <span className='text-sm font-medium text-[var(--c-text-primary)]'>{userName}</span>
          <span className='text-xs text-[var(--c-text-secondary)]'>{userEmail}</span>
        </div>

        {/* Стрелка */}
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

      {/* Dropdown меню */}
      {isOpen && <UserActionsMenu onClose={() => setIsOpen(false)} />}
    </div>
  );
}
