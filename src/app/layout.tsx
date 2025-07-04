import type { Metadata } from 'next';
import './globals.css';
import ThemeInitializer from '@/shared/ui/ThemeInitializer';
import Header from '../widgets/Header/Header';
import ReduxProvider from '@/shared/store/ReduxProvider';
import UserInitializer from '@/shared/api/UserInitializer';
import StatusInitializer from '@/shared/api/StatusInitializer';

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
          <StatusInitializer />
          <ThemeInitializer />
          <Header />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
