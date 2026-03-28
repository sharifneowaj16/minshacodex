import { redirect } from 'next/navigation';
import { ReviewsClient } from '@/components/account/reviews-client';
import { getAuthenticatedUserIdFromServer } from '@/lib/auth/appAuth';
import { getReviewsPageData } from '@/lib/account/pageData';

export default async function ReviewsPage() {
  const userId = await getAuthenticatedUserIdFromServer();
  if (!userId) {
    redirect('/login?redirect=/account/reviews');
  }

  const data = await getReviewsPageData(userId);
  return <ReviewsClient reviews={data.reviews} reviewableProducts={data.reviewableProducts} />;
}
