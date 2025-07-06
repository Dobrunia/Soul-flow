'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, TextField, Button, Alert } from 'dobruniaui';
import { validateEmail, validatePassword } from '../validation';
import { auth } from '@/shared/lib/supabase/Classes/authService';
import { homePage } from '@/shared/variables/home.page';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Dynamic validation
  useEffect(() => {
    setEmailError(email ? validateEmail(email) : '');
  }, [email]);

  useEffect(() => {
    setPasswordError(password ? validatePassword(password) : '');
  }, [password]);

  const isFormValid = email && password && !emailError && !passwordError;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim values
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Final validation
    const emailErr = validateEmail(trimmedEmail);
    const passwordErr = validatePassword(trimmedPassword);

    if (emailErr) {
      setError(emailErr);
      return;
    }
    if (passwordErr) {
      setError(passwordErr);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authError = await auth.login({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      if (authError) {
        setError(authError.message);
      } else {
        router.push(homePage);
      }
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при входе');
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
          helperText={passwordError || 'Введите пароль'}
          error={!!passwordError}
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
