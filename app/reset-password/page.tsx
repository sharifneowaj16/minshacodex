import { Suspense } from 'react';
import { ResetPasswordClient } from '@/components/reset-password-client';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token || '';

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFE6D2' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#64320D' }}></div>
          <p style={{ color: '#8E6545' }}>Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordClient token={token} />
    </Suspense>
  );
}
