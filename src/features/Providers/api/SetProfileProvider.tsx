'use client';

import { useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { initializeProfile } from '@/shared/store/profileSlice';
import type { AppDispatch } from '@/shared/store';

export function SetProfileProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Инициализируем профиль при монтировании компонента
    dispatch(initializeProfile());
  }, [dispatch]);

  return <>{children}</>;
}
