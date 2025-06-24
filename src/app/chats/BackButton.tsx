'use client';

import { useRouter } from 'next/navigation';
import { Row } from 'dobruniaui';

export default function BackButton() {
  const router = useRouter();

  const handleBackToChats = () => {
    router.push('/chats');
  };

  return (
    <Row
      left={'←'}
      center={
        <div className='align-left w-full'>
          <h2 className='font-medium'>Назад к чатам</h2>
        </div>
      }
      className='bg-[var(--c-bg-subtle)] border-b border-[var(--c-border)]'
      onClick={handleBackToChats}
    />
  );
}
