'use client';

import { useEffect } from 'react';
import { initThemeSystem } from 'dobruniaui';

export default function ThemeInitializer() {
  useEffect(() => {
    initThemeSystem();
  }, []);

  return null;
}
