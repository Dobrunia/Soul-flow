'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Avatar, Skeleton, DESIGN_TOKENS } from 'dobruniaui';
import { useSelector } from 'react-redux';
import { selectProfile } from '@/shared/store/profileSlice';
import { userService } from '@/shared/lib/supabase/Classes/userService';
import type { Profile } from '@/types/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const me = useSelector(selectProfile);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Поиск пользователей
  const searchUsers = async (query: string) => {
    if (!query.trim() || !me?.id) return;

    setLoading(true);
    setError(null);

    try {
      const results = await userService.searchUsers(query, me.id);
      setUsers(results);
    } catch (err) {
      setError('Не удалось найти пользователей');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Обработка поиска с debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, me?.id]);

  const handleUserSelect = (user: Profile) => {
    // TODO: Создать чат с пользователем
    console.log('Selected user:', user);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Поиск пользователей'>
      <div className='space-y-4'>
        {/* Поисковая строка */}
        <input
          type='text'
          placeholder='Введите имя пользователя...'
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className='w-full px-3 py-2 border border-[var(--c-border)] rounded-md bg-[var(--c-bg-default)] text-[var(--c-text-primary)] placeholder-[var(--c-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]'
          autoFocus
        />

        {/* Результаты поиска */}
        <div className='max-h-96 overflow-y-auto space-y-2'>
          {loading ? (
            // Skeleton загрузки
            Array.from({ length: 1 }).map((_, index) => (
              <div key={index} className='flex items-center space-x-3 p-2 rounded-md'>
                <Skeleton
                  variant='circular'
                  width={DESIGN_TOKENS.baseHeight.medium}
                  height={DESIGN_TOKENS.baseHeight.medium}
                />
                <div className='flex flex-col gap-1'>
                  <Skeleton width={120} height={DESIGN_TOKENS.baseHeight.tiny} />
                  <Skeleton width={180} height={DESIGN_TOKENS.baseHeight.tiny} />
                </div>
              </div>
            ))
          ) : error ? (
            // Ошибка
            <div className='text-center text-[var(--c-text-secondary)] py-4'>{error}</div>
          ) : users.length > 0 ? (
            // Список пользователей
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className='w-full flex items-center space-x-3 p-2 rounded-md hover:bg-[var(--c-bg-elevated)] transition-colors text-left'
              >
                <Avatar
                  src={user.avatar_url || undefined}
                  name={user.username}
                  status={user.status}
                  size='md'
                />
                <div className='flex-1'>
                  <div className='font-medium text-[var(--c-text-primary)]'>{user.username}</div>
                  <div className='text-sm text-[var(--c-text-secondary)]'>{user.email}</div>
                </div>
              </button>
            ))
          ) : searchQuery.trim() ? (
            // Нет результатов
            <div className='text-center text-[var(--c-text-secondary)] py-4'>
              Пользователи не найдены
            </div>
          ) : (
            // Начальное состояние
            <div className='text-center text-[var(--c-text-secondary)] py-4'>
              Введите имя пользователя для поиска
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
