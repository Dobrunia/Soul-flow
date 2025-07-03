'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSupabaseBrowser } from '@/shared/lib/supabase';
import { setUser, Profile } from '@/shared/store/userSlice'; // экшен

const supabase = getSupabaseBrowser();

export default function UserInitializer() {
  const dispatch = useDispatch();

  /** Получаем профиль по ID (или null, если нет) */
  const fetchProfile = async (userId: string | null): Promise<Profile | null> => {
    if (!userId) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
    return data as Profile;
  };

  useEffect(() => {
    // 1. Первая загрузка
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const profile = await fetchProfile(user?.id ?? null);
      dispatch(setUser(profile)); // кладём профиль (или null)
    });

    // 2. Реакция на все события сессии
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = await fetchProfile(session?.user?.id ?? null);
      dispatch(setUser(profile));
    });

    // 3. Отписка
    return () => listener.subscription.unsubscribe();
  }, [dispatch, supabase]);

  return null; // компонент невидимка
}
