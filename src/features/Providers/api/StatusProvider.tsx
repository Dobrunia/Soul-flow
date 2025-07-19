'use client';

import { useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import { statusService } from '@/shared/lib/supabase/Classes/realtime';

export function StatusProvider({ children }: { children: ReactNode }) {
  const profile = useSelector((state: RootState) => state.profile.profile);

  useEffect(() => {
    // Запускаем пинг только если пользователь авторизован
    if (profile?.id) {
      console.log('🟢 Starting status ping for user:', profile.username);
      statusService.startPinging();

      // Останавливаем пинг при размонтировании или выходе
      return () => {
        console.log('🔴 Stopping status ping');
        statusService.stopPinging();
      };
    }
  }, [profile?.id]);

  return <>{children}</>;
}
