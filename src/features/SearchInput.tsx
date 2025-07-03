'use client';

import { useState } from 'react';
import { SearchInput, Button } from 'dobruniaui';
import UsersSearchModal from '@/widgets/UsersSearch/UsersSearchModal';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className='flex items-center justify-between border-r border-[var(--c-border)] p-[12]'>
      <SearchInput
        placeholder={'Поиск...'}
        value={searchQuery}
        onChange={setSearchQuery}
        className='w-[80%]!'
      />
      <Button variant='secondary' shape='square' onClick={() => setModalOpen(true)}>
        <svg
          width='20'
          height='20'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          viewBox='0 0 24 24'
        >
          <path d='M12 5v14m7-7H5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      </Button>
      <UsersSearchModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
