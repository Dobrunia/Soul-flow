'use client';

import { Modal, TextField, Row, LoadingSpinner, Alert, Avatar } from 'dobruniaui';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSupabaseBrowser } from '@/shared/lib/supabase';
import { selectUser } from '@/shared/store/userSlice';

const supabase = getSupabaseBrowser();

type Status = 'idle' | 'loading' | 'success' | 'empty' | 'error';

interface UsersSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* debounce ↓ */
function useDebounce<T>(value: T, delay = 300): T {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return deb;
}
/* ───────── */

export default function UsersSearchModal({ isOpen, onClose }: UsersSearchModalProps) {
  const me = useSelector(selectUser); // ← текущий пользователь
  const [query, setQuery] = useState('');
  const q = useDebounce(query.trim(), 300);

  const [users, setUsers] = useState<any[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const requestId = useRef(0);

  useEffect(() => {
    if (!q) {
      setUsers([]);
      setStatus('idle');
      return;
    }

    const current = ++requestId.current;
    setStatus('loading');

    let req = supabase
      .from('profiles')
      .select('id, email, username, avatar_url')
      .ilike('username', `%${q}%`)
      .limit(10);

    if (me?.id) req = req.neq('id', me.id); // <-- исключаем себя

    req.then(({ data, error }) => {
      if (current !== requestId.current) return; // устаревший ответ
      if (error) {
        console.error(error);
        setStatus('error');
        setUsers([]);
        return;
      }
      if (!data || data.length === 0) {
        setStatus('empty');
        setUsers([]);
      } else {
        setStatus('success');
        setUsers(data);
      }
    });
  }, [q, me?.id]);

  /* UI ↓ */
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
        return null; // idle
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

        <div className='mt-4 p-2 border-[var(--c-border)] border-2 rounded-[8px] overflow-y-auto min-h-[160px] max-h-[320px] h-[240px]'>
          {content}
        </div>
      </div>
    </Modal>
  );
}
