'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, SupabaseUser } from '@/shared/store/userSlice';
import { createBrowserClient } from '@/shared/lib/supabase';

export default function UserInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      dispatch(setUser(user as SupabaseUser | null));
    };
    checkUser();
  }, [dispatch]);

  return null;
}
