'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { userService } from '@/shared/lib/supabase/Classes/userService'; // наследник SupabaseCore
import { setProfile, clearProfile } from '@/shared/store/profileSlice';

type SetProfileCtx = { loading: boolean };
const SetProfileContext = createContext<SetProfileCtx | undefined>(undefined);

export function SetProfileProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const profile = await userService.getMyProfile();
      if (profile) {
        dispatch(setProfile(profile));
      } else {
        dispatch(clearProfile());
      }

      setLoading(false);
    })();
  }, [dispatch]);

  return <SetProfileContext.Provider value={{ loading }}>{children}</SetProfileContext.Provider>;
}

export function useSetProfile() {
  const ctx = useContext(SetProfileContext);
  if (!ctx) throw new Error('useSetProfile должен использоваться внутри <SetProfileProvider>');
  return ctx;
}
