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
      <Button variant='ghost' shape='square' onClick={() => setModalOpen(true)}>
        +
      </Button>
      <UsersSearchModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
