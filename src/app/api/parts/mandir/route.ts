import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Part } from "@/models/Part";

export async function GET() {
  await connectMongo();

  const parts = await Part.find({ category: "mandir", enabled: true })
    .sort({ group: 1, layerOrder: 1, name: 1 })
    .select({ key: 1, name: 1, group: 1, layerOrder: 1, imageBySize: 1, pricesBySize: 1, anchors: 1 })
    .lean();

  return NextResponse.json({ ok: true, parts });
}