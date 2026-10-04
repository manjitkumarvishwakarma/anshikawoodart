import Link from "next/link";
import Image from "next/image";
import { connectMongo } from "@/lib/mongodb";
import { Creation } from "@/models/Creation";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectMongo();

  const featuredRaw = await Creation.find({ enabled: true, featured: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(6)
    .lean();

  const featured = JSON.parse(JSON.stringify(featuredRaw));

  return (
    <>
      <LocalBusinessJsonLd />
      <div className="space-y-10">
        {/* Hero */}
        <section className="px-6 pt-10">
          <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
                Anshika Wood Art
                <span className="block text-gray-600 text-2xl md:text-3xl mt-2">
                  Crafting Dreams in Wood
                </span>
              </h1>

              <p className="text-gray-700 text-base md:text-lg">
                Discover beautifully crafted wooden furniture that blends tradition and modern design.
                Explore our ready-made collections or create your unique furniture piece with our custom design service.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/creations" className="rounded bg-black text-white px-4 py-2">
                  Explore Ready‑Made
                </Link>
                <Link href="/customize/mandir" className="rounded border px-4 py-2 hover:bg-gray-50">
                  Customize Your Furniture
                </Link>
                <a
                  href="https://wa.me/918087412575"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border px-4 py-2 hover:bg-gray-50"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Hero image placeholder */}
            <div className="rounded border bg-gray-50 aspect-[4/3] relative overflow-hidden">
              {/* Put a real hero image later */}
              <div className="absolute inset-0 grid place-items-center text-gray-500">
                Add a hero image here
              </div>
            </div>
          </div>
        </section>

        {/* Featured Creations */}
        <section className="px-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold">Featured Creations</h2>
              <Link href="/creations" className="text-sm underline">
                View all →
              </Link>
            </div>

            {featured.length === 0 ? (
              <div className="rounded border p-6 text-gray-600">
                No featured items yet. Mark items as Featured in Admin → Creations.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((it: any) => {
                  const cover = it.images?.[0];
                  return (
                    <Link key={it._id} href={`/creations/${it.slug}`} className="rounded border overflow-hidden hover:shadow-sm">
                      <div className="aspect-[4/3] bg-gray-50 relative">
                        {cover?.url ? (
                          <Image src={cover.url} alt={cover.alt || it.title} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="p-3">
                        <div className="font-semibold">{it.title}</div>
                        <div className="text-sm text-gray-600">{it.category}</div>
                        <div className="text-sm text-gray-700 line-clamp-2 mt-1">
                          {it.shortDescription}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose */}
        <section className="px-6 pb-10">
          <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-3">
            {[
              { title: "Handcrafted Quality", desc: "Made with passion, precision, and durable woodwork." },
              { title: "Custom Designs", desc: "Templates + customization to match your space and style." },
              { title: "WhatsApp Support", desc: "Quick response for pricing, orders, and design help." },
            ].map((x) => (
              <div key={x.title} className="rounded border p-4">
                <div className="font-semibold">{x.title}</div>
                <div className="text-sm text-gray-700 mt-1">{x.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}