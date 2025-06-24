'use client';

import { createBrowserClient } from '@/shared/lib/supabase';
import { Button } from 'dobruniaui';

export default function LogoutButton() {
  const handleSignOut = async () => {
    console.log('Начинаем процесс выхода...');

    try {
      const supabase = createBrowserClient();
      console.log('Supabase клиент создан');

      const { error } = await supabase.auth.signOut();
      console.log('Результат signOut:', { error });

      if (error) {
        console.error('Logout error:', error);
        return;
      }

      console.log('Выход успешен, перенаправляем...');
      // Принудительная перезагрузка всей страницы для очистки состояния
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button onClick={handleSignOut} variant='warning' size='medium'>
      Выйти
    </Button>
  );
}
