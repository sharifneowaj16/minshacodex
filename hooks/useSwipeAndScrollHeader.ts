// hooks/useSwipe.ts
// Image gallery-তে swipe gesture support

import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeHandlers) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (startX.current === null || startY.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - startY.current);

    // Ignore vertical scrolls
    if (dy > Math.abs(dx)) return;

    if (dx < -threshold) onSwipeLeft?.();
    if (dx > threshold) onSwipeRight?.();

    startX.current = null;
    startY.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchEnd };
}

// ─────────────────────────────────────────────────────────────
// hooks/useScrollHeader.ts
// Scroll করলে sticky header-এ product name + price দেখায়
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

export function useScrollHeader(threshold = 300) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > threshold);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);

  return visible;
}
