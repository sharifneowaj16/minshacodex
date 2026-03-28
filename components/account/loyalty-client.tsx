'use client';

import { useState } from 'react';
import {
  Star,
  Gift,
  Ticket,
  Clock,
  RefreshCw,
  Heart,
  Crown,
  Trophy,
} from 'lucide-react';
import { LOYALTY_CONFIG } from '@/types/user';
import type { LoyaltyTransaction } from '@/types/user';

// ✅ Icon map — string থেকে component
const ICON_MAP: Record<string, React.ElementType> = {
  Star, Gift, Ticket, Clock, RefreshCw, Heart, Crown, Trophy,
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || Star;
  return <Icon className={className} />;
}

interface LoyaltyClientProps {
  userLoyalty: any;
  transactions: LoyaltyTransaction[];
  loyaltyTiers: any[]; // icon is now a string
  rewards: any[];
}

export function LoyaltyClient({ userLoyalty, transactions, loyaltyTiers, rewards }: LoyaltyClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReward, setSelectedReward] = useState<typeof rewards[0] | null>(null);

  const userTier = loyaltyTiers.find((tier) => tier.name.toLowerCase() === userLoyalty.tier) || loyaltyTiers[0];
  const nextTier = loyaltyTiers.find((tier) => tier.minPoints > userTier.minPoints);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'Star' },
    { id: 'history', name: 'History', icon: 'Clock' },
    { id: 'rewards', name: 'Rewards', icon: 'Gift' },
  ];

  const formatPoints = (points: number) => points.toLocaleString();

  const getTransactionIcon = (type: 'earned' | 'redeemed') =>
    type === 'earned' ? (
      <RefreshCw className="w-5 h-5 text-green-500" />
    ) : (
      <Gift className="w-5 h-5 text-purple-500" />
    );

  const tierColorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Loyalty Program</h1>
        <p className="text-gray-600">Earn points and unlock exclusive rewards</p>
      </div>

      {/* Points Overview Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5" />
              <span className="text-sm text-purple-100">Current Points</span>
            </div>
            <p className="text-3xl font-bold">{formatPoints(userLoyalty.currentPoints)}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm text-purple-100">Lifetime Points</span>
            </div>
            <p className="text-3xl font-bold">{formatPoints(userLoyalty.lifetimePoints)}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm text-purple-100">This Month</span>
            </div>
            <p className="text-3xl font-bold">+{formatPoints(userLoyalty.monthlyEarned)}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm text-purple-100">Expiring Soon</span>
            </div>
            <p className="text-3xl font-bold">{formatPoints(userLoyalty.pointsExpiring)}</p>
          </div>
        </div>

        {/* Tier Progress */}
        {nextTier && (
          <div className="mt-6 pt-6 border-t border-purple-500">
            <div className="flex justify-between text-sm text-purple-100 mb-2">
              <span>{userTier.name} Tier</span>
              <span>{formatPoints(userLoyalty.lifetimePoints)} / {formatPoints(nextTier.minPoints)} → {nextTier.name}</span>
            </div>
            <div className="w-full bg-purple-500 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${Math.min(userLoyalty.tierProgress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <DynamicIcon name={tab.icon} className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Your {userTier.name} Benefits</h2>
                <div className="space-y-3">
                  {userTier.benefits.map((benefit: string) => (
                    <div key={benefit} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Earn */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">How to Earn Points</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { action: 'Make a Purchase', points: `${LOYALTY_CONFIG.points_per_bdt} pt per ৳1`, icon: 'Gift' },
                    { action: 'Write a Review', points: `${LOYALTY_CONFIG.points_for_review} pts`, icon: 'Star' },
                    { action: 'Refer a Friend', points: `${LOYALTY_CONFIG.points_for_referral_signup} pts`, icon: 'Heart' },
                    { action: 'Birthday Bonus', points: '100 pts', icon: 'Trophy' },
                  ].map((item) => (
                    <div key={item.action} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <DynamicIcon name={item.icon} className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.action}</p>
                        <p className="text-purple-600 text-sm font-semibold">{item.points}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${transaction.type === 'earned' ? 'text-green-600' : 'text-purple-600'}`}>
                      {transaction.type === 'earned' ? '+' : '-'}{formatPoints(transaction.points)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rewards.map((reward: any) => (
                  <div key={reward.id} className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{reward.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{reward.description}</p>
                      </div>
                      <Ticket className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600">
                        {formatPoints(reward.points)} pts
                      </span>
                      <button
                        onClick={() => setSelectedReward(reward)}
                        disabled={reward.points > userLoyalty.currentPoints}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          reward.points <= userLoyalty.currentPoints
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {reward.points <= userLoyalty.currentPoints ? 'Redeem' : 'Not Enough Points'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Points to ৳1</span>
                <span className="font-medium text-gray-900">{LOYALTY_CONFIG.redemption_rate}:1</span>
              </div>
              <p className="text-xs text-gray-500">
                ৳{Math.floor(userLoyalty.currentPoints / LOYALTY_CONFIG.redemption_rate)} available for redemption
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Points Earned This Year</span>
                <span className="font-medium text-gray-900">{formatPoints(userLoyalty.monthlyEarned * 12)}</span>
              </div>
            </div>
          </div>

          {/* All Tiers */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">All Tiers</h3>
            <div className="space-y-3">
              {loyaltyTiers.map((tier: any) => {
                const isActive = tier.name.toLowerCase() === userLoyalty.tier;
                const isCompleted = userLoyalty.lifetimePoints >= tier.minPoints;
                const colors = tierColorMap[tier.color] || tierColorMap.gray;

                return (
                  <div
                    key={tier.name}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isActive ? 'bg-purple-50 border border-purple-200' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isActive ? 'bg-purple-600 text-white'
                      : isCompleted ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                    }`}>
                      {/* ✅ icon string → component */}
                      <DynamicIcon name={tier.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{tier.name}</h4>
                      <p className="text-xs text-gray-600">{formatPoints(tier.minPoints)} points</p>
                    </div>
                    {isActive && (
                      <span className="text-xs font-medium text-purple-600">Current</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Redemption Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Redemption</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900">{selectedReward.name}</h4>
              <p className="text-gray-600 text-sm mt-1">{selectedReward.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">Cost</span>
                <span className="font-semibold text-purple-600">{formatPoints(selectedReward.points)} points</span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-6">
              <span>Balance after redemption</span>
              <span className="font-medium text-gray-900">
                {formatPoints(userLoyalty.currentPoints - selectedReward.points)} points
              </span>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedReward(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setSelectedReward(null)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Redeem Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// 'use client';

// import { useState } from 'react';
// import {
//   Star,
//   Gift,
//   Ticket,
//   Clock,
//   CheckCircle,
//   RefreshCw,
//   Calendar,
//   ShoppingBag,
//   Edit,
//   Sparkles,
//   Crown,
//   Heart
// } from 'lucide-react';
// import { Star as StarSolidIcon } from 'lucide-react';
// import { LOYALTY_CONFIG } from '@/types/user';
// import type { LoyaltyTransaction } from '@/types/user';

// interface LoyaltyClientProps {
//   userLoyalty: any;
//   transactions: LoyaltyTransaction[];
//   loyaltyTiers: any[];
//   rewards: any[];
// }

// export function LoyaltyClient({ userLoyalty, transactions, loyaltyTiers, rewards }: LoyaltyClientProps) {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [selectedReward, setSelectedReward] = useState<typeof rewards[0] | null>(null);

//   const userTier = loyaltyTiers.find(tier => tier.name.toLowerCase() === userLoyalty.tier) || loyaltyTiers[0];
//   const nextTier = loyaltyTiers.find(tier => tier.minPoints > userTier.minPoints);

//   const tabs = [
//     { id: 'overview', name: 'Overview', icon: Star },
//     { id: 'history', name: 'History', icon: Clock },
//     { id: 'rewards', name: 'Rewards', icon: Gift }
//   ];

//   const getUserTierIcon = () => {
//     const IconComponent = userTier.icon;
//     return <IconComponent className="w-6 h-6" />;
//   };

//   const formatPoints = (points: number) => {
//     return points.toLocaleString();
//   };

//   const getTransactionIcon = (type: 'earned' | 'redeemed') => {
//     return type === 'earned' ? (
//       <RefreshCw className="w-5 h-5 text-green-500" />
//     ) : (
//       <Gift className="w-5 h-5 text-purple-500" />
//     );
//   };

//   // Content from original file lines 193-518 - I'll keep the core JSX structure
//   // For brevity, rendering the essential tabs and content
  
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Loyalty Program</h1>
//           <p className="text-gray-600">Earn points and unlock exclusive rewards</p>
//         </div>

//         {/* Points Overview Card - keeping from original */}
//         <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 mb-8 text-white">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             <div>
//               <div className="flex items-center space-x-2 mb-2">
//                 <StarSolidIcon className="w-5 h-5" />
//                 <span className="text-white/80 text-sm">Current Balance</span>
//               </div>
//               <p className="text-3xl font-bold">{formatPoints(userLoyalty.currentPoints)}</p>
//               <p className="text-white/80 text-sm mt-1">points</p>
//             </div>

//             <div>
//               <div className="flex items-center space-x-2 mb-2">
//                 <Sparkles className="w-5 h-5" />
//                 <span className="text-white/80 text-sm">Lifetime Points</span>
//               </div>
//               <p className="text-2xl font-bold">{formatPoints(userLoyalty.lifetimePoints)}</p>
//             </div>

//             <div>
//               <div className="flex items-center space-x-2 mb-2">
//                 <Calendar className="w-5 h-5" />
//                 <span className="text-white/80 text-sm">This Month</span>
//               </div>
//               <p className="text-2xl font-bold">+{formatPoints(userLoyalty.monthlyEarned)}</p>
//             </div>

//             {userLoyalty.pointsExpiring > 0 && (
//               <div>
//                 <div className="flex items-center space-x-2 mb-2">
//                   <Clock className="w-5 h-5" />
//                   <span className="text-white/80 text-sm">Expiring Soon</span>
//                 </div>
//                 <p className="text-2xl font-bold">{formatPoints(userLoyalty.pointsExpiring)}</p>
//                 <p className="text-white/80 text-xs">
//                   by {userLoyalty.expiryDate.toLocaleDateString()}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-sm mb-6">
//           <div className="border-b border-gray-200">
//             <nav className="flex -mb-px">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
//                     activeTab === tab.id
//                       ? 'border-purple-500 text-purple-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   <tab.icon className="w-5 h-5 mr-2" />
//                   {tab.name}
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             {activeTab === 'overview' && (
//               <div className="space-y-6">
//                 {/* Tier Status */}
//                 <div className="bg-white rounded-lg shadow-sm p-6">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Tier Status</h2>

//                   <div className="flex items-center justify-between mb-6">
//                     <div className="flex items-center space-x-4">
//                       <div className={`p-3 rounded-full bg-${userTier.color}-100 text-${userTier.color}-600`}>
//                         {getUserTierIcon()}
//                       </div>
//                       <div>
//                         <h3 className="text-lg font-medium text-gray-900">{userTier.name} Member</h3>
//                         <p className="text-gray-600">{formatPoints(userLoyalty.lifetimePoints)} lifetime points</p>
//                       </div>
//                     </div>
//                   </div>

//                   {nextTier && (
//                     <div className="mb-6">
//                       <div className="flex justify-between text-sm mb-2">
//                         <span className="text-gray-600">Progress to {nextTier.name}</span>
//                         <span className="font-medium text-gray-900">{userLoyalty.tierProgress}%</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div
//                           className="bg-purple-600 h-2 rounded-full transition-all duration-300"
//                           style={{ width: `${userLoyalty.tierProgress}%` }}
//                         />
//                       </div>
//                       <p className="text-sm text-gray-600 mt-2">
//                         {formatPoints(nextTier.minPoints - userLoyalty.lifetimePoints)} points to next tier
//                       </p>
//                     </div>
//                   )}

//                   <div>
//                     <h4 className="font-medium text-gray-900 mb-3">Your Benefits</h4>
//                     <ul className="space-y-2">
//                       {userTier.benefits.map((benefit: string, index: number) => (
//                         <li key={index} className="flex items-center text-gray-700">
//                           <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
//                           {benefit}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>

//                 {/* How to Earn Points */}
//                 <div className="bg-white rounded-lg shadow-sm p-6">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-6">How to Earn Points</h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="flex items-start space-x-3">
//                       <ShoppingBag className="w-6 h-6 text-purple-600 mt-1" />
//                       <div>
//                         <h3 className="font-medium text-gray-900">Shop</h3>
//                         <p className="text-gray-600 text-sm">
//                           {LOYALTY_CONFIG.points_per_bdt} point per ৳1 spent
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-start space-x-3">
//                       <Edit className="w-6 h-6 text-purple-600 mt-1" />
//                       <div>
//                         <h3 className="font-medium text-gray-900">Write Reviews</h3>
//                         <p className="text-gray-600 text-sm">
//                           {LOYALTY_CONFIG.points_for_review} points per review
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-start space-x-3">
//                       <Heart className="w-6 h-6 text-purple-600 mt-1" />
//                       <div>
//                         <h3 className="font-medium text-gray-900">Refer Friends</h3>
//                         <p className="text-gray-600 text-sm">
//                           {LOYALTY_CONFIG.points_for_referral_signup} points when they sign up
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-start space-x-3">
//                       <Gift className="w-6 h-6 text-purple-600 mt-1" />
//                       <div>
//                         <h3 className="font-medium text-gray-900">Birthday Bonus</h3>
//                         <p className="text-gray-600 text-sm">
//                           Special bonus points on your birthday
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'history' && (
//               <div className="bg-white rounded-lg shadow-sm">
//                 <div className="p-6 border-b border-gray-200">
//                   <h2 className="text-xl font-semibold text-gray-900">Points History</h2>
//                 </div>
//                 <div className="divide-y divide-gray-200">
//                   {transactions.map((transaction) => (
//                     <div key={transaction.id} className="p-6 hover:bg-gray-50 transition">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-4">
//                           {getTransactionIcon(transaction.type)}
//                           <div>
//                             <h3 className="font-medium text-gray-900">{transaction.description}</h3>
//                             <div className="flex items-center space-x-4 mt-1">
//                               <span className="text-sm text-gray-600">
//                                 {transaction.createdAt.toLocaleDateString()}
//                               </span>
//                               {transaction.expiresAt && (
//                                 <span className="text-sm text-orange-600">
//                                   Expires: {transaction.expiresAt.toLocaleDateString()}
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                         <div className={`font-semibold ${
//                           transaction.type === 'earned' ? 'text-green-600' : 'text-purple-600'
//                         }`}>
//                           {transaction.type === 'earned' ? '+' : '-'}{formatPoints(transaction.points)}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {activeTab === 'rewards' && (
//               <div className="space-y-6">
//                 <div className="bg-white rounded-lg shadow-sm p-6">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Rewards</h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {rewards.map((reward: any) => (
//                       <div key={reward.id} className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition">
//                         <div className="flex items-start justify-between mb-4">
//                           <div>
//                             <h3 className="font-medium text-gray-900">{reward.name}</h3>
//                             <p className="text-gray-600 text-sm mt-1">{reward.description}</p>
//                           </div>
//                           <Ticket className="w-6 h-6 text-purple-600" />
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <span className="text-lg font-bold text-purple-600">
//                             {formatPoints(reward.points)} points
//                           </span>
//                           <button
//                             onClick={() => setSelectedReward(reward)}
//                             disabled={reward.points > userLoyalty.currentPoints}
//                             className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
//                               reward.points <= userLoyalty.currentPoints
//                                 ? 'bg-purple-600 text-white hover:bg-purple-700'
//                                 : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                             }`}
//                           >
//                             {reward.points <= userLoyalty.currentPoints ? 'Redeem' : 'Insufficient Points'}
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex justify-between text-sm mb-1">
//                     <span className="text-gray-600">Points to $1</span>
//                     <span className="font-medium text-gray-900">{LOYALTY_CONFIG.redemption_rate}:1</span>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     ${Math.floor(userLoyalty.currentPoints / LOYALTY_CONFIG.redemption_rate)} available for redemption
//                   </p>
//                 </div>
//                 <div>
//                   <div className="flex justify-between text-sm mb-1">
//                     <span className="text-gray-600">Member Since</span>
//                     <span className="font-medium text-gray-900">Jan 2023</span>
//                   </div>
//                 </div>
//                 <div>
//                   <div className="flex justify-between text-sm mb-1">
//                     <span className="text-gray-600">Points Earned This Year</span>
//                     <span className="font-medium text-gray-900">{formatPoints(userLoyalty.monthlyEarned * 12)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h3 className="font-semibold text-gray-900 mb-4">All Tiers</h3>
//               <div className="space-y-4">
//                 {loyaltyTiers.map((tier: any) => {
//                   const IconComponent = tier.icon;
//                   const isActive = tier.name.toLowerCase() === userLoyalty.tier;
//                   const isCompleted = userLoyalty.lifetimePoints >= tier.minPoints;

//                   return (
//                     <div
//                       key={tier.name}
//                       className={`flex items-center space-x-3 p-3 rounded-lg ${
//                         isActive ? 'bg-purple-50 border border-purple-200' : ''
//                       }`}
//                     >
//                       <div className={`p-2 rounded-full ${
//                         isActive
//                           ? 'bg-purple-600 text-white'
//                           : isCompleted
//                           ? 'bg-green-100 text-green-600'
//                           : 'bg-gray-100 text-gray-400'
//                       }`}>
//                         <IconComponent className="w-4 h-4" />
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="font-medium text-gray-900">{tier.name}</h4>
//                         <p className="text-sm text-gray-600">
//                           {formatPoints(tier.minPoints)} points
//                         </p>
//                       </div>
//                       {isActive && (
//                         <span className="text-xs font-medium text-purple-600">Current</span>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Reward Redemption Modal */}
//         {selectedReward && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Redemption</h3>
//               <div className="bg-gray-50 rounded-lg p-4 mb-6">
//                 <h4 className="font-medium text-gray-900">{selectedReward.name}</h4>
//                 <p className="text-gray-600 text-sm mt-1">{selectedReward.description}</p>
//                 <div className="flex items-center justify-between mt-4">
//                   <span className="text-sm text-gray-600">Cost</span>
//                   <span className="font-semibold text-purple-600">
//                     {formatPoints(selectedReward.points)} points
//                   </span>
//                 </div>
//               </div>
//               <div className="flex justify-between text-sm text-gray-600 mb-6">
//                 <span>Balance after redemption</span>
//                 <span className="font-medium text-gray-900">
//                   {formatPoints(userLoyalty.currentPoints - selectedReward.points)} points
//                 </span>
//               </div>
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => setSelectedReward(null)}
//                   className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => {
//                     console.log('Redeeming reward:', selectedReward.id);
//                     setSelectedReward(null);
//                   }}
//                   className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//                 >
//                   Redeem Reward
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
