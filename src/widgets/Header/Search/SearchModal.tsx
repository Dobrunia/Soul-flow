'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Avatar, Skeleton, DESIGN_TOKENS, Row, SearchInput } from 'dobruniaui';
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Автоматический фокус при открытии модального окна
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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
    <Modal isOpen={isOpen} onClose={onClose} title='Поиск пользователей' className='min-h-[380px]'>
      <div className='space-y-4'>
        {/* Поисковая строка */}
        <SearchInput
          ref={searchInputRef}
          placeholder='Введите имя пользователя...'
          value={searchQuery}
          onChange={setSearchQuery}
          className='bg-[var(--c-bg-default)]!'
        />

        {/* Результаты поиска */}
        <div className='max-h-96 overflow-y-auto space-y-2'>
          {loading ? (
            // Skeleton загрузки
            Array.from({ length: 3 }).map((_, index) => (
              <Row
                key={index}
                centerJustify='left'
                left={
                  <Skeleton
                    variant='circular'
                    width={DESIGN_TOKENS.baseHeight.medium}
                    height={DESIGN_TOKENS.baseHeight.medium}
                  />
                }
                center={
                  <div className='flex flex-col gap-1'>
                    <Skeleton width={120} height={DESIGN_TOKENS.baseHeight.tiny} />
                    <Skeleton width={180} height={DESIGN_TOKENS.baseHeight.tiny} />
                  </div>
                }
                right={
                  <Skeleton
                    variant='rectangular'
                    width={113}
                    height={DESIGN_TOKENS.baseHeight.medium}
                    className='rounded-md!'
                  />
                }
                className='p-2 rounded-md'
              />
            ))
          ) : error ? (
            // Ошибка
            <div className='text-center text-[var(--c-text-secondary)] py-4'>{error}</div>
          ) : users.length > 0 ? (
            // Список пользователей
            users.map((user) => (
              <Row
                key={user.id}
                centerJustify='left'
                left={
                  <Avatar
                    src={user.avatar_url || undefined}
                    name={user.username}
                    status={user.status}
                    size='md'
                  />
                }
                center={
                  <div className='flex flex-col items-start'>
                    <div className='font-medium text-[var(--c-text-primary)]'>{user.username}</div>
                    <div className='text-sm text-[var(--c-text-secondary)]'>{user.email}</div>
                  </div>
                }
                right={
                  <Button
                    variant='primary'
                    title='Начать чат'
                    onClick={() => handleUserSelect(user)}
                    fullWidth
                    size='medium'
                  >
                    Начать чат
                  </Button>
                }
                className='p-2 rounded-md hover:bg-[var(--c-bg-elevated)] transition-colors'
              />
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
