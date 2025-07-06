'use client';

import { Modal, TextField, Row, LoadingSpinner, Alert, Avatar } from 'dobruniaui';
import { useEffect, useRef, useState } from 'react';

import { userService } from '@/shared/lib/supabase/Classes/userService';
import { useSelector } from 'react-redux';

type Status = 'idle' | 'loading' | 'success' | 'empty' | 'error';

const useDebounce = <T,>(v: T, d = 300) => {
  const [deb, setDeb] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setDeb(v), d);
    return () => clearTimeout(t);
  }, [v, d]);
  return deb;
};

export default function UsersSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  /* свой профиль уже в Redux */
  const meId = useSelector((s: any) => s.profile.id) as string | undefined;

  const [query, setQuery] = useState('');
  const q = useDebounce(query.trim(), 300);

  const [users, setUsers] = useState<any[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const reqId = useRef(0); // отменяем устаревшие запросы

  /* поиск */
  useEffect(() => {
    if (!q) {
      setStatus('idle');
      setUsers([]);
      return;
    }

    const id = ++reqId.current;
    setStatus('loading');

    (async () => {
      try {
        const data = await userService.searchUsers(q, meId);

        if (id !== reqId.current) return; // пришёл старый ответ

        if (!data.length) {
          setStatus('empty');
          setUsers([]);
        } else {
          setStatus('success');
          setUsers(data);
        }
      } catch (e) {
        console.error('[search]', e);
        setStatus('error');
      }
    })();
  }, [q, meId]);

  const content = (() => {
    switch (status) {
      case 'loading':
        return (
          <div className='flex justify-center h-full items-center'>
            <LoadingSpinner />
          </div>
        );
      case 'empty':
        return <Alert type='info'>Ничего не найдено</Alert>;
      case 'error':
        return <Alert type='error'>Ошибка поиска, попробуйте позже</Alert>;
      case 'success':
        return users.map((u) => (
          <Row
            key={u.id}
            left={<Avatar src={u.avatar_url} name={u.username} size='sm' showStatus={false} />}
            center={
              <div>
                <div className='font-medium'>{u.username}</div>
                <div className='text-xs text-[var(--c-text-secondary)]'>{u.email}</div>
              </div>
            }
            onClick={() => console.log(u)}
            centerJustify='left'
            className='rounded-[8px]'
          />
        ));
      default:
        return null;
    }
  })();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Найти пользователя'>
      <div className='flex flex-col gap-4 p-2'>
        <TextField
          label='Поиск пользователей'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          helperText='Введите имя пользователя'
          autoFocus
          autoComplete={false}
        />
        <div
          className='mt-4 p-2 border-[var(--c-border)] border-2 rounded-[8px]
                     overflow-y-auto min-h-[160px] max-h-[320px] h-[240px]'
        >
          {content}
        </div>
      </div>
    </Modal>
  );
}
