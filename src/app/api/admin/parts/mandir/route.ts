import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Part } from "@/models/Part";

export async function GET() {
  await connectMongo();

  const parts = await Part.find({ category: "mandir" })
    .sort({ group: 1, layerOrder: 1, name: 1 })
    .lean();

  return NextResponse.json({ ok: true, parts });
}