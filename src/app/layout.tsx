import type { Metadata } from 'next';
import './globals.css';
import ThemeInitializer from '@/shared/ui/ThemeInitializer';

export const metadata: Metadata = {
  title: 'Soul Flow',
  description: 'Приложение с аутентификацией через Supabase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ru'>
      <body>
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
