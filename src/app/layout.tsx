import type { Metadata } from 'next';
import './globals.css';
import ThemeInitializer from '@/shared/ui/ThemeInitializer';
import Header from '../shared/ui/Header';
import UserInitializer from '@/shared/api/UserInitializer';
import ReduxProvider from '@/shared/store/ReduxProvider';

export const metadata: Metadata = {
  title: 'Soul Flow',
  description: 'Мессенджер для общения',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ru'>
      <body>
        <ReduxProvider>
          <UserInitializer />
          <ThemeInitializer />
          <Header />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
