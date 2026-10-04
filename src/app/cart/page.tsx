"use client";

import Link from "next/link";
import { useCart } from "@/lib/cartStore";

function waLink(msg: string) {
  return `https://wa.me/918087412575?text=${encodeURIComponent(msg)}`;
}

export default function CartPage() {
  const { items, inc, dec, remove, clear } = useCart();

  const message =
    `Hi, I want to place an order / get a quote for these items:\n\n` +
    items
      .map((x) => `• ${x.title} (Qty: ${x.qty})\n  ${x.priceLabel}\n  Link: /creations/${x.slug}`)
      .join("\n\n") +
    `\n\nThanks,\nAnshika Wood Art Pune`;

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Cart</h1>

      {items.length === 0 ? (
        <div className="rounded border p-6 text-gray-600">
          Cart is empty. <Link className="underline" href="/creations">Browse creations</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((x) => (
              <div key={x.id} className="rounded border p-3">
                <div className="font-semibold">{x.title}</div>
                <div className="text-sm text-gray-600">{x.priceLabel}</div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button className="rounded border px-3 py-1" onClick={() => dec(x.id)}>-</button>
                  <div className="px-2 py-1">Qty: {x.qty}</div>
                  <button className="rounded border px-3 py-1" onClick={() => inc(x.id)}>+</button>

                  <button className="rounded border px-3 py-1 ml-auto" onClick={() => remove(x.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <a className="rounded bg-emerald-700 text-white px-4 py-2" href={waLink(message)} target="_blank" rel="noreferrer">
              Send Cart on WhatsApp
            </a>
            <button className="rounded border px-4 py-2" onClick={clear}>Clear Cart</button>
          </div>

          <div className="text-xs text-gray-500">
            Note: Links in WhatsApp use relative URLs right now. After deployment we’ll make them full domain links.
          </div>
        </>
      )}
    </div>
  );
}