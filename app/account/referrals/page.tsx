import { redirect } from 'next/navigation';
import { ReferralsClient } from '@/components/account/referrals-client';
import { getAuthenticatedUserIdFromServer } from '@/lib/auth/appAuth';
import { getReferralPageData } from '@/lib/account/pageData';

const shareOptions = [
  { name: 'Copy Link', icon: 'Copy', action: 'copy' },
  { name: 'Email', icon: 'Mail', action: 'email' },
  { name: 'Facebook', icon: 'Facebook', action: 'facebook' },
  { name: 'Twitter', icon: 'Twitter', action: 'twitter' },
];

const emailTemplates = [
  {
    id: 'personal',
    name: 'Personal Message',
    subject: 'Join me at Minsah Beauty!',
    body: 'Hi there!\n\nI wanted to share this amazing beauty brand with you - Minsah Beauty. They have incredible toxin-free skincare and makeup products that I absolutely love.\n\nUse my referral code {referralCode} to get a special welcome bonus when you sign up!\n\nCheck them out here: {referralLink}\n\nBest regards,\n{senderName}',
  },
  {
    id: 'casual',
    name: 'Casual Invite',
    subject: "You've got to check this out!",
    body: "Hey!\n\nFound this awesome beauty store called Minsah Beauty and thought you would love it. Amazing products, great prices, and they're all about clean beauty.\n\nUse my code {referralCode} for a discount on your first order. Here's the link: {referralLink}\n\nEnjoy!",
  },
];

export default async function ReferralsPage() {
  const userId = await getAuthenticatedUserIdFromServer();
  if (!userId) {
    redirect('/login?redirect=/account/referrals');
  }

  const referralPageData = await getReferralPageData(userId);
  if (!referralPageData) {
    redirect('/login?redirect=/account/referrals');
  }

  return (
    <ReferralsClient
      referralData={referralPageData.referralData}
      referrals={referralPageData.referrals}
      shareOptions={shareOptions}
      emailTemplates={emailTemplates}
    />
  );
}
