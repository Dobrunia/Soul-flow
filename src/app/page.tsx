'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Card, Button, LoadingSpinner } from 'dobruniaui';
import { supabase } from '@/shared/lib/supabase/client'; // singleton-клиент
import { homePage } from '@/shared/variables/home.page';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true); // пока читаем cookie

  useEffect(() => {
    (async () => {
      /* локально читаем JWT из куки (без network-запроса) */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.replace(homePage); // авторизован → /chats
      } else {
        setChecking(false); // гость остался на лэндинге
      }
    })();
  }, [router]);

  /* маленький спиннер, пока идёт быстрая проверка */
  if (checking)
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='large' />
      </div>
    );

  /* карточка только для неавторизованных */
  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <Card variant='elevated' className='text-center max-w-md w-full bg-[var(--c-bg-subtle)]'>
        <div className='py-8 px-6'>
          <h1 className='font-h mb-4'>
            Добро пожаловать в<span className='text-[var(--c-accent)]'> Soul Flow</span>
          </h1>

          <p className='font-medium mb-8 text-[var(--c-text-secondary)]'>
            Современное приложение с полной системой аутентификации
          </p>

          <div className='flex w-full justify-center gap-3'>
            <Link href='/login'>
              <Button variant='ghost' size='medium'>
                Войти
              </Button>
            </Link>
            <Link href='/register'>
              <Button variant='primary' size='medium' outlined>
                Регистрация
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
