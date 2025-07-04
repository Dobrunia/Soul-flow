'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSupabaseBrowser } from '@/shared/lib/supabase';
import { selectUser, setUser } from '@/shared/store/userSlice';
import type { Presence } from 'dobruniaui';

const IDLE_MS = 15 * 60 * 1_000; // ⏱ 15 минут
/**
 * StatusInitializer ― «невидимый» компонент-сторож
 *
 * ▸ При первом рендере помечает профиль как **online**.
 * ▸ Слушает пользовательские события (`mousemove`, `keydown`, `scroll`, `touchstart`):
 *     - любая активность ▸ сбрасывает 15-минутный таймер «бездействия»;
 *     - если ранее был *offline*, сразу ставит **online**.
 * ▸ По прошествии **15 минут** абсолютной тишины автоматически пишет **offline**
 *   (не трогает `dnd` / `invisible`, если пользователь выбрал их вручную).
 * ▸ Сворачивание/раскрытие вкладки:
 *     - `visibilitychange → hidden`  ▸ **offline**
 *     - `visibilitychange → visible` ▸ **online** и сброс таймера.
 * ▸ Перед закрытием или размонтированием компонента гарантированно пишет **offline**.
 * ▸ После каждого удачного апдейта синхронизирует Redux-стор через `setUser`.
 *
 * Подключать **один раз** в `RootLayout`, сразу после `UserInitializer`.
 */
export default function StatusInitializer() {
  const me = useSelector(selectUser);
  const dispatch = useDispatch();
  const supabase = getSupabaseBrowser();

  /* актуальный статус без повторных замыканий */
  const statusRef = useRef<Presence>('offline');
  useEffect(() => {
    if (me?.status) statusRef.current = me.status;
  }, [me?.status]);

  /* --- helper обновления --- */
  const changeStatus = useCallback(
    async (next: Presence) => {
      if (!me?.id || statusRef.current === next) return;

      const { data, error } = await supabase
        .from('profiles')
        .update({ status: next })
        .eq('id', me.id)
        .select('status')
        .single();

      if (!error && data) {
        statusRef.current = data.status as Presence;
        dispatch(setUser({ ...me, status: statusRef.current }));
      }
    },
    [dispatch, me, supabase]
  );

  /* --- idle-таймер + события --- */
  useEffect(() => {
    if (!me?.id) return;

    /* перезапускаем 15-минутный таймер */
    let idleTimer: NodeJS.Timeout | null = null;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        /* переводим в offline, только если пользователь был online */
        if (statusRef.current === 'online') changeStatus('offline');
      }, IDLE_MS);
    };

    /* любая активность во вкладке */
    const onActivity = () => {
      if (statusRef.current === 'offline') changeStatus('online');
      resetIdle();
    };

    /* запуск */
    changeStatus('online');
    resetIdle();

    const EVENTS: (keyof DocumentEventMap)[] = ['mousemove', 'keydown', 'scroll', 'touchstart'];
    EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));

    /* visibility */
    const onVisibility = () =>
      changeStatus(document.visibilityState === 'visible' ? 'online' : 'offline');
    document.addEventListener('visibilitychange', onVisibility);

    /* уход со страницы */
    const onBeforeUnload = () =>
      supabase.from('profiles').update({ status: 'offline' }).eq('id', me.id);
    window.addEventListener('beforeunload', onBeforeUnload);

    /* cleanup */
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
      supabase.from('profiles').update({ status: 'offline' }).eq('id', me.id);
    };
  }, [me?.id, changeStatus, supabase]);

  return null;
}
