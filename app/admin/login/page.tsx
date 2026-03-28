import { Suspense } from 'react';
import { AdminLoginClient } from '@/components/admin/admin-login-client';

interface AdminLoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect || '/admin';

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AdminLoginClient redirectTo={redirectTo} />
    </Suspense>
  );
}
