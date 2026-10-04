import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Material } from "@/models/Material";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  await connectMongo();

  const { multiplier, enabled, previewColor } = body;

  const updated = await Material.findByIdAndUpdate(
    id,
    { $set: { multiplier, enabled, previewColor } },
    { new: true }
  ).lean();

  return NextResponse.json({ ok: true, material: updated });
}