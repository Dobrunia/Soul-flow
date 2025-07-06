'use client';

import Link from 'next/link';
import { Row } from 'dobruniaui';

export default function BackButton() {
  return (
    <Link href='/chats'>
      <Row
        left={'←'}
        center={<h2 className='font-medium'>Назад к чатам</h2>}
        className='bg-[var(--c-bg-subtle)] border-b border-[var(--c-border)]'
        centerJustify='left'
      />
    </Link>
  );
}
