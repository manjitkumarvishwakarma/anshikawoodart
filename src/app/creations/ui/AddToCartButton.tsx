"use client";

import { useCart } from "@/lib/cartStore";

export default function AddToCartButton({
  item,
}: {
  item: { id: string; title: string; slug: string; imageUrl?: string; priceLabel: string };
}) {
  const add = useCart((s) => s.add);

  return (
    <button
      type="button"
      className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
      onClick={() => add({ ...item })}
    >
      Add to Cart
    </button>
  );
}