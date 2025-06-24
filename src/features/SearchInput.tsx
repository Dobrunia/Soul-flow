'use client';

import { useState } from 'react';
import { SearchInput } from 'dobruniaui';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className='p-[14px] border-r border-[var(--c-border)]'>
      <SearchInput placeholder={'Поиск...'} value={searchQuery} onChange={setSearchQuery} />
    </div>
  );
}
