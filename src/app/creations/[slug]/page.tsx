import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectMongo } from "@/lib/mongodb";
import { Creation } from "@/models/Creation";

export const dynamic = "force-dynamic";

function formatINR(n: number) {
    return `₹ ${Number(n || 0).toLocaleString("en-IN")}`;
}

function siteUrl() {
    // server-side: NEXT_PUBLIC_SITE_URL is available if set
    return process.env.NEXT_PUBLIC_SITE_URL || "";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    await connectMongo();

    const item = await Creation.findOne({ slug, enabled: true }).lean();
    if (!item) return { title: "Not Found" };

    const it: any = JSON.parse(JSON.stringify(item));
    const cover = it.images?.[0];

    const title = `${it.title} | Anshika Wood Art Pune`;
    const description =
        (it.shortDescription && it.shortDescription.trim()) ||
        (it.longDescription && it.longDescription.trim().slice(0, 160)) ||
        "Handcrafted wooden furniture and wood art in Pune.";

    return {
        title,
        description,

        alternates: {
            canonical: `/creations/${slug}`,
        },

        openGraph: {
            title,
            description,
            url: `/creations/${slug}`,
            images: cover?.url ? [{ url: cover.url }] : [],
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: cover?.url ? [cover.url] : [],
        },
    };
}

export default async function CreationDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    await connectMongo();

    const item = await Creation.findOne({ slug, enabled: true }).lean();
    if (!item) notFound();

    const it: any = JSON.parse(JSON.stringify(item));
    const images: any[] = it.images ?? [];
    const cover = images[0];

    // Pricing logic:
    // - fixedPrice: ready-made exact price
    // - startingPrice: made-to-order "starting from"
    const fixedPrice = Number(it.fixedPrice ?? 0);
    const startingPrice = Number(it.startingPrice ?? 0);

    const showFixed = fixedPrice > 0;
    const showStarting = !showFixed && startingPrice > 0;

    const productUrl = siteUrl()
        ? `${siteUrl()}/creations/${it.slug}`
        : "";

    const whatsappTextLines = [
        `Hi, I am interested in this item: ${it.title}`,
        `Category: ${it.category}`,
        showFixed ? `Price: ${formatINR(fixedPrice)}` : "",
        showStarting ? `Starting from: ${formatINR(startingPrice)}` : "",
        productUrl ? `Link: ${productUrl}` : "",
    ].filter(Boolean);

    const whatsappLink = `https://wa.me/918087412575?text=${encodeURIComponent(
        whatsappTextLines.join("\n")
    )}`;

    // Optional: customize link (mandir customizer only for now)
    const customizeLink =
        it.customizable && it.templateSlug
            ? `/customize/mandir?template=${encodeURIComponent(it.templateSlug)}`
            : it.customizable
                ? "/customize/mandir"
                : null;

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="text-sm">
                <Link href="/creations" className="underline">
                    ← Back to Creations
                </Link>
            </div>

            {/* Top section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Images */}
                <div className="space-y-3">
                    <div className="relative aspect-[4/3] rounded border overflow-hidden bg-gray-50">
                        {cover?.url ? (
                            <Image
                                src={cover.url}
                                alt={cover.alt || it.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="h-full grid place-items-center text-gray-500">
                                No image
                            </div>
                        )}
                    </div>

                    {images.length > 1 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {images.slice(1).map((img, idx) => (
                                <a
                                    key={(img.publicId ?? "img") + idx}
                                    href={img.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="relative aspect-[4/3] rounded border overflow-hidden bg-gray-50 hover:opacity-95"
                                    title="Open full image"
                                >
                                    <Image
                                        src={img.url}
                                        alt={img.alt || it.title}
                                        fill
                                        className="object-cover"
                                    />
                                </a>
                            ))}
                        </div>
                    ) : null}
                </div>

                {/* Details */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-semibold">{it.title}</h1>
                        <div className="text-sm text-gray-600 mt-1">
                            Category: <span className="font-medium">{it.category}</span>
                            {it.featured ? (
                                <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-semibold">
                                    FEATURED
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Price block */}
                    <div className="rounded border p-4 space-y-1 bg-white">
                        {showFixed ? (
                            <>
                                <div className="text-sm text-gray-600">Ready-made price</div>
                                <div className="text-2xl font-semibold">{formatINR(fixedPrice)}</div>
                                <div className="text-xs text-gray-500">
                                    Final delivery/installation (if applicable) discussed on WhatsApp.
                                </div>
                            </>
                        ) : showStarting ? (
                            <>
                                <div className="text-sm text-gray-600">Starting from</div>
                                <div className="text-2xl font-semibold">{formatINR(startingPrice)}</div>
                                <div className="text-xs text-gray-500">
                                    Starting price for standard configuration. Final quote depends on size/wood/carving.
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-sm text-gray-600">Price</div>
                                <div className="text-2xl font-semibold">On request</div>
                                <div className="text-xs text-gray-500">
                                    WhatsApp us for price and customization.
                                </div>
                            </>
                        )}
                    </div>

                    {/* Descriptions */}
                    {it.shortDescription ? (
                        <p className="text-gray-800">{it.shortDescription}</p>
                    ) : null}

                    {it.longDescription ? (
                        <div className="rounded bg-gray-50 p-4 whitespace-pre-wrap text-gray-800">
                            {it.longDescription}
                        </div>
                    ) : null}

                    {/* Tags */}
                    {Array.isArray(it.tags) && it.tags.length ? (
                        <div className="flex flex-wrap gap-2">
                            {it.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="rounded-full border px-3 py-1 text-sm bg-white"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    ) : null}

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        <a
                            className="inline-block rounded bg-emerald-700 text-white px-4 py-2"
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                        >
                            WhatsApp to Order / Ask Price
                        </a>

                        {customizeLink ? (
                            <Link
                                className="inline-block rounded border px-4 py-2 hover:bg-gray-50"
                                href={customizeLink}
                            >
                                Customize Similar
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Related section (optional simple version) */}
            <RelatedCreations category={it.category} currentSlug={it.slug} />
        </div>
    );
}

async function RelatedCreations({
    category,
    currentSlug,
}: {
    category: string;
    currentSlug: string;
}) {
    await connectMongo();

    const relatedRaw = await Creation.find({
        enabled: true,
        category,
        slug: { $ne: currentSlug },
    })
        .sort({ featured: -1, createdAt: -1 })
        .limit(6)
        .lean();

    const related: any[] = JSON.parse(JSON.stringify(relatedRaw));

    if (!related.length) return null;

    return (
        <div className="space-y-3">
            <h2 className="text-xl font-semibold">More in {category}</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((it) => {
                    const cover = it.images?.[0];
                    return (
                        <Link
                            key={it._id}
                            href={`/creations/${it.slug}`}
                            className="rounded border overflow-hidden hover:shadow-sm"
                        >
                            <div className="aspect-[4/3] bg-gray-50 relative">
                                {cover?.url ? (
                                    <Image
                                        src={cover.url}
                                        alt={cover.alt || it.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : null}
                            </div>
                            <div className="p-3">
                                <div className="font-semibold">{it.title}</div>
                                <div className="text-sm text-gray-600 line-clamp-2">
                                    {it.shortDescription}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}