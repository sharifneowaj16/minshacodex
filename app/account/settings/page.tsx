import { redirect } from 'next/navigation';
import { SettingsClient } from '@/components/account/settings-client';
import { getAuthenticatedUserIdFromServer } from '@/lib/auth/appAuth';
import { getSettingsPageUser } from '@/lib/account/pageData';

export default async function ProfileSettingsPage() {
  const userId = await getAuthenticatedUserIdFromServer();
  if (!userId) {
    redirect('/login?redirect=/account/settings');
  }

  const user = await getSettingsPageUser(userId);
  if (!user) {
    redirect('/login?redirect=/account/settings');
  }

  return <SettingsClient initialUser={user} />;
}
