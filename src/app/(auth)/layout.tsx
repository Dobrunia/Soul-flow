'use client';

import OAuthButtons from '@/app/(auth)/OAuthButtons';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex items-center justify-center py-12 px-4'>
      <div className='max-w-md w-full space-y-6'>
        <OAuthButtons />

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-[var(--c-border)]'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 text-[var(--c-text-secondary)]'>или</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
