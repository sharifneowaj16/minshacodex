'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Gift, Share2, X, Check, ShoppingBag, MapPin } from 'lucide-react';
import SocialLoginModal from './SocialLoginModal';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface GiftResult {
  giftUrl: string;
  waUrl: string;
  fbUrl: string;
  giftType: 'SEND_GIFT' | 'GET_GIFT';
}

interface LoggedInUser {
  id: string;
  name: string;
}

// ─────────────────────────────────────────────────────────────
// Shared result screen
// ─────────────────────────────────────────────────────────────
function GiftLinkResult({ result }: { result: GiftResult }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.giftUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ url: result.giftUrl }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
        <p className="text-sm font-semibold text-green-700">লিংক তৈরি হয়েছে!</p>
        <p className="text-xs text-green-600 mt-0.5 break-all">{result.giftUrl}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a href={result.waUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-semibold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
        <a href={result.fbUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 bg-[#1877F2] text-white rounded-xl text-xs font-semibold">
          Facebook
        </a>
      </div>
      <div className="flex gap-2">
        <button onClick={handleNativeShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#D4B896] rounded-xl text-xs font-medium text-[#3D1F0E]">
          <Share2 size={13} /> শেয়ার
        </button>
        <button onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#D4B896] rounded-xl text-xs font-medium text-[#3D1F0E]">
          {copied ? <><Check size={13} /> কপি!</> : 'লিংক কপি'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Send Gift form
// ─────────────────────────────────────────────────────────────
function SendGiftForm({
  user,
  productId,
  variantId,
}: {
  user: LoggedInUser;
  productId: string;
  variantId?: string | null;
}) {
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GiftResult | null>(null);

  const handleCreate = async () => {
    if (!recipientName.trim()) { alert('যাকে gift দেবে তার নাম দাও'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/gift/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId, variantId,
          giftType: 'SEND_GIFT',
          senderName: user.name,
          senderId: user.id,
          recipientName, message,
        }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else alert(data.error || 'হয়নি');
    } finally {
      setLoading(false);
    }
  };

  if (result) return <GiftLinkResult result={result} />;

  return (
    <div className="space-y-3">
      {/* Logged in as */}
      <div className="flex items-center gap-2 bg-[#F5E9DC] rounded-xl px-3 py-2">
        <div className="w-7 h-7 bg-[#3D1F0E] rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-semibold text-[#1A0D06]">{user.name}</p>
          <p className="text-[10px] text-[#8B5E3C]">তুমি gift পাঠাচ্ছ</p>
        </div>
        <Check size={13} className="text-green-500 ml-auto" />
      </div>

      <div>
        <label className="block text-xs text-[#6B4226] font-medium mb-1">যাকে gift দেবে *</label>
        <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
          placeholder="বন্ধুর নাম"
          className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm focus:outline-none focus:border-[#3D1F0E] bg-white" />
      </div>
      <div>
        <label className="block text-xs text-[#6B4226] font-medium mb-1">বার্তা <span className="text-[#A0856A] font-normal">(optional)</span></label>
        <input value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="শুভেচ্ছা বার্তা..."
          className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm focus:outline-none focus:border-[#3D1F0E] bg-white" />
      </div>
      <button onClick={handleCreate} disabled={loading}
        className="w-full py-3 bg-[#3D1F0E] text-[#F5E6D3] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
        {loading
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <><Gift size={14} /> Send Gift লিংক তৈরি করো</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Get Gift form
// ─────────────────────────────────────────────────────────────
function GetGiftForm({
  user,
  productId,
  variantId,
}: {
  user: LoggedInUser;
  productId: string;
  variantId?: string | null;
}) {
  const [step, setStep] = useState<'form' | 'address'>('form');
  const [payerName, setPayerName] = useState('');
  const [message, setMessage] = useState('');
  const [address, setAddress] = useState({ name: user.name, phone: '', street: '', city: 'ঢাকা' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GiftResult | null>(null);

  const handleCreate = async () => {
    if (!address.phone.trim() || !address.street.trim()) {
      alert('ফোন ও ঠিকানা দাও'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/gift/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId, variantId,
          giftType: 'GET_GIFT',
          requesterName: user.name,
          requesterId: user.id,
          payerName, message,
          requesterAddress: address,
        }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else alert(data.error || 'হয়নি');
    } finally {
      setLoading(false);
    }
  };

  if (result) return <GiftLinkResult result={result} />;

  return (
    <div className="space-y-3">
      {/* Logged in as */}
      <div className="flex items-center gap-2 bg-[#F5E9DC] rounded-xl px-3 py-2">
        <div className="w-7 h-7 bg-[#3D1F0E] rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-semibold text-[#1A0D06]">{user.name}</p>
          <p className="text-[10px] text-[#8B5E3C]">তুমি gift চাইছ</p>
        </div>
        <Check size={13} className="text-green-500 ml-auto" />
      </div>

      {step === 'form' ? (
        <>
          <div>
            <label className="block text-xs text-[#6B4226] font-medium mb-1">কার কাছে চাইছ *</label>
            <input value={payerName} onChange={(e) => setPayerName(e.target.value)}
              placeholder="বন্ধু / পরিবারের নাম"
              className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm focus:outline-none focus:border-[#3D1F0E] bg-white" />
          </div>
          <div>
            <label className="block text-xs text-[#6B4226] font-medium mb-1">বার্তা <span className="text-[#A0856A] font-normal">(optional)</span></label>
            <input value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="জন্মদিনের উপহার হিসেবে চাই!"
              className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm focus:outline-none focus:border-[#3D1F0E] bg-white" />
          </div>
          <button onClick={() => { if (!payerName.trim()) { alert('বন্ধুর নাম দাও'); return; } setStep('address'); }}
            className="w-full py-3 bg-[#3D1F0E] text-[#F5E6D3] rounded-2xl font-semibold text-sm">
            পরের ধাপ →
          </button>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold text-[#3D1F0E] flex items-center gap-1.5">
            <MapPin size={12} /> তোমার ডেলিভারি ঠিকানা
          </p>
          {[
            { key: 'phone', label: 'ফোন নম্বর *', placeholder: '01XXXXXXXXX', type: 'tel' },
            { key: 'street', label: 'বাড়ির ঠিকানা *', placeholder: 'বাড়ি/রাস্তা/এলাকা', type: 'text' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs text-[#6B4226] font-medium mb-1">{label}</label>
              <input type={type} value={address[key as keyof typeof address]}
                onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm focus:outline-none focus:border-[#3D1F0E] bg-white" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-[#6B4226] font-medium mb-1">জেলা</label>
            <select value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
              className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm bg-white">
              {['ঢাকা','চট্টগ্রাম','সিলেট','রাজশাহী','খুলনা','বরিশাল','রংপুর','ময়মনসিংহ'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('form')}
              className="flex-1 py-3 border border-[#D4B896] rounded-2xl text-sm text-[#3D1F0E]">
              ← পেছনে
            </button>
            <button onClick={handleCreate} disabled={loading}
              className="flex-1 py-3 bg-[#3D1F0E] text-[#F5E6D3] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><ShoppingBag size={14} /> Get Gift লিংক</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main GiftButtons component
// ─────────────────────────────────────────────────────────────
interface GiftButtonsProps {
  productId: string;
  productName: string;
  variantId?: string | null;
}

export function GiftButtons({ productId, productName, variantId }: GiftButtonsProps) {
  const { data: session } = useSession();
  const [modal, setModal] = useState<'send' | 'get' | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);

  // Check session on open
  const handleOpen = (type: 'send' | 'get') => {
    if (session?.user) {
      setLoggedInUser({
        id: (session.user as any).id,
        name: session.user.name || session.user.email || 'User',
      });
    }
    setModal(type);
  };

  const handleLoginSuccess = (userId: string, userName: string) => {
    setLoggedInUser({ id: userId, name: userName });
  };

  const isVerified = !!loggedInUser;

  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => handleOpen('send')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-[#D4B896] text-[#3D1F0E] text-sm font-medium hover:bg-[#F5E9DC] transition active:scale-95">
          <Gift size={14} /> Send Gift
        </button>
        <button onClick={() => handleOpen('get')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[#3D1F0E] text-[#F5E6D3] text-sm font-medium hover:bg-[#2A1509] transition active:scale-95">
          <ShoppingBag size={14} /> Get Gift
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="bg-[#FDF8F3] rounded-t-3xl w-full max-w-md p-5 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#1A0D06] flex items-center gap-2">
                {modal === 'send'
                  ? <><Gift size={16} className="text-[#3D1F0E]" /> Send Gift</>
                  : <><ShoppingBag size={16} className="text-[#3D1F0E]" /> Get Gift</>
                }
              </h3>
              <button onClick={() => setModal(null)} className="text-[#8B5E3C]"><X size={18} /></button>
            </div>

            <p className="text-xs text-[#8B5E3C] mb-4 bg-[#F5E9DC] rounded-xl px-3 py-2">
              {modal === 'send'
                ? 'তুমি gift পাঠাচ্ছ — বন্ধু ঠিকানা দেবে, তুমি pay করবে'
                : 'তুমি gift চাইছ — বন্ধু pay করবে, product তোমার কাছে আসবে'
              }
            </p>

            {/* Step 1: Login if not verified */}
            {!isVerified ? (
              <SocialLoginModal
                purpose={modal === 'send' ? 'send_gift' : 'get_gift'}
                onSuccess={handleLoginSuccess}
                onClose={() => setModal(null)}
              />
            ) : (
              /* Step 2: Gift form after login */
              modal === 'send' ? (
                <SendGiftForm user={loggedInUser!} productId={productId} variantId={variantId} />
              ) : (
                <GetGiftForm user={loggedInUser!} productId={productId} variantId={variantId} />
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ShareButton
interface ShareButtonProps {
  productName: string;
  productUrl: string;
}

export function ShareButton({ productName, productUrl }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: productName, url: productUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button onClick={handleShare}
      className="flex items-center gap-1.5 text-xs text-[#8B5E3C] hover:text-[#3D1F0E] transition py-1 whitespace-nowrap">
      {copied ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
      {copied ? 'কপি!' : 'শেয়ার'}
    </button>
  );
}

// backward compat
export function GiftRequestButton(props: GiftButtonsProps) {
  return <GiftButtons {...props} />;
}
