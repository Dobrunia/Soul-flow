'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, TextField, Button, Alert } from 'dobruniaui';
import { validateEmail, validatePassword, validateConfirmPassword } from '../validation';
import { auth } from '@/shared/lib/supabase/Classes/authService';

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
    setEmailError(email ? validateEmail(email) : '');
  }, [email]);

  useEffect(() => {
    setPasswordError(password ? validatePassword(password) : '');
  }, [password]);

  useEffect(() => {
    setConfirmPasswordError(
      confirmPassword ? validateConfirmPassword(password, confirmPassword) : ''
    );
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
    const emailErr = validateEmail(trimmedEmail);
    const passwordErr = validatePassword(trimmedPassword);
    const confirmPasswordErr = validateConfirmPassword(trimmedPassword, trimmedConfirmPassword);

    if (emailErr) {
      setError(emailErr);
      return;
    }
    if (passwordErr) {
      setError(passwordErr);
      return;
    }
    if (confirmPasswordErr) {
      setError(confirmPasswordErr);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const authError = await auth.signup({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      if (authError) {
        setError(authError.message);
      } else {
        setMessage('Регистрация успешна! Проверьте email для подтверждения.');
      }
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при регистрации');
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
