'use client';

import { ActionsMenu } from 'dobruniaui';
import { createBrowserClient } from '@/shared/lib/supabase';

interface UserActionsMenuProps {
  onClose: () => void;
}

export default function UserActionsMenu({ onClose }: UserActionsMenuProps) {
  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        return;
      }

      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
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
      onClick: handleSignOut,
      type: 'destructive' as const,
    },
  ];

  return <ActionsMenu items={menuItems} onClose={onClose} className='mt-1 w-full!' />;
}
