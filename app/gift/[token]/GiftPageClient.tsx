'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Gift, Heart, ShoppingBag, ArrowLeft, MapPin,
  Zap, Check, User, Phone,
} from 'lucide-react';

interface DeliveryAddress {
  name:  string;
  phone: string;
  street: string;
  city:  string;
  note?: string;
}

interface GiftData {
  gift: {
    token:            string;
    giftType:         'SEND_GIFT' | 'GET_GIFT';
    senderName:       string;
    recipientName:    string;
    message:          string | null;
    status:           string;
    expiresAt:        string;
    requesterAddress?: DeliveryAddress | null;
    requesterPhone?:   string | null;
  };
  product: {
    id:             string;
    name:           string;
    price:          number;
    compareAtPrice: number | null;
    image:          string;
    brand:          string;
    inStock:        boolean;
  };
}

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801700000000';

const DISTRICTS = [
  'ঢাকা','চট্টগ্রাম','সিলেট','রাজশাহী',
  'খুলনা','বরিশাল','রংপুর','ময়মনসিংহ',
];

export default function GiftPageClient({ data }: { data: GiftData }) {
  const { gift, product } = data;
  const { data: session } = useSession();
  const isSendGift = gift.giftType === 'SEND_GIFT';

  const [step, setStep]       = useState<'reveal' | 'checkout'>('reveal');
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // SEND_GIFT — recipient fills delivery address
  const [form, setForm] = useState<DeliveryAddress & { note: string }>({
    name: '', phone: '', street: '', city: 'ঢাকা', note: '',
  });

  // Guest payer info (if not logged in) for GET_GIFT
  const [guestPayer, setGuestPayer] = useState({ name: '', phone: '' });

  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const prefilledAddress = gift.requesterAddress;

  // ── Order handler ────────────────────────────────────────────────────────────
  const handleOrder = async () => {
    setError(null);

    // Validate
    if (isSendGift) {
      if (!form.name.trim() || !form.phone.trim() || !form.street.trim()) {
        setError('নাম, ফোন ও ঠিকানা দিন');
        return;
      }
    } else {
      // GET_GIFT — if not logged in, need payer name
      if (!session?.user && !guestPayer.name.trim()) {
        setError('তোমার নাম দিন');
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Create order via API
      const payload: Record<string, string | undefined> = {
        payerName:  session?.user?.name ?? guestPayer.name,
        payerPhone: guestPayer.phone || undefined,
      };

      if (isSendGift) {
        payload.name   = form.name;
        payload.phone  = form.phone;
        payload.street = form.street;
        payload.city   = form.city;
        payload.note   = form.note;
      }

      const res = await fetch(`/api/gift/${gift.token}/order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        setError(resData.error || 'Order create করতে পারিনি');
        return;
      }

      // 2. WhatsApp message (open in new tab)
      const deliveryAddr = isSendGift
        ? { name: form.name, phone: form.phone, street: form.street, city: form.city }
        : prefilledAddress!;

      const payerLabel = session?.user?.name ?? guestPayer.name;

      const msg = encodeURIComponent(
        isSendGift
          ? `🎁 GIFT ORDER (Send Gift)\n\nপণ্য: ${product.name}\nমূল্য: ৳${product.price.toLocaleString()}\n\nপ্রাপক: ${deliveryAddr.name}\nফোন: ${deliveryAddr.phone}\nঠিকানা: ${deliveryAddr.street}, ${deliveryAddr.city}\n\nউপহার: ${gift.senderName} এর পক্ষ থেকে\nOrder: #${resData.orderNumber}\nGift Token: ${gift.token}`
          : `🎁 GIFT ORDER (Get Gift)\n\nপণ্য: ${product.name}\nমূল্য: ৳${product.price.toLocaleString()}\n\nPayer: ${payerLabel}\nDelivery to: ${deliveryAddr!.name}\nফোন: ${deliveryAddr!.phone}\nঠিকানা: ${deliveryAddr!.street}, ${deliveryAddr!.city}\n\nOrder: #${resData.orderNumber}\nGift Token: ${gift.token}`
      );

      window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');

      setDone(true);
    } catch {
      setError('Network error। আবার try করুন।');
    } finally {
      setLoading(false);
    }
  };

  // ── Done ──────────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center px-5 text-center">
        <div className="w-20 h-20 bg-[#F5E9DC] rounded-full flex items-center justify-center mb-5">
          <Heart size={36} className="text-[#3D1F0E] fill-[#3D1F0E]" />
        </div>
        <h1 className="text-2xl font-semibold text-[#1A0D06] mb-2">অর্ডার নিশ্চিত হয়েছে!</h1>
        <p className="text-sm text-[#8B5E3C] mb-1">আমরা শীঘ্রই WhatsApp-এ যোগাযোগ করব।</p>
        {isSendGift ? (
          <p className="text-xs text-[#A0856A]">{gift.senderName} জানতে পারবে তুমি গিফটটি গ্রহণ করেছ ❤️</p>
        ) : (
          <p className="text-xs text-[#A0856A]">{gift.senderName} কে ধন্যবাদ এই সুন্দর গিফটের জন্য ❤️</p>
        )}
        <Link href="/shop" className="mt-8 text-sm text-[#3D1F0E] underline underline-offset-2">
          আরো পণ্য দেখো
        </Link>
      </div>
    );
  }

  // ── Reveal screen ─────────────────────────────────────────────────────────────
  if (step === 'reveal') {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col">
        <div className="bg-[#3D1F0E] px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-[#F5E6D3]"><ArrowLeft size={18} /></Link>
          <span className="text-[#F5E6D3] text-sm font-semibold tracking-widest uppercase">Minsah Beauty</span>
          <div className="w-5" />
        </div>

        <div className="flex-1 flex flex-col items-center px-5 pt-8 pb-32 max-w-md mx-auto w-full">

          {/* Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-[#F5E9DC] rounded-full flex items-center justify-center shadow-lg">
              {isSendGift
                ? <Gift size={40} className="text-[#3D1F0E]" />
                : <ShoppingBag size={40} className="text-[#3D1F0E]" />}
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Heart size={14} className="text-white fill-white" />
            </div>
          </div>

          {/* Heading */}
          {isSendGift ? (
            <>
              <p className="text-sm text-[#8B5E3C] mb-1">তোমার জন্য বিশেষ উপহার!</p>
              <h1 className="text-2xl font-semibold text-[#1A0D06] text-center mb-1">{gift.recipientName}</h1>
              <p className="text-sm text-[#6B4226] mb-6 text-center">
                <span className="font-semibold text-[#3D1F0E]">{gift.senderName}</span> তোমাকে gift করতে চায়
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-[#8B5E3C] mb-1">একটি gift request এসেছে!</p>
              <h1 className="text-2xl font-semibold text-[#1A0D06] text-center mb-1">{gift.recipientName}</h1>
              <p className="text-sm text-[#6B4226] mb-6 text-center">
                <span className="font-semibold text-[#3D1F0E]">{gift.senderName}</span> তোমার কাছে এই product চাইছে
              </p>
            </>
          )}

          {/* Personal message */}
          {gift.message && (
            <div className="w-full bg-[#F5E9DC] rounded-2xl px-4 py-3 mb-6 border-l-4 border-[#C4956A]">
              <p className="text-sm text-[#4A2C1A] italic leading-relaxed">"{gift.message}"</p>
            </div>
          )}

          {/* GET_GIFT — show prefilled address */}
          {!isSendGift && prefilledAddress && (
            <div className="w-full bg-[#F5E9DC] rounded-2xl p-4 mb-6">
              <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <MapPin size={12} /> পাঠানোর ঠিকানা
              </p>
              <p className="text-sm font-medium text-[#1A0D06]">{prefilledAddress.name}</p>
              <p className="text-xs text-[#6B4226]">{prefilledAddress.phone}</p>
              <p className="text-xs text-[#6B4226]">{prefilledAddress.street}, {prefilledAddress.city}</p>
            </div>
          )}

          {/* Product card */}
          <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8D5C0] mb-6">
            <div className="aspect-[4/3] bg-[#F5E9DC] relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/400x300/F5E9DC/8B5E3C?text=Product';
                }}
              />
              {discountPct && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{discountPct}%
                </span>
              )}
            </div>
            <div className="p-4">
              {product.brand && (
                <span className="text-xs bg-[#F5E9DC] text-[#6B4226] px-2 py-0.5 rounded-full font-medium">
                  {product.brand}
                </span>
              )}
              <h2 className="text-base font-semibold text-[#1A0D06] mt-2">{product.name}</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-semibold text-[#1A0D06]">
                  ৳{product.price.toLocaleString('bn-BD')}
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-[#A0856A] line-through">
                    ৳{product.compareAtPrice.toLocaleString('bn-BD')}
                  </span>
                )}
              </div>
              {isSendGift ? (
                <p className="text-xs text-[#8B5E3C] mt-1">{gift.senderName} সম্পূর্ণ মূল্য পরিশোধ করবে</p>
              ) : (
                <p className="text-xs text-[#8B5E3C] mt-1">তুমি payment করবে, {gift.senderName} এর কাছে পৌঁছাবে</p>
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setStep('checkout')}
            className="w-full bg-[#3D1F0E] text-[#F5E6D3] py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition"
          >
            {isSendGift
              ? <><Gift size={18} /> গিফটটি গ্রহণ করো</>
              : <><ShoppingBag size={18} /> Gift করতে চাই</>}
          </button>

          <p className="text-xs text-[#A0856A] mt-3 text-center">
            Link মেয়াদ: {new Date(gift.expiresAt).toLocaleDateString('bn-BD')} পর্যন্ত
          </p>
        </div>
      </div>
    );
  }

  // ── Checkout screen ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="bg-[#3D1F0E] px-4 py-3 flex items-center gap-3">
        <button onClick={() => setStep('reveal')} className="text-[#F5E6D3]">
          <ArrowLeft size={18} />
        </button>
        <span className="text-[#F5E6D3] text-sm font-semibold">
          {isSendGift ? 'তোমার ডেলিভারি তথ্য দাও' : 'Payment করে Gift দাও'}
        </span>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 pb-32 space-y-4">

        {/* Mini product recap */}
        <div className="flex gap-3 bg-white rounded-2xl p-3 border border-[#E8D5C0]">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 rounded-xl object-cover bg-[#F5E9DC]"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
          />
          <div>
            <p className="text-xs text-[#8B5E3C]">
              {isSendGift
                ? `Gift: ${gift.senderName} এর পক্ষ থেকে`
                : `Request: ${gift.senderName} এর জন্য`}
            </p>
            <p className="text-sm font-semibold text-[#1A0D06] leading-snug">{product.name}</p>
            <p className="text-sm font-semibold text-[#3D1F0E]">৳{product.price.toLocaleString('bn-BD')}</p>
          </div>
        </div>

        {/* SEND_GIFT — recipient fills address */}
        {isSendGift && (
          <div className="bg-white rounded-2xl p-4 border border-[#E8D5C0] space-y-3">
            <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide flex items-center gap-1.5">
              <MapPin size={12} /> তোমার ঠিকানা
            </p>
            {([
              { key: 'name',   label: 'তোমার নাম *',       placeholder: 'পুরো নাম',         type: 'text' },
              { key: 'phone',  label: 'ফোন নম্বর *',        placeholder: '01XXXXXXXXX',      type: 'tel'  },
              { key: 'street', label: 'বাড়ির ঠিকানা *',    placeholder: 'বাড়ি/রাস্তা',     type: 'text' },
              { key: 'note',   label: 'বিশেষ নির্দেশনা',   placeholder: 'যেমন: সন্ধ্যায় দিও', type: 'text' },
            ] as const).map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-[#6B4226] mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm focus:outline-none focus:border-[#3D1F0E] bg-[#FDF8F3]"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-[#6B4226] mb-1">জেলা</label>
              <select
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm bg-[#FDF8F3]"
              >
                {DISTRICTS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* GET_GIFT — prefilled address shown, payer identity collected */}
        {!isSendGift && (
          <>
            {/* Prefilled address display */}
            {prefilledAddress && (
              <div className="bg-white rounded-2xl p-4 border border-[#E8D5C0]">
                <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide flex items-center gap-1.5 mb-3">
                  <MapPin size={12} /> ডেলিভারি যাবে
                </p>
                <div className="bg-[#F5E9DC] rounded-xl p-3">
                  <p className="text-sm font-semibold text-[#1A0D06]">{prefilledAddress.name}</p>
                  <p className="text-xs text-[#6B4226]">{prefilledAddress.phone}</p>
                  <p className="text-xs text-[#6B4226]">{prefilledAddress.street}, {prefilledAddress.city}</p>
                </div>
                <p className="text-xs text-[#8B5E3C] mt-2 flex items-center gap-1">
                  <Check size={11} className="text-green-500" />
                  ঠিকানা {gift.senderName} আগেই দিয়ে রেখেছে
                </p>
              </div>
            )}

            {/* Payer identity — skip if logged in */}
            {!session?.user && (
              <div className="bg-white rounded-2xl p-4 border border-[#E8D5C0] space-y-3">
                <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide flex items-center gap-1.5">
                  <User size={12} /> তোমার পরিচয়
                </p>
                <div>
                  <label className="block text-xs font-medium text-[#6B4226] mb-1">তোমার নাম *</label>
                  <input
                    type="text"
                    value={guestPayer.name}
                    onChange={(e) => setGuestPayer((p) => ({ ...p, name: e.target.value }))}
                    placeholder="পুরো নাম"
                    className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm focus:outline-none focus:border-[#3D1F0E] bg-[#FDF8F3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B4226] mb-1">ফোন নম্বর</label>
                  <input
                    type="tel"
                    value={guestPayer.phone}
                    onChange={(e) => setGuestPayer((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm focus:outline-none focus:border-[#3D1F0E] bg-[#FDF8F3]"
                  />
                </div>
              </div>
            )}

            {/* Logged in — show their name */}
            {session?.user && (
              <div className="bg-[#F5E9DC] rounded-2xl p-3 border border-[#E8D5C0] flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                <p className="text-xs text-[#4A2C1A]">
                  তুমি <span className="font-semibold">{session.user.name}</span> হিসেবে payment করবে
                </p>
              </div>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8D5C0] px-4 py-3 max-w-md mx-auto">
        <button
          onClick={handleOrder}
          disabled={loading}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-95 ${
            loading
              ? 'bg-[#C4A882] text-white cursor-not-allowed'
              : 'bg-[#3D1F0E] text-[#F5E6D3]'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              অর্ডার হচ্ছে...
            </span>
          ) : (
            <>
              <Zap size={15} />
              {isSendGift
                ? 'Gift Order নিশ্চিত করো'
                : `Gift করো — ৳${product.price.toLocaleString()}`}
            </>
          )}
        </button>
        <p className="text-xs text-center text-[#A0856A] mt-1.5">
          {isSendGift
            ? `${gift.senderName} সম্পূর্ণ মূল্য পরিশোধ করবে`
            : `Payment তুমি করবে, delivery যাবে ${gift.senderName}-এর কাছে`}
        </p>
      </div>
    </div>
  );
}
// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { Gift, Heart, ShoppingBag, ArrowLeft, MapPin, Zap, Check } from 'lucide-react';

// interface DeliveryAddress {
//   name: string;
//   phone: string;
//   street: string;
//   city: string;
//   note?: string;
// }

// interface GiftData {
//   gift: {
//     token: string;
//     giftType: 'SEND_GIFT' | 'GET_GIFT';
//     senderName: string;
//     recipientName: string;
//     message: string | null;
//     status: string;
//     expiresAt: string;
//     requesterAddress?: DeliveryAddress | null;
//     requesterPhone?: string | null;
//   };
//   product: {
//     id: string;
//     name: string;
//     price: number;
//     compareAtPrice: number | null;
//     image: string;
//     brand: string;
//     inStock: boolean;
//   };
// }

// const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801700000000';

// export default function GiftPageClient({ data }: { data: GiftData }) {
//   const { gift, product } = data;
//   const isSendGift = gift.giftType === 'SEND_GIFT';

//   const [step, setStep] = useState<'reveal' | 'checkout'>('reveal');
//   const [done, setDone] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // For SEND_GIFT — recipient fills address
//   const [form, setForm] = useState<DeliveryAddress & { note: string }>({
//     name: '',
//     phone: '',
//     street: '',
//     city: 'ঢাকা',
//     note: '',
//   });

//   const discountPct =
//     product.compareAtPrice && product.compareAtPrice > product.price
//       ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
//       : null;

//   // For GET_GIFT — address pre-filled from requester
//   const prefilledAddress = gift.requesterAddress;

//   const handleOrder = async () => {
//     if (isSendGift) {
//       if (!form.name.trim() || !form.phone.trim() || !form.street.trim()) {
//         alert('নাম, ফোন ও ঠিকানা দিন');
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       const deliveryAddress: DeliveryAddress = isSendGift
//         ? { name: form.name, phone: form.phone, street: form.street, city: form.city, note: form.note }
//         : prefilledAddress!;

//       const msg = encodeURIComponent(
//         isSendGift
//           ? `🎁 GIFT ORDER (Send Gift)\n\nপণ্য: ${product.name}\nমূল্য: ৳${product.price.toLocaleString()}\n\nপ্রাপক: ${deliveryAddress.name}\nফোন: ${deliveryAddress.phone}\nঠিকানা: ${deliveryAddress.street}, ${deliveryAddress.city}\n\nউপহার: ${gift.senderName} এর পক্ষ থেকে\nGift Token: ${gift.token}`
//           : `🎁 GIFT ORDER (Get Gift)\n\nপণ্য: ${product.name}\nমূল্য: ৳${product.price.toLocaleString()}\n\nPayer: ${gift.recipientName}\nDelivery to: ${deliveryAddress.name}\nফোন: ${deliveryAddress.phone}\nঠিকানা: ${deliveryAddress.street}, ${deliveryAddress.city}\n\nGift Token: ${gift.token}`
//       );

//       window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
//       await fetch(`/api/gift/${gift.token}/order`, { method: 'POST' }).catch(() => {});
//       setDone(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Done ──────────────────────────────────────────────────────
//   if (done) {
//     return (
//       <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center px-5 text-center">
//         <div className="w-20 h-20 bg-[#F5E9DC] rounded-full flex items-center justify-center mb-5">
//           <Heart size={36} className="text-[#3D1F0E] fill-[#3D1F0E]" />
//         </div>
//         <h1 className="text-2xl font-semibold text-[#1A0D06] mb-2">অর্ডার নিশ্চিত হয়েছে!</h1>
//         <p className="text-sm text-[#8B5E3C] mb-1">আমরা শীঘ্রই WhatsApp-এ যোগাযোগ করব।</p>
//         {isSendGift ? (
//           <p className="text-xs text-[#A0856A]">{gift.senderName} জানতে পারবে তুমি গিফটটি গ্রহণ করেছ ❤️</p>
//         ) : (
//           <p className="text-xs text-[#A0856A]">{gift.senderName} কে ধন্যবাদ এই সুন্দর গিফটের জন্য ❤️</p>
//         )}
//         <Link href="/shop" className="mt-8 text-sm text-[#3D1F0E] underline underline-offset-2">
//           আরো পণ্য দেখো
//         </Link>
//       </div>
//     );
//   }

//   // ── Reveal screen ─────────────────────────────────────────────
//   if (step === 'reveal') {
//     return (
//       <div className="min-h-screen bg-[#FDF8F3] flex flex-col">
//         <div className="bg-[#3D1F0E] px-4 py-3 flex items-center justify-between">
//           <Link href="/" className="text-[#F5E6D3]"><ArrowLeft size={18} /></Link>
//           <span className="text-[#F5E6D3] text-sm font-semibold tracking-widest uppercase">Minsah Beauty</span>
//           <div className="w-5" />
//         </div>

//         <div className="flex-1 flex flex-col items-center px-5 pt-8 pb-32 max-w-md mx-auto w-full">

//           {/* Icon */}
//           <div className="relative mb-6">
//             <div className="w-24 h-24 bg-[#F5E9DC] rounded-full flex items-center justify-center shadow-lg">
//               {isSendGift
//                 ? <Gift size={40} className="text-[#3D1F0E]" />
//                 : <ShoppingBag size={40} className="text-[#3D1F0E]" />
//               }
//             </div>
//             <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
//               <Heart size={14} className="text-white fill-white" />
//             </div>
//           </div>

//           {/* Heading */}
//           {isSendGift ? (
//             <>
//               <p className="text-sm text-[#8B5E3C] mb-1">তোমার জন্য বিশেষ উপহার!</p>
//               <h1 className="text-2xl font-semibold text-[#1A0D06] text-center mb-1">{gift.recipientName}</h1>
//               <p className="text-sm text-[#6B4226] mb-6 text-center">
//                 <span className="font-semibold text-[#3D1F0E]">{gift.senderName}</span> তোমাকে gift করতে চায়
//               </p>
//             </>
//           ) : (
//             <>
//               <p className="text-sm text-[#8B5E3C] mb-1">একটি gift request এসেছে!</p>
//               <h1 className="text-2xl font-semibold text-[#1A0D06] text-center mb-1">{gift.recipientName}</h1>
//               <p className="text-sm text-[#6B4226] mb-6 text-center">
//                 <span className="font-semibold text-[#3D1F0E]">{gift.senderName}</span> তোমার কাছে এই product চাইছে
//               </p>
//             </>
//           )}

//           {/* Personal message */}
//           {gift.message && (
//             <div className="w-full bg-[#F5E9DC] rounded-2xl px-4 py-3 mb-6 border-l-4 border-[#C4956A]">
//               <p className="text-sm text-[#4A2C1A] italic leading-relaxed">"{gift.message}"</p>
//             </div>
//           )}

//           {/* GET_GIFT — show delivery address */}
//           {!isSendGift && prefilledAddress && (
//             <div className="w-full bg-[#F5E9DC] rounded-2xl p-4 mb-6">
//               <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide flex items-center gap-1.5 mb-2">
//                 <MapPin size={12} /> পাঠানোর ঠিকানা
//               </p>
//               <p className="text-sm font-medium text-[#1A0D06]">{prefilledAddress.name}</p>
//               <p className="text-xs text-[#6B4226]">{prefilledAddress.phone}</p>
//               <p className="text-xs text-[#6B4226]">{prefilledAddress.street}, {prefilledAddress.city}</p>
//             </div>
//           )}

//           {/* Product card */}
//           <div className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8D5C0] mb-6">
//             <div className="aspect-[4/3] bg-[#F5E9DC] relative">
//               <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/F5E9DC/8B5E3C?text=Product';
//                 }}
//               />
//               {discountPct && (
//                 <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
//                   -{discountPct}%
//                 </span>
//               )}
//             </div>
//             <div className="p-4">
//               {product.brand && (
//                 <span className="text-xs bg-[#F5E9DC] text-[#6B4226] px-2 py-0.5 rounded-full font-medium">
//                   {product.brand}
//                 </span>
//               )}
//               <h2 className="text-base font-semibold text-[#1A0D06] mt-2">{product.name}</h2>
//               <div className="flex items-baseline gap-2 mt-1">
//                 <span className="text-lg font-semibold text-[#1A0D06]">
//                   ৳{product.price.toLocaleString('bn-BD')}
//                 </span>
//                 {product.compareAtPrice && (
//                   <span className="text-sm text-[#A0856A] line-through">
//                     ৳{product.compareAtPrice.toLocaleString('bn-BD')}
//                   </span>
//                 )}
//               </div>
//               {isSendGift ? (
//                 <p className="text-xs text-[#8B5E3C] mt-1">{gift.senderName} সম্পূর্ণ মূল্য পরিশোধ করবে</p>
//               ) : (
//                 <p className="text-xs text-[#8B5E3C] mt-1">তুমি payment করবে, {gift.senderName} এর কাছে পৌঁছাবে</p>
//               )}
//             </div>
//           </div>

//           {/* CTA */}
//           <button
//             onClick={() => setStep('checkout')}
//             className="w-full bg-[#3D1F0E] text-[#F5E6D3] py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition"
//           >
//             {isSendGift
//               ? <><Gift size={18} /> গিফটটি গ্রহণ করো</>
//               : <><ShoppingBag size={18} /> Gift করতে চাই</>
//             }
//           </button>

//           <p className="text-xs text-[#A0856A] mt-3 text-center">
//             Link মেয়াদ: {new Date(gift.expiresAt).toLocaleDateString('bn-BD')} পর্যন্ত
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ── Checkout screen ───────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-[#FDF8F3]">
//       <div className="bg-[#3D1F0E] px-4 py-3 flex items-center gap-3">
//         <button onClick={() => setStep('reveal')} className="text-[#F5E6D3]">
//           <ArrowLeft size={18} />
//         </button>
//         <span className="text-[#F5E6D3] text-sm font-semibold">
//           {isSendGift ? 'তোমার ডেলিভারি তথ্য দাও' : 'Payment করে Gift দাও'}
//         </span>
//       </div>

//       <div className="max-w-md mx-auto px-4 pt-5 pb-32 space-y-4">

//         {/* Mini product recap */}
//         <div className="flex gap-3 bg-white rounded-2xl p-3 border border-[#E8D5C0]">
//           <img
//             src={product.image}
//             alt={product.name}
//             className="w-14 h-14 rounded-xl object-cover bg-[#F5E9DC]"
//             onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
//           />
//           <div>
//             <p className="text-xs text-[#8B5E3C]">
//               {isSendGift
//                 ? `Gift: ${gift.senderName} এর পক্ষ থেকে`
//                 : `Request: ${gift.senderName} এর জন্য`
//               }
//             </p>
//             <p className="text-sm font-semibold text-[#1A0D06] leading-snug">{product.name}</p>
//             <p className="text-sm font-semibold text-[#3D1F0E]">৳{product.price.toLocaleString('bn-BD')}</p>
//           </div>
//         </div>

//         {/* SEND_GIFT — recipient fills address */}
//         {isSendGift && (
//           <div className="bg-white rounded-2xl p-4 border border-[#E8D5C0] space-y-3">
//             <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide flex items-center gap-1.5">
//               <MapPin size={12} /> তোমার ঠিকানা
//             </p>
//             {([
//               { key: 'name',   label: 'তোমার নাম *',       placeholder: 'পুরো নাম',        type: 'text' },
//               { key: 'phone',  label: 'ফোন নম্বর *',        placeholder: '01XXXXXXXXX',     type: 'tel'  },
//               { key: 'street', label: 'বাড়ির ঠিকানা *',    placeholder: 'বাড়ি/রাস্তা',    type: 'text' },
//               { key: 'note',   label: 'বিশেষ নির্দেশনা',   placeholder: 'যেমন: সন্ধ্যায় দিও', type: 'text' },
//             ] as const).map(({ key, label, placeholder, type }) => (
//               <div key={key}>
//                 <label className="block text-xs font-medium text-[#6B4226] mb-1">{label}</label>
//                 <input
//                   type={type}
//                   value={form[key]}
//                   onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
//                   placeholder={placeholder}
//                   className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm focus:outline-none focus:border-[#3D1F0E] bg-[#FDF8F3]"
//                 />
//               </div>
//             ))}
//             <div>
//               <label className="block text-xs font-medium text-[#6B4226] mb-1">জেলা</label>
//               <select
//                 value={form.city}
//                 onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
//                 className="w-full px-3 py-2.5 border border-[#D4B896] rounded-xl text-sm bg-[#FDF8F3]"
//               >
//                 {['ঢাকা','চট্টগ্রাম','সিলেট','রাজশাহী','খুলনা','বরিশাল','রংপুর','ময়মনসিংহ'].map((c) => (
//                   <option key={c} value={c}>{c}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         )}

//         {/* GET_GIFT — address pre-filled, just confirm */}
//         {!isSendGift && prefilledAddress && (
//           <div className="bg-white rounded-2xl p-4 border border-[#E8D5C0]">
//             <p className="text-xs font-semibold text-[#3D1F0E] uppercase tracking-wide flex items-center gap-1.5 mb-3">
//               <MapPin size={12} /> ডেলিভারি যাবে
//             </p>
//             <div className="bg-[#F5E9DC] rounded-xl p-3">
//               <p className="text-sm font-semibold text-[#1A0D06]">{prefilledAddress.name}</p>
//               <p className="text-xs text-[#6B4226]">{prefilledAddress.phone}</p>
//               <p className="text-xs text-[#6B4226]">{prefilledAddress.street}, {prefilledAddress.city}</p>
//             </div>
//             <p className="text-xs text-[#8B5E3C] mt-2 flex items-center gap-1">
//               <Check size={11} className="text-green-500" />
//               ঠিকানা {gift.senderName} আগেই দিয়ে রেখেছে
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Sticky CTA */}
//       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8D5C0] px-4 py-3 max-w-md mx-auto">
//         <button
//           onClick={handleOrder}
//           disabled={loading}
//           className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-95 ${
//             loading ? 'bg-[#C4A882] text-white cursor-not-allowed' : 'bg-[#3D1F0E] text-[#F5E6D3]'
//           }`}
//         >
//           {loading ? (
//             <span className="flex items-center gap-2">
//               <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//               অর্ডার হচ্ছে...
//             </span>
//           ) : (
//             <>
//               <Zap size={15} />
//               {isSendGift ? 'Gift Order নিশ্চিত করো' : `Gift করো — ৳${product.price.toLocaleString()}`}
//             </>
//           )}
//         </button>
//         <p className="text-xs text-center text-[#A0856A] mt-1.5">
//           {isSendGift
//             ? `${gift.senderName} সম্পূর্ণ মূল্য পরিশোধ করবে`
//             : `Payment তুমি করবে, delivery যাবে ${gift.senderName}-এর কাছে`
//           }
//         </p>
//       </div>
//     </div>
//   );
// }
