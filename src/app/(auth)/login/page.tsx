'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/shared/lib/supabase';
import { Card, TextField, Button, Alert } from 'dobruniaui';
import { homePage } from '@/shared/variables/home.page';

const supabase = getSupabaseBrowser();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validation states
  const [emailError, setEmailError] = useState('');

  // Dynamic validation
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Введите корректный email');
    } else {
      setEmailError('');
    }
  }, [email]);

  const isFormValid = email && password && !emailError;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim values
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Final validation
    if (!trimmedEmail) {
      setError('Email обязателен');
      return;
    }
    if (!trimmedPassword) {
      setError('Пароль обязателен');
      return;
    }
    if (emailError) {
      setError('Исправьте ошибки в форме');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) throw error;

      // Принудительная перезагрузка для обновления состояния и активации middleware
      window.location.href = homePage;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant='elevated'>
      <div className='text-center mb-6'>
        <h2 className='font-h'>Войти в аккаунт</h2>
        <Link href='/register' className='font-medium hover:underline text-[var(--c-accent)]'>
          создать новый аккаунт
        </Link>
      </div>

      <form onSubmit={handleLogin} className='space-y-4'>
        {error && (
          <Alert type='error' className='font-small-plus'>
            {error}
          </Alert>
        )}

        <TextField
          label='Email *'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          helperText={emailError || 'Введите ваш email'}
          error={!!emailError}
          required
        />

        <TextField
          label='Пароль *'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText='Введите пароль'
          required
        />

        <Button
          type='submit'
          variant='primary'
          size='medium'
          isLoading={loading}
          disabled={loading || !isFormValid}
          fullWidth
        >
          {loading ? 'Вход...' : 'Войти'}
        </Button>
      </form>
    </Card>
  );
}
