import { Row, Card } from 'dobruniaui';
import { FaGoogle, FaGithub, FaTwitch } from 'react-icons/fa';
import { createBrowserClient } from '@/shared/lib/supabase';
import { homePage } from '@/shared/variables/home.page';

export default function OAuthButtons() {
  const handleOAuthLogin = async (provider: 'google' | 'github' | 'twitch') => {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: homePage,
      },
    });
  };

  return (
    <Card title='Войти через:' variant='elevated' className='text-center'>
      <Row
        center={
          <div className='w-[82px] flex items-center justify-start gap-3'>
            <FaGoogle className='text-[var(--c-text-primary)] text-lg' />
            <span>Google</span>
          </div>
        }
        onClick={() => handleOAuthLogin('google')}
        className='hover:bg-[var(--c-bg-default)]!'
      />

      <Row
        center={
          <div className='w-[82px] flex items-center justify-start gap-3'>
            <FaGithub className='text-[var(--c-text-primary)] text-lg' />
            <span>GitHub</span>
          </div>
        }
        onClick={() => handleOAuthLogin('github')}
        className='hover:bg-[var(--c-bg-default)]!'
      />

      <Row
        center={
          <div className='w-[80px] flex items-center justify-start gap-3'>
            <FaTwitch className='text-[var(--c-text-primary)] text-lg' />
            <span>Twitch</span>
          </div>
        }
        onClick={() => handleOAuthLogin('twitch')}
        className='hover:bg-[var(--c-bg-default)]!'
      />
    </Card>
  );
}
