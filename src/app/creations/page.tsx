import Image from "next/image";
import Link from "next/link";
import { connectMongo } from "@/lib/mongodb";
import { Creation } from "@/models/Creation";
import CreationsFilters from "./ui/CreationsFilters";
import AddToCartButton from "./ui/AddToCartButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
    title: "Our Creations",
    description: "Browse handcrafted wooden furniture and wood art from Anshika Wood Art, Pune.",
    alternates: { canonical: "/creations" },
    openGraph: {
        title: "Our Creations",
        description: "Browse handcrafted wooden furniture and wood art from Anshika Wood Art, Pune.",
        url: "/creations",
    },
};


function formatINR(n: number) {
    return `₹ ${Number(n || 0).toLocaleString("en-IN")}`;
}

function priceLabel(it: any) {
    const fixed = Number(it.fixedPrice ?? 0);
    const start = Number(it.startingPrice ?? 0);

    if (fixed > 0) return formatINR(fixed);
    if (start > 0) return `From ${formatINR(start)}`;
    return "Price on request";
}

export default async function CreationsPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; sort?: string; q?: string; page?: string }>;
}) {
    const sp = await searchParams;
    const category = (sp.category ?? "all").trim();
    const sort = (sp.sort ?? "featured").trim();
    const q = (sp.q ?? "").trim();
    const page = Math.max(1, Number(sp.page ?? 1) || 1);

    await connectMongo();

    const match: any = { enabled: true };
    if (category !== "all") match.category = category;

    if (q) {
        const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        match.$or = [{ title: rx }, { shortDescription: rx }, { tags: rx }];
    }

    // Count for pagination
    const total = await Creation.countDocuments(match);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // Aggregation for price sorting support
    const pipeline: any[] = [
        { $match: match },
        {
            $addFields: {
                effectivePrice: {
                    $cond: [{ $gt: ["$fixedPrice", 0] }, "$fixedPrice", "$startingPrice"],
                },
            },
        },
    ];

    // Sort
    if (sort === "newest") pipeline.push({ $sort: { createdAt: -1 } });
    else if (sort === "az") pipeline.push({ $sort: { title: 1 } });
    else if (sort === "manual") pipeline.push({ $sort: { sortOrder: 1, createdAt: -1 } });
    else if (sort === "price_asc") {
        pipeline.push({
            $addFields: {
                priceSort: {
                    $cond: [{ $gt: ["$effectivePrice", 0] }, "$effectivePrice", 999999999],
                },
            },
        });
        pipeline.push({ $sort: { priceSort: 1, createdAt: -1 } });
    } else if (sort === "price_desc") {
        pipeline.push({
            $addFields: {
                priceSort: {
                    $cond: [{ $gt: ["$effectivePrice", 0] }, "$effectivePrice", -1],
                },
            },
        });
        pipeline.push({ $sort: { priceSort: -1, createdAt: -1 } });
    } else {
        // featured default
        pipeline.push({ $sort: { featured: -1, sortOrder: 1, createdAt: -1 } });
    }

    pipeline.push({ $skip: (page - 1) * PAGE_SIZE });
    pipeline.push({ $limit: PAGE_SIZE });

    const itemsRaw = await Creation.aggregate(pipeline);
    const items = JSON.parse(JSON.stringify(itemsRaw));

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h1 className="text-2xl font-semibold">Our Creations</h1>
                <Link className="rounded border px-3 py-2 text-sm hover:bg-gray-50" href="/cart">
                    View Cart
                </Link>
            </div>

            <CreationsFilters />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((it: any) => {
                    const cover = it.images?.[0];
                    const label = priceLabel(it);

                    return (
                        <div key={it._id} className="rounded border overflow-hidden hover:shadow-sm bg-white">
                            <Link href={`/creations/${it.slug}`}>
                                <div className="aspect-[4/3] bg-gray-50 relative">
                                    {cover ? (
                                        <Image src={cover.url} alt={cover.alt || it.title} fill className="object-cover" />
                                    ) : null}
                                </div>
                            </Link>

                            <div className="p-3 space-y-2">
                                <Link href={`/creations/${it.slug}`} className="block">
                                    <div className="font-semibold">{it.title}</div>
                                    <div className="text-sm text-gray-600">{it.category}</div>
                                    {it.shortDescription ? (
                                        <div className="text-sm text-gray-700 line-clamp-2">{it.shortDescription}</div>
                                    ) : null}
                                </Link>

                                <div className="text-sm font-semibold">{label}</div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Link className="rounded bg-black text-white px-3 py-2 text-sm" href={`/creations/${it.slug}`}>
                                        View
                                    </Link>

                                    <AddToCartButton
                                        item={{
                                            id: String(it._id),
                                            title: it.title,
                                            slug: it.slug,
                                            imageUrl: cover?.url,
                                            priceLabel: label,
                                        }}
                                    />

                                    <a
                                        className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                                        href={`https://wa.me/918087412575?text=${encodeURIComponent(
                                            `Hi, I am interested in: ${it.title}\nPrice: ${label}\nLink: /creations/${it.slug}`
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-gray-600">
                    Page {page} of {totalPages} • {total} items
                </div>

                <div className="flex gap-2">
                    {page > 1 ? (
                        <Link
                            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                            href={`/creations?${new URLSearchParams({ ...sp, page: String(page - 1) }).toString()}`}
                        >
                            Prev
                        </Link>
                    ) : null}
                    {page < totalPages ? (
                        <Link
                            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                            href={`/creations?${new URLSearchParams({ ...sp, page: String(page + 1) }).toString()}`}
                        >
                            Next
                        </Link>
                    ) : null}
                </div>
            </div>
        </div>
    );
}