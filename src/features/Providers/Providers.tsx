'use client';

import ReduxProvider from '@/shared/store/ReduxProvider';
import { SetProfileProvider } from './api/SetProfileProvider';
import { StatusProvider } from './api/StatusProvider';
import MessageProvider from './api/MessageProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <SetProfileProvider>
        <StatusProvider>
          <MessageProvider>{children}</MessageProvider>
        </StatusProvider>
      </SetProfileProvider>
    </ReduxProvider>
  );
}
