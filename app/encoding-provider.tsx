'use client';

import { useEffect } from 'react';
import { installFetchInterceptor } from '@/lib/encoding/interceptor';

export function EncodingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    installFetchInterceptor();
    console.log('🔧 Global encoding fix activated');
  }, []);

  return <>{children}</>;
}
