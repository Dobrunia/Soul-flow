'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/shared/lib/supabase';
import { Card, TextField, Button, Alert } from 'dobruniaui';
import { homePage } from '@/shared/variables/home.page';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Dynamic validation
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Введите корректный email');
    } else {
      setEmailError('');
    }
  }, [email]);

  useEffect(() => {
    const trimmedPassword = password.trim();
    if (password && trimmedPassword.length < 6) {
      setPasswordError('Пароль должен содержать минимум 6 символов');
    } else {
      setPasswordError('');
    }
  }, [password]);

  useEffect(() => {
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    if (confirmPassword && trimmedPassword !== trimmedConfirmPassword) {
      setConfirmPasswordError('Пароли не совпадают');
    } else {
      setConfirmPasswordError('');
    }
  }, [password, confirmPassword]);

  const isFormValid =
    email && password && confirmPassword && !emailError && !passwordError && !confirmPasswordError;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Trim values
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Final validation
    if (!trimmedEmail) {
      setError('Email обязателен');
      return;
    }
    if (!trimmedPassword) {
      setError('Пароль обязателен');
      return;
    }
    if (!trimmedConfirmPassword) {
      setError('Подтверждение пароля обязательно');
      return;
    }
    if (emailError || passwordError || confirmPasswordError) {
      setError('Исправьте ошибки в форме');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const supabase = createBrowserClient();
      console.log('Attempting registration for:', trimmedEmail);

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/chats`,
        },
      });

      if (error) {
        console.error('Supabase registration error:', error);
        setError(`Ошибка регистрации: ${error.message}`);
        return;
      }

      // В новых версиях Supabase signUp всегда возвращает успех,
      // но для существующих пользователей не создает новую сессию
      if (!data.session && data.user && data.user.identities && data.user.identities.length === 0) {
        setError('Пользователь с таким email уже зарегистрирован');
        return;
      }

      // Если создалась сессия - перенаправляем
      if (data.session) {
        console.log('Registration successful:', data.user);
        window.location.href = homePage;
        return;
      }

      setMessage('Проверьте email для подтверждения регистрации');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant='elevated'>
      <div className='text-center mb-6'>
        <h2 className='font-h'>Создать аккаунт</h2>
        <Link href='/login' className='font-medium hover:underline text-[var(--c-accent)]'>
          войти в существующий
        </Link>
      </div>

      <form onSubmit={handleRegister} className='space-y-4'>
        {error && (
          <Alert type='error' className='font-small-plus'>
            {error}
          </Alert>
        )}

        {message && (
          <Alert type='success' className='font-small-plus'>
            {message}
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
          helperText={passwordError || 'Минимум 6 символов'}
          error={!!passwordError}
          required
        />

        <TextField
          label='Подтвердите пароль *'
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          helperText={confirmPasswordError || 'Повторите пароль'}
          error={!!confirmPasswordError}
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
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>
    </Card>
  );
}
