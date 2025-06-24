'use client';

import { useEffect } from 'react';
import { initThemeSystem, setTheme } from 'dobruniaui';

export default function ThemeInitializer() {
  useEffect(() => {
    initThemeSystem();
    setTheme('obsidian');
  }, []);

  return null;
}
