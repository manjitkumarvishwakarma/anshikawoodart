import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Template } from "@/models/Template";

export async function PATCH(req: Request) {
  await connectMongo();
  const body = await req.json();

  const { M24, M30 } = body;

  if (typeof M24 !== "number" || typeof M30 !== "number") {
    return NextResponse.json({ ok: false, error: "M24 and M30 must be numbers" }, { status: 400 });
  }

  const tpl = await Template.findOne({ category: "mandir" });
  if (!tpl) return NextResponse.json({ ok: false, error: "Mandir template not found" }, { status: 404 });

  // update in place
  tpl.sizePresets = tpl.sizePresets.map((s: any) => {
    if (s.key === "M24") return { ...s.toObject?.() ?? s, basePrice: M24 };
    if (s.key === "M30") return { ...s.toObject?.() ?? s, basePrice: M30 };
    return s;
  });

  await tpl.save();

  const updated = await Template.findOne({ category: "mandir" }).lean();
  return NextResponse.json({ ok: true, template: updated });
}