'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card } from 'dobruniaui';
import { getSupabaseBrowser } from '@/shared/lib/supabase';
import { homePage } from '@/shared/variables/home.page';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, selectUser, Profile } from '@/shared/store/userSlice';

const supabase = getSupabaseBrowser();

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        dispatch(setUser(user as Profile | null));
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [dispatch]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Card variant='elevated' className='text-center max-w-md w-full bg-[var(--c-bg-subtle)]'>
          <div className='py-8 px-6'>
            <p className='font-medium'>Загрузка...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Если пользователь авторизован
  if (user) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Card variant='elevated' className='text-center max-w-md w-full bg-[var(--c-bg-subtle)]'>
          <div className='py-8 px-6'>
            <h1 className='font-h mb-4'>
              Привет, <span className='text-[var(--c-accent)]'>{user.email}</span>!
            </h1>

            <p className='font-medium mb-8 text-[var(--c-text-secondary)]'>
              Вы успешно авторизованы в Soul Flow
            </p>

            <div className='flex w-full gap-3 justify-center'>
              <Link href={homePage}>
                <Button variant='primary' size='medium'>
                  Продолжить
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Если пользователь не авторизован
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

          <div className='flex w-full gap-3 justify-center'>
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
