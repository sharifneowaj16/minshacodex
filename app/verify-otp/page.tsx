import { Suspense } from 'react';
import { VerifyOTPClient } from '@/components/verify-otp-client';

interface VerifyOTPPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyOTPPage({ searchParams }: VerifyOTPPageProps) {
  const params = await searchParams;
  const email = params.email || '';

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFE6D2' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#64320D' }}></div>
          <p style={{ color: '#8E6545' }}>Loading...</p>
        </div>
      </div>
    }>
      <VerifyOTPClient email={email} />
    </Suspense>
  );
}
