"use client";

import Link from "next/link";
import { useCart } from "@/lib/cartStore";

export default function SiteNavbar() {
  const count = useCart((s) => s.items.reduce((sum, x) => sum + x.qty, 0));

  const whatsappLink =
    "https://wa.me/918087412575?text=" +
    encodeURIComponent("Hi Anshika Wood Art, I want to enquire about furniture / customization.");

  return (
    <header className="border-b bg-[#fffaf3]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-4">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          Anshika Wood Art
          <span className="block text-xs font-normal text-gray-600">
            Crafting Dreams in Wood
          </span>
        </Link>

        <nav className="flex flex-wrap gap-3 text-sm text-gray-800">
          <Link className="hover:underline" href="/">Home</Link>
          <Link className="hover:underline" href="/creations">Creations</Link>
          <Link className="hover:underline" href="/customize">Customize</Link>
          <Link className="hover:underline" href="/visit-us">Visit Us</Link>
          <Link className="hover:underline" href="/reviews">Reviews</Link>
          <Link className="hover:underline" href="/contact">Contact</Link>

          <Link className="hover:underline inline-flex items-center gap-2" href="/cart">
            Cart
            {count > 0 ? (
              <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-black text-white text-[12px] leading-none">
                {count}
              </span>
            ) : null}
          </Link>
        </nav>

        <a
          className="ml-auto rounded bg-emerald-700 text-white px-3 py-2 text-sm"
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}