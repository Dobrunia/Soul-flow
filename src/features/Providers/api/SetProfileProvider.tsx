'use client';

import { useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { initializeProfile } from '@/shared/store/profileSlice';
import type { AppDispatch } from '@/shared/store';
import { statusService } from '@/shared/lib/supabase/Classes/realtime';

export function SetProfileProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Инициализируем профиль при монтировании компонента
    console.log('📍 Sending initial ping to set status online');
    statusService.sendPing().catch(console.error);
    dispatch(initializeProfile());
  }, [dispatch]);

  return <>{children}</>;
}
