import type { MetadataRoute } from "next";
import { connectMongo } from "@/lib/mongodb";
import { Creation } from "@/models/Creation";

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/creations`, lastModified: new Date() },
    { url: `${base}/customize`, lastModified: new Date() },
    { url: `${base}/customize/mandir`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    { url: `${base}/visit-us`, lastModified: new Date() },
    { url: `${base}/reviews`, lastModified: new Date() },
    { url: `${base}/cart`, lastModified: new Date() },
  ];

  // Dynamic creation pages
  await connectMongo();
  const creations = await Creation.find({ enabled: true })
    .select({ slug: 1, updatedAt: 1 })
    .lean();

  const creationRoutes: MetadataRoute.Sitemap = creations.map((c: any) => ({
    url: `${base}/creations/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
  }));

  return [...staticRoutes, ...creationRoutes];
}