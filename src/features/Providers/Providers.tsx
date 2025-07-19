'use client';

import ReduxProvider from '@/shared/store/ReduxProvider';
import { SetProfileProvider } from './api/SetProfileProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <SetProfileProvider>{children}</SetProfileProvider>
    </ReduxProvider>
  );
}
