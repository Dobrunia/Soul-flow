'use client';

import { useEffect, ReactNode } from 'react';
import { auth } from '@/shared/lib/supabase/Classes/authService'; // экземпляр AuthService

/**
 * «Будильник» для одной вкладки:
 *  – при фокусе/появлении/online пробует refresh-токен;
 *  – если refresh не удался → локальный sign-out;
 *  – после операции восстанавливает WebSocket-канал Realtime.
 *
 * Не создаёт свой контекст, просто оборачивает детей.
 */
export function WakeUpProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const wakeUp = async () => {
      /* 1) пробуем обновить токен */
      const error = await auth.refresh();

      /* 2) если refresh не нужен → error === null
            если refresh упал (истёк refresh_token) → делаем локальный выход */
      if (error) await auth.signOutLocal();

      /* 3) на всякий случай восстанавливаем realtime-сокет */
      auth.supabase.realtime.connect();
    };

    const onVisible = () => document.visibilityState === 'visible' && wakeUp();

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', wakeUp);
    window.addEventListener('online', wakeUp);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', wakeUp);
      window.removeEventListener('online', wakeUp);
    };
  }, []);

  return <>{children}</>;
}
