import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-[#F5E9DC] rounded-full flex items-center justify-center mb-6">
        <Package size={32} className="text-[#8B5E3C]" />
      </div>
      <h1 className="text-2xl font-semibold text-[#1A0D06] mb-2">পণ্যটি পাওয়া যায়নি</h1>
      <p className="text-[#8B5E3C] text-sm mb-8 max-w-xs">
        আপনি যে পণ্যটি খুঁজছেন তা হয়তো সরানো হয়েছে বা আর পাওয়া যাচ্ছে না।
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 bg-[#3D1F0E] text-[#F5E6D3] px-6 py-3 rounded-full text-sm font-medium hover:bg-[#2A1509] transition"
      >
        <ArrowLeft size={16} />
        শপে ফিরে যান
      </Link>
    </div>
  );
}
