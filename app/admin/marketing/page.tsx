import { Suspense } from 'react';
import { AdminMarketingClient } from '@/components/admin/admin-marketing-client';

type MarketingTab = 'overview' | 'social' | 'inbox' | 'whatsapp' | 'email' | 'sms' | 'google';

interface MarketingPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function MarketingPage({ searchParams }: MarketingPageProps) {
  const params = await searchParams;
  const tab = params.tab as MarketingTab;
  const initialTab: MarketingTab = tab && ['overview', 'social', 'inbox', 'whatsapp', 'email', 'sms', 'google'].includes(tab)
    ? tab
    : 'overview';

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AdminMarketingClient initialTab={initialTab} />
    </Suspense>
  );
}
