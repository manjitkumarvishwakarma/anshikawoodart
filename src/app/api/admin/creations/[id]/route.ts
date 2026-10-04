import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Creation } from "@/models/Creation";

function normalizeTags(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String).map((s) => s.trim()).filter(Boolean);
  return String(input)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectMongo();
  const { id } = await params;
  const body = await req.json();

  const set: any = {};

  if (typeof body.title === "string") set.title = body.title.trim();
  if (typeof body.slug === "string") set.slug = body.slug.trim();
  if (typeof body.category === "string") set.category = body.category;

  if (typeof body.shortDescription === "string") set.shortDescription = body.shortDescription;
  if (typeof body.longDescription === "string") set.longDescription = body.longDescription;

  if (typeof body.tags !== "undefined") set.tags = normalizeTags(body.tags);

  if (typeof body.fixedPrice !== "undefined") set.fixedPrice = Number(body.fixedPrice) || 0;
  if (typeof body.startingPrice !== "undefined") set.startingPrice = Number(body.startingPrice) || 0;

  if (typeof body.featured !== "undefined") set.featured = !!body.featured;
  if (typeof body.enabled !== "undefined") set.enabled = !!body.enabled;

  if (typeof body.customizable !== "undefined") set.customizable = !!body.customizable;
  if (typeof body.templateSlug !== "undefined") set.templateSlug = String(body.templateSlug ?? "");

  if (typeof body.images !== "undefined") set.images = body.images;
  if (typeof body.sortOrder !== "undefined") set.sortOrder = Number(body.sortOrder) || 0;

  const updated = await Creation.findByIdAndUpdate(id, { $set: set }, { returnDocument: "after" }).lean();
  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, item: JSON.parse(JSON.stringify(updated)) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectMongo();
  const { id } = await params;
  await Creation.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}