import { redirect } from 'next/navigation';
import { getAuthenticatedUserFromServer } from '@/lib/auth/appAuth';
import { AccountLayoutClient } from '@/components/account/account-layout-client';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUserFromServer();

  if (!user) {
    redirect('/login?redirect=/account');
  }

  return <AccountLayoutClient user={user}>{children}</AccountLayoutClient>;
}
