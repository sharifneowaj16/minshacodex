'use client';

import { useState } from 'react';
import {
  Copy,
  CheckCircle,
  Users,
  DollarSign,
  Clock,
  Mail,
  X,
  Facebook,
  Twitter,
  Link as LinkIcon,
} from 'lucide-react';

// ✅ Icon map — string থেকে component
const ICON_MAP: Record<string, React.ElementType> = {
  Copy,
  Mail,
  Facebook,
  Twitter,
  Users,
  Clock,
  DollarSign,
  Link: LinkIcon,
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || Copy;
  return <Icon className={className} />;
}

interface ShareOption {
  name: string;
  icon: string; // ✅ string, not component
  action: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface ReferralsClientProps {
  referralData: any;
  referrals: any[];
  shareOptions: ShareOption[];
  emailTemplates: EmailTemplate[];
}

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  made_purchase: 'bg-blue-100 text-blue-800',
  signed_up: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-gray-100 text-gray-600',
};

export function ReferralsClient({ referralData, referrals, shareOptions, emailTemplates }: ReferralsClientProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(emailTemplates[0]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (action: string) => {
    if (action === 'copy') handleCopyLink();
    else if (action === 'email') setShowEmailModal(true);
    else if (action === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralData.referralLink)}`, '_blank');
    } else if (action === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me at Minsah Beauty! Use code ${referralData.referralCode}`)}&url=${encodeURIComponent(referralData.referralLink)}`, '_blank');
    }
  };

  const formatPoints = (points: number) => points.toLocaleString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Referral Program</h1>
        <p className="text-gray-600">Share the love and earn rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center space-x-3">
            <Users className="w-7 h-7 text-purple-600" />
            <div>
              <p className="text-xs text-gray-500">Total Referrals</p>
              <p className="text-2xl font-bold">{referralData.totalReferrals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-7 h-7 text-green-600" />
            <div>
              <p className="text-xs text-gray-500">Successful</p>
              <p className="text-2xl font-bold">{referralData.successfulReferrals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-7 h-7 text-blue-600" />
            <div>
              <p className="text-xs text-gray-500">Points Earned</p>
              <p className="text-2xl font-bold">{formatPoints(referralData.totalEarned)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center space-x-3">
            <Clock className="w-7 h-7 text-yellow-600" />
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold">{referralData.pendingReferrals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Share Your Referral Code</h2>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Your referral code</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-purple-600">{referralData.referralCode}</p>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 break-all">{referralData.referralLink}</p>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => handleShare(option.action)}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
            >
              {/* ✅ icon string → component */}
              <DynamicIcon name={option.icon} className="w-6 h-6 mb-2 text-purple-600" />
              <span className="text-sm text-gray-700">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Referral List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Referrals</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {referrals.map((referral) => (
            <div key={referral.id} className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{referral.referredName}</p>
                <p className="text-sm text-gray-500">{referral.referredEmail}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(referral.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${statusColors[referral.status] || 'bg-gray-100 text-gray-600'}`}>
                  {referral.status.replace('_', ' ')}
                </span>
                {referral.rewardPoints > 0 && (
                  <p className="text-sm font-semibold text-purple-600">+{formatPoints(referral.rewardPoints)} pts</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Send Referral Email</h3>
              <button onClick={() => setShowEmailModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Template Selector */}
            <div className="flex gap-2 mb-4">
              {emailTemplates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedTemplate.id === tmpl.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>

            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {selectedTemplate.body
                .replace('{referralCode}', referralData.referralCode)
                .replace('{referralLink}', referralData.referralLink)
                .replace('{senderName}', 'Your friend')}
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Send Email
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
// import { Copy, CheckCircle as CheckCircleSolid, Users, DollarSign, Clock, Mail, MessageSquare, X, Sparkles } from 'lucide-react';

// interface ReferralsClientProps {
//   referralData: any;
//   referrals: any[];
//   shareOptions: any[];
//   emailTemplates: any[];
// }

// export function ReferralsClient({ referralData, referrals, shareOptions, emailTemplates }: ReferralsClientProps) {
//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);
//   const [customMessage, setCustomMessage] = useState('');
//   const [recipientEmail, setRecipientEmail] = useState('');
//   const [copied, setCopied] = useState(false);

//   const handleCopyLink = () => {
//     navigator.clipboard.writeText(referralData.referralLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleShare = (action: string) => {
//     if (action === 'copy') handleCopyLink();
//     else if (action === 'email') setShowEmailModal(true);
//   };

//   const formatPoints = (points: number) => points.toLocaleString();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Program</h1>
//           <p className="text-gray-600">Share the love and earn rewards</p>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center space-x-3">
//               <Users className="w-8 h-8 text-purple-600" />
//               <div>
//                 <p className="text-sm text-gray-600">Total Referrals</p>
//                 <p className="text-2xl font-bold">{referralData.totalReferrals}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center space-x-3">
//               <CheckCircleSolid className="w-8 h-8 text-green-600" />
//               <div>
//                 <p className="text-sm text-gray-600">Successful</p>
//                 <p className="text-2xl font-bold">{referralData.successfulReferrals}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center space-x-3">
//               <DollarSign className="w-8 h-8 text-blue-600" />
//               <div>
//                 <p className="text-sm text-gray-600">Points Earned</p>
//                 <p className="text-2xl font-bold">{formatPoints(referralData.totalEarned)}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center space-x-3">
//               <Clock className="w-8 h-8 text-yellow-600" />
//               <div>
//                 <p className="text-sm text-gray-600">Pending</p>
//                 <p className="text-2xl font-bold">{referralData.pendingReferrals}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <h2 className="text-xl font-semibold mb-6">Share Your Referral Code</h2>
//           <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
//             <p className="text-sm text-gray-600 mb-2">Your referral code</p>
//             <p className="text-3xl font-bold text-purple-600 mb-4">{referralData.referralCode}</p>
//             <button
//               onClick={handleCopyLink}
//               className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700"
//             >
//               {copied ? <><CheckCircleSolid className="w-5 h-5" /><span>Copied!</span></> : <><Copy className="w-5 h-5" /><span>Copy Link</span></>}
//             </button>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {shareOptions.map((option) => (
//               <button
//                 key={option.name}
//                 onClick={() => handleShare(option.action)}
//                 className="flex flex-col items-center p-4 border rounded-lg hover:border-purple-300"
//               >
//                 <option.icon className="w-6 h-6 mb-2" />
//                 <span className="text-sm">{option.name}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {showEmailModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-semibold">Send Referral Email</h3>
//                 <button onClick={() => setShowEmailModal(false)}><X className="w-5 h-5" /></button>
//               </div>
//               <input
//                 type="email"
//                 value={recipientEmail}
//                 onChange={(e) => setRecipientEmail(e.target.value)}
//                 placeholder="friend@example.com"
//                 className="w-full px-4 py-2 border rounded-lg mb-4"
//               />
//               <div className="flex justify-end space-x-3">
//                 <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
//                 <button onClick={() => setShowEmailModal(false)} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Send</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
