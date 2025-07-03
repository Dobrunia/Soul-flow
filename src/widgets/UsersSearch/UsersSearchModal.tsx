'use client';

import { useState, useEffect } from 'react';
import { Modal, TextField, Row, LoadingSpinner, Alert, Avatar } from 'dobruniaui';
import { createBrowserClient } from '@/shared/lib/supabase';

interface UsersSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UsersSearchModal({ isOpen, onClose }: UsersSearchModalProps) {
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userSearch.trim()) {
      setUsers([]);
      return;
    }
    setLoading(true);
    const supabase = createBrowserClient();
    // Поиск по email и full_name (OR)
    supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .or(`email.ilike.%${userSearch}%,full_name.ilike.%${userSearch}%`)
      .limit(10)
      .then(({ data, error }) => {
        setUsers(data || []);
        setLoading(false);
      });
  }, [userSearch, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Найти пользователя'>
      <div className='flex flex-col gap-4 p-2'>
        <TextField
          label='Поиск пользователей'
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          helperText='Введите email или имя'
          autoFocus
        />
        <div className='mt-4 p-2 border-[var(--c-border)] border-[2px] rounded-[8px]'>
          {loading ? (
            <div className='flex justify-center'>
              <LoadingSpinner />
            </div>
          ) : users.length === 0 && userSearch.trim() ? (
            <Alert type='info'>Пользователь не найден</Alert>
          ) : (
            users.map((user) => (
              <Row
                key={user.id}
                left={
                  <Avatar
                    src={user.avatar_url}
                    name={user.full_name || user.email}
                    size='sm'
                    showStatus={false}
                  />
                }
                center={
                  <div>
                    <div className='font-medium'>{user.full_name || user.email}</div>
                    <div className='text-xs text-[var(--c-text-secondary)]'>{user.email}</div>
                  </div>
                }
                onClick={() => console.log(user)}
                centerJustify='left'
                className='rounded-[8px]'
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
