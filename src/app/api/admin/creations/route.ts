import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Creation } from "@/models/Creation";

function normalizeTags(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String).map((s) => s.trim()).filter(Boolean);
  // allow comma-separated string
  return String(input)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET() {
  await connectMongo();
  const items = await Creation.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, items: JSON.parse(JSON.stringify(items)) });
}

export async function POST(req: Request) {
  await connectMongo();
  const body = await req.json();

  const created = await Creation.create({
    title: String(body.title ?? "").trim(),
    slug: String(body.slug ?? "").trim(),
    category: body.category,
    shortDescription: String(body.shortDescription ?? ""),
    longDescription: String(body.longDescription ?? ""),

    tags: normalizeTags(body.tags),

    fixedPrice: Number(body.fixedPrice ?? 0) || 0,
    startingPrice: Number(body.startingPrice ?? 0) || 0,

    featured: !!body.featured,
    enabled: body.enabled !== false,

    customizable: !!body.customizable,
    templateSlug: String(body.templateSlug ?? ""),

    images: body.images ?? [],
    sortOrder: Number(body.sortOrder ?? 0) || 0,
  });

  return NextResponse.json({ ok: true, item: JSON.parse(JSON.stringify(created)) });
}