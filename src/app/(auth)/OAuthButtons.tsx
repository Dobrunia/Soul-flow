'use client';

import { Row, Card } from 'dobruniaui';
import { FaGoogle, FaGithub, FaTwitch } from 'react-icons/fa';
import { auth } from '@/shared/lib/supabase/Classes/authService';
import { homePage } from '@/shared/variables/home.page';

const PROVIDERS = [
  { id: 'google', icon: <FaGoogle />, label: 'Google' },
  { id: 'github', icon: <FaGithub />, label: 'GitHub' },
  // { id: 'twitch',  icon: <FaTwitch  />, label: 'Twitch' },
] as const;

export default function OAuthButtons() {
  const handle = async (provider: (typeof PROVIDERS)[number]['id']) => {
    try {
      await auth.signInWithOAuth(provider, {
        redirectTo: homePage,
      });
    } catch (error) {
      console.error('OAuth login failed:', error);
    }
  };

  return (
    <Card title='Войти через:' variant='elevated' className='text-center'>
      {PROVIDERS.map((p) => (
        <Row
          key={p.id}
          center={
            <div className='w-[90px] flex items-center gap-3'>
              <span className='text-lg'>{p.icon}</span>
              <span>{p.label}</span>
            </div>
          }
          onClick={() => handle(p.id)}
          className='hover:bg-[var(--c-bg-default)]!'
        />
      ))}
    </Card>
  );
}
