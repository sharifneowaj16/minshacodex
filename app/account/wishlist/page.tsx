import { redirect } from 'next/navigation';
import { WishlistClient } from '@/components/account/wishlist-client';
import { getAuthenticatedUserIdFromServer } from '@/lib/auth/appAuth';
import { getWishlistPageItems } from '@/lib/account/pageData';

export default async function WishlistPage() {
  const userId = await getAuthenticatedUserIdFromServer();
  if (!userId) {
    redirect('/login?redirect=/account/wishlist');
  }

  const wishlistItems = await getWishlistPageItems(userId);
  return <WishlistClient initialItems={wishlistItems} />;
}
