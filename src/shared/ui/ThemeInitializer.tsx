'use client';

import { useEffect } from 'react';
import { initThemeSystem } from 'dobruniaui';

export default function ThemeInitializer() {
  useEffect(() => {
    // Инициализируем систему тем при монтировании приложения
    initThemeSystem();
  }, []);
  return null;
}
