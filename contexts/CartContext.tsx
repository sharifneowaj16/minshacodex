'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Types
export interface CartItem {
  id: string;
  variantId?: string | null;
  cartItemId?: string; // DB cart item ID (only for logged-in users)
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  landmark?: string;
  provinceRegion: string;
  city: string;
  zone: string;
  address: string;
  type: 'home' | 'office';
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'gpay' | 'card';
  name: string;
  icon?: string;
  details?: string;
}

interface CartContextType {
  // Cart items
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Cart calculations
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;

  // Promo code
  promoCode: string;
  setPromoCode: (code: string) => void;
  applyPromoCode: () => void;
  discount: number;

  // Addresses
  addresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;

  // Payment
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod | null) => void;

  // Loading state
  cartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Cart state
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Payment state
  const paymentMethods: PaymentMethod[] = [
    { id: '1', type: 'cod', name: 'Cash on Delivery', icon: '💵' },
    { id: '2', type: 'bkash', name: 'bKash', icon: '💳' },
    { id: '3', type: 'nagad', name: 'Nagad', icon: '💰' },
    { id: '4', type: 'rocket', name: 'Rocket', icon: '🚀' },
    { id: '5', type: 'gpay', name: 'GPay', icon: '📱' },
    { id: '6', type: 'card', name: 'Credit/Debit Card', icon: '💳' }
  ];
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(paymentMethods[0]);

  // Cart calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 0; // Free shipping
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + shippingCost + tax - discount;

  // ─── DB helpers ───────────────────────────────────────────────

  const fetchCartFromDB = useCallback(async () => {
    setCartLoading(true);
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
      // Sync to localStorage as cache
      localStorage.setItem('minsah_cart', JSON.stringify(data.items ?? []));
    } catch {
      // Network error — fall back to localStorage
      try {
        const saved = localStorage.getItem('minsah_cart');
        if (saved) setItems(JSON.parse(saved));
      } catch { /* ignore */ }
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Merge guest localStorage cart into DB on login
  const mergeGuestCartToDB = useCallback(async (guestItems: CartItem[]) => {
    for (const item of guestItems) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
        });
      } catch { /* ignore individual failures */ }
    }
  }, []);

  // ─── Load cart on mount / user change ─────────────────────────

  useEffect(() => {
    if (user) {
      // Logged-in: check if there's a guest cart to merge first
      const guestCart = (() => {
        try {
          const saved = localStorage.getItem('minsah_cart');
          return saved ? (JSON.parse(saved) as CartItem[]) : [];
        } catch { return []; }
      })();

      const init = async () => {
        if (guestCart.length > 0) {
          await mergeGuestCartToDB(guestCart);
          localStorage.removeItem('minsah_cart');
        }
        await fetchCartFromDB();
      };
      init();
    } else {
      // Guest: load from localStorage
      try {
        const saved = localStorage.getItem('minsah_cart');
        if (saved) setItems(JSON.parse(saved));
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ─── Address DB helpers ──────────────────────────────────────

  // Convert DB address record to CartContext Address format
  // DB: firstName=fullName, phone=phoneNumber, street1=address, street2=zone, state=provinceRegion, company=landmark
  const dbToCartAddress = (db: {
    id: string;
    firstName: string;
    phone: string | null;
    street1: string;
    street2: string | null;
    state: string;
    company: string | null;
    city: string;
    isDefault: boolean;
  }): Address => ({
    id: db.id,
    fullName: db.firstName,
    phoneNumber: db.phone ?? '',
    address: db.street1,
    zone: db.street2 ?? '',
    provinceRegion: db.state,
    landmark: db.company ?? '',
    city: db.city,
    isDefault: db.isDefault,
    type: 'home',
  });

  const fetchAddressesFromDB = useCallback(async () => {
    try {
      const res = await fetch('/api/addresses', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      const parsed: Address[] = (data.addresses ?? []).map(dbToCartAddress);
      setAddresses(parsed);
      const def = parsed.find(a => a.isDefault) || parsed[0] || null;
      setSelectedAddress(def);
      localStorage.setItem('minsah_addresses', JSON.stringify(parsed));
    } catch {
      try {
        const saved = localStorage.getItem('minsah_addresses');
        if (saved) {
          const parsed: Address[] = JSON.parse(saved);
          setAddresses(parsed);
          const def = parsed.find(a => a.isDefault) || parsed[0] || null;
          setSelectedAddress(def);
        }
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load addresses when user changes
  useEffect(() => {
    if (user) {
      fetchAddressesFromDB();
    } else {
      try {
        const savedAddresses = localStorage.getItem('minsah_addresses');
        if (savedAddresses) {
          const parsed: Address[] = JSON.parse(savedAddresses);
          setAddresses(parsed);
          const def = parsed.find(a => a.isDefault) || parsed[0] || null;
          setSelectedAddress(def);
        }
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Save guest addresses to localStorage (only when not logged in)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('minsah_addresses', JSON.stringify(addresses));
    }
  }, [addresses, user]);

  // ─── Cart functions ────────────────────────────────────────────

  const addItem = useCallback(async (item: CartItem) => {
    if (user) {
      // Optimistic update
      setItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        }
        return [...prev, item];
      });

      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
        });
        // Re-fetch to get cartItemId from DB
        await fetchCartFromDB();
      } catch {
        // Keep optimistic state on network error
      }
    } else {
      // Guest: localStorage only
      setItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        }
        return [...prev, item];
      });
    }
  }, [user, fetchCartFromDB]);

  const removeItem = useCallback(async (itemId: string) => {
    if (user) {
      const target = items.find(i => i.id === itemId);
      // Optimistic update
      setItems(prev => prev.filter(i => i.id !== itemId));

      if (target?.cartItemId) {
        try {
          await fetch(`/api/cart/${target.cartItemId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        } catch {
          // Restore on failure
          await fetchCartFromDB();
        }
      }
    } else {
      setItems(prev => prev.filter(i => i.id !== itemId));
    }
  }, [user, items, fetchCartFromDB]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    if (user) {
      const target = items.find(i => i.id === itemId);
      // Optimistic update
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));

      if (target?.cartItemId) {
        try {
          await fetch(`/api/cart/${target.cartItemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ quantity }),
          });
        } catch {
          // Restore on failure
          await fetchCartFromDB();
        }
      }
    } else {
      setItems(prev => prev.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      ));
    }
  }, [user, items, removeItem, fetchCartFromDB]);

  const clearCart = useCallback(async () => {
    setItems([]);
    setPromoCode('');
    setDiscount(0);

    if (user) {
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch { /* ignore */ }
    } else {
      localStorage.setItem('minsah_cart', JSON.stringify([]));
    }
  }, [user]);

  // Save guest cart to localStorage on change (only when not logged in)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('minsah_cart', JSON.stringify(items));
    }
  }, [items, user]);

  // ─── Promo code ────────────────────────────────────────────────

  const applyPromoCode = () => {
    const validCodes: Record<string, number> = {
      'SAVE10': subtotal * 0.1,
      'SAVE20': subtotal * 0.2,
      'FIRST50': 50
    };

    if (validCodes[promoCode.toUpperCase()]) {
      setDiscount(validCodes[promoCode.toUpperCase()]);
    } else {
      alert('Invalid promo code');
    }
  };

  // ─── Address functions ─────────────────────────────────────────

  const addAddress = useCallback(async (address: Omit<Address, 'id'>) => {
    if (user) {
      try {
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            firstName: address.fullName,
            phone: address.phoneNumber,
            street1: address.address,
            street2: address.zone,
            state: address.provinceRegion,
            company: address.landmark,
            city: address.city,
            isDefault: address.isDefault,
            type: 'SHIPPING',
          }),
        });
        if (res.ok) {
          await fetchAddressesFromDB();
        }
      } catch {
        // Fallback: add locally
        const newAddress: Address = { ...address, id: Date.now().toString() };
        setAddresses(prev => [...prev, newAddress]);
        if (address.isDefault) setSelectedAddress(newAddress);
      }
    } else {
      const newAddress: Address = { ...address, id: Date.now().toString() };
      setAddresses(prev => [...prev, newAddress]);
      if (address.isDefault) setSelectedAddress(newAddress);
    }
  }, [user, fetchAddressesFromDB]);

  const updateAddress = useCallback(async (id: string, updates: Partial<Address>) => {
    if (user) {
      try {
        const patchBody: Record<string, unknown> = {};
        if (updates.fullName !== undefined) patchBody.firstName = updates.fullName;
        if (updates.phoneNumber !== undefined) patchBody.phone = updates.phoneNumber;
        if (updates.address !== undefined) patchBody.street1 = updates.address;
        if (updates.zone !== undefined) patchBody.street2 = updates.zone;
        if (updates.provinceRegion !== undefined) patchBody.state = updates.provinceRegion;
        if (updates.landmark !== undefined) patchBody.company = updates.landmark;
        if (updates.city !== undefined) patchBody.city = updates.city;
        if (updates.isDefault !== undefined) patchBody.isDefault = updates.isDefault;

        await fetch(`/api/addresses/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(patchBody),
        });
        await fetchAddressesFromDB();
      } catch {
        setAddresses(prev => prev.map(addr =>
          addr.id === id ? { ...addr, ...updates } : addr
        ));
      }
    } else {
      setAddresses(prev => prev.map(addr =>
        addr.id === id ? { ...addr, ...updates } : addr
      ));
    }
  }, [user, fetchAddressesFromDB]);

  const deleteAddress = useCallback(async (id: string) => {
    if (user) {
      // Optimistic update
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      if (selectedAddress?.id === id) {
        setSelectedAddress(addresses.find(a => a.id !== id) || null);
      }
      try {
        await fetch(`/api/addresses/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch {
        await fetchAddressesFromDB();
      }
    } else {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      if (selectedAddress?.id === id) {
        setSelectedAddress(addresses.find(a => a.id !== id) || null);
      }
    }
  }, [user, addresses, selectedAddress, fetchAddressesFromDB]);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal,
      shippingCost,
      tax,
      total,
      promoCode,
      setPromoCode,
      applyPromoCode,
      discount,
      addresses,
      selectedAddress,
      setSelectedAddress,
      addAddress,
      updateAddress,
      deleteAddress,
      paymentMethods,
      selectedPaymentMethod,
      setSelectedPaymentMethod,
      cartLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
