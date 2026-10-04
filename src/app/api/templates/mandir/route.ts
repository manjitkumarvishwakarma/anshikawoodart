import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Template } from "@/models/Template";

export async function GET() {
  await connectMongo();

  const template = await Template.findOne({ category: "mandir", enabled: true, isDefault: true })
    .populate("defaultMaterialId", "name multiplier previewColor")
    .lean();

  if (!template) {
    return NextResponse.json({ ok: false, error: "Mandir template not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, template });
}