'use client';

import { useState } from 'react';
import { Star, CheckCircle, ChevronDown } from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  createdAt: string;
}

interface RatingData {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

interface ReviewSectionProps {
  reviews: Review[];
  rating: RatingData;
}

function StarRow({ filled }: { filled: boolean }) {
  return (
    <Star
      size={12}
      className={filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
    />
  );
}

export default function ReviewSection({ reviews, rating }: ReviewSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? reviews : reviews.slice(0, 3);

  if (rating.total === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[#8B5E3C]">এখনো কোনো রিভিউ নেই।</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4 bg-[#F5E9DC] rounded-2xl p-4 items-center">
        <div className="text-center flex-shrink-0">
          <p className="text-4xl font-semibold text-[#3D1F0E]">{rating.average.toFixed(1)}</p>
          <div className="flex gap-0.5 justify-center my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <StarRow key={s} filled={s <= Math.round(rating.average)} />
            ))}
          </div>
          <p className="text-xs text-[#8B5E3C]">{rating.total} রিভিউ</p>
        </div>

        {/* Bar chart */}
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = rating.distribution[star] ?? 0;
            const pct = rating.total > 0 ? Math.round((count / rating.total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-1.5">
                <span className="text-xs text-[#8B5E3C] w-2.5">{star}</span>
                <Star size={8} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                <div className="flex-1 h-1.5 bg-[#E8D5C0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-[#8B5E3C] w-7 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-3">
        {displayed.map((review) => (
          <div key={review.id} className="bg-[#F5E9DC] rounded-2xl p-4">
            {/* Stars + name */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarRow key={s} filled={s <= review.rating} />
                  ))}
                </div>
                {review.title && (
                  <p className="text-xs font-semibold text-[#1A0D06]">{review.title}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs font-medium text-[#3D1F0E]">{review.userName}</span>
                {review.verified && (
                  <CheckCircle size={11} className="text-green-500" />
                )}
              </div>
            </div>

            {review.content && (
              <p className="text-xs text-[#4A2C1A] leading-relaxed">{review.content}</p>
            )}

            <p className="text-xs text-[#A0856A] mt-2">
              {new Date(review.createdAt).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        ))}
      </div>

      {/* Show more */}
      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-[#3D1F0E] border border-[#D4B896] rounded-2xl hover:bg-[#F5E9DC] transition"
        >
          {showAll ? 'কম দেখুন' : `সব ${reviews.length}টি রিভিউ দেখুন`}
          <ChevronDown size={14} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}
