'use client';

import { useState } from 'react';
import { SearchInput } from 'dobruniaui';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');

  return <SearchInput placeholder={'Поиск...'} value={searchQuery} onChange={setSearchQuery} />;
}
