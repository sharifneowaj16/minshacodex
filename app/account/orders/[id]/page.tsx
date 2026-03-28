import { redirect } from 'next/navigation';
import { OrderDetailClient } from '@/components/account/order-detail-client';
import { getAuthenticatedUserIdFromServer } from '@/lib/auth/appAuth';
import { getOrderDetailPageData } from '@/lib/account/pageData';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserIdFromServer();
  if (!userId) {
    redirect('/login?redirect=/account/orders');
  }

  const { id } = await params;
  const order = await getOrderDetailPageData(userId, id);

  return <OrderDetailClient order={order} />;
}
