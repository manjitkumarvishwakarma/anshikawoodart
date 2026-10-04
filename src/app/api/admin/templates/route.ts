import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Template } from "@/models/Template";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export async function GET(req: Request) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get("category") || "mandir").trim();

  const items = await Template.find({ category })
    .sort({ isDefault: -1, enabled: -1, createdAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, items: JSON.parse(JSON.stringify(items)) });
}

export async function POST(req: Request) {
  await connectMongo();
  const body = await req.json();

  const category = String(body.category ?? "mandir").trim();
  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? slugify(name)).trim();
  const isDefault = Boolean(body.isDefault);

  const description = String(body.description ?? "").trim();

  const M24 = Number(body.M24 ?? 0);
  const M30 = Number(body.M30 ?? 0);

  if (!name) return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
  if (!slug) return NextResponse.json({ ok: false, error: "Slug required" }, { status: 400 });
  if (Number.isNaN(M24) || Number.isNaN(M30)) {
    return NextResponse.json({ ok: false, error: "Base prices must be numbers" }, { status: 400 });
  }

  // If setting default, unset others first
  if (isDefault) {
    await Template.updateMany({ category }, { $set: { isDefault: false } });
  }

  const created = await Template.create({
    category,
    name,
    slug,
    isDefault,
    description,
    enabled: true,
    sizePresets: [
      { key: "M24", label: '24"', basePrice: M24 },
      { key: "M30", label: '30"', basePrice: M30 },
    ],
  });

  return NextResponse.json({ ok: true, item: JSON.parse(JSON.stringify(created)) });
}