'use client';

import ReduxProvider from '@/shared/store/ReduxProvider';
import { SetProfileProvider } from './api/SetProfileProvider';
import { WakeUpProvider } from './api/WakeUpProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      {/* <WakeUpProvider> */}
        <SetProfileProvider>{children}</SetProfileProvider>
      {/* </WakeUpProvider> */}
    </ReduxProvider>
  );
}
