'use client';

import Link from 'next/link';
import { Button, Card } from 'dobruniaui';
import { homePage } from '@/shared/variables/home.page';

export default function Home() {
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

          <div className='flex w-full justify-center'>
            <Link href={homePage}>
              <Button variant='primary' size='medium' outlined>
                Продолжить
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
