"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;       // creation _id
  title: string;
  slug: string;
  imageUrl?: string;
  priceLabel: string; // "₹ 25000" or "From ₹ 18000" or "Price on request"
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (id: string) => void;
  clear: () => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const curr = get().items;
        const existing = curr.find((x) => x.id === item.id);
        if (existing) {
          set({ items: curr.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x)) });
        } else {
          set({ items: [...curr, { ...item, qty: 1 }] });
        }
      },
      remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
      clear: () => set({ items: [] }),
      inc: (id) => set({ items: get().items.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x)) }),
      dec: (id) =>
        set({
          items: get().items
            .map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)),
        }),
    }),
    { name: "anshika_cart_v1" }
  )
);