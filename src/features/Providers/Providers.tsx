'use client';

import ReduxProvider from '@/shared/store/ReduxProvider';
import { SetProfileProvider } from './api/SetProfileProvider';
import { StatusProvider } from './api/StatusProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <SetProfileProvider>
        <StatusProvider>{children}</StatusProvider>
      </SetProfileProvider>
    </ReduxProvider>
  );
}
