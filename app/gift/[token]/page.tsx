// app/gift/[token]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GiftPageClient from './GiftPageClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

async function fetchGift(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/gift/${token}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await fetchGift(token);
  if (!data) return { title: 'Gift | Minsah Beauty' };

  return {
    title: `${data.gift.senderName} তোমাকে গিফট করতে চায় | Minsah Beauty`,
    description: `${data.product.name} — Minsah Beauty থেকে বিশেষ উপহার`,
    openGraph: {
      title: `🎁 ${data.gift.senderName} তোমার জন্য গিফট পাঠিয়েছে!`,
      description: `${data.product.name}`,
      images: data.product.image ? [{ url: data.product.image }] : [],
    },
  };
}

export default async function GiftPage({ params }: PageProps) {
  const { token } = await params;
  const data = await fetchGift(token);

  if (!data) notFound();

  return <GiftPageClient data={data} />;
}
