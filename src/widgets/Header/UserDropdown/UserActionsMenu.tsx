'use client';

import { ActionsMenu } from 'dobruniaui';
import { getSupabaseBrowser } from '@/shared/lib/supabase';
import { useDispatch } from 'react-redux';
import { clearUser, selectUser } from '@/shared/store/userSlice';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux';

interface UserActionsMenuProps {
  onClose: () => void;
}

export default function UserActionsMenu({ onClose }: UserActionsMenuProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);
  const [busy, setBusy] = useState(false);

  const handleSignOut = async () => {
    if (busy) return;
    setBusy(true);

    const supabase = getSupabaseBrowser();

    try {
      /* 1️⃣  помечаем себя offline, пока ещё есть auth */
      if (user?.id) {
        await supabase.from('profiles').update({ status: 'offline' }).eq('id', user.id);
      }

      /* 2️⃣  выходим из Supabase */
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        setBusy(false);
        return;
      }

      /* 3️⃣  чистим локальный профиль + закрываем меню + редирект */
      dispatch(clearUser());
      onClose();
      router.replace('/login');
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setBusy(false);
    }
  };

  const menuItems = [
    {
      label: busy ? 'Выходим…' : 'Выйти',
      disabled: busy,
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
      onClick: handleSignOut,
      type: 'destructive' as const,
    },
  ];

  return <ActionsMenu items={menuItems} onClose={onClose} className='mt-1 w-full!' />;
}
