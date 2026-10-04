import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Template } from "@/models/Template";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectMongo();
  const { id } = await params;
  const body = await req.json();

  const tpl = await Template.findById(id);
  if (!tpl) return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });

  // allowed fields
  if (typeof body.name === "string") tpl.name = body.name.trim();
  if (typeof body.slug === "string") tpl.slug = body.slug.trim();
  if (typeof body.enabled !== "undefined") tpl.enabled = Boolean(body.enabled);

  if (typeof body.description === "string") tpl.description = body.description;

  // update base prices
  if (typeof body.M24 !== "undefined" || typeof body.M30 !== "undefined") {
    const M24 = typeof body.M24 !== "undefined" ? Number(body.M24) : null;
    const M30 = typeof body.M30 !== "undefined" ? Number(body.M30) : null;
    if (M24 !== null && Number.isNaN(M24)) return NextResponse.json({ ok: false, error: "M24 must be number" }, { status: 400 });
    if (M30 !== null && Number.isNaN(M30)) return NextResponse.json({ ok: false, error: "M30 must be number" }, { status: 400 });

    tpl.sizePresets = tpl.sizePresets.map((s: any) => {
      if (s.key === "M24" && M24 !== null) return { ...s.toObject?.() ?? s, basePrice: M24 };
      if (s.key === "M30" && M30 !== null) return { ...s.toObject?.() ?? s, basePrice: M30 };
      return s;
    });
  }

  // isDefault handling: if true, unset others in same category
  if (body.isDefault === true) {
    await Template.updateMany({ category: tpl.category, _id: { $ne: tpl._id } }, { $set: { isDefault: false } });
    tpl.isDefault = true;
  }
  if (body.isDefault === false) {
    tpl.isDefault = false; // allow unsetting (optional)
  }

  await tpl.save();

  const updated = await Template.findById(id).lean();
  return NextResponse.json({ ok: true, item: JSON.parse(JSON.stringify(updated)) });
}