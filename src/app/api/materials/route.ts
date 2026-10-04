import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Material } from "@/models/Material";

export async function POST(req: Request) {
  await connectMongo();
  const body = await req.json();

  const name = String(body.name ?? "").trim();
  const multiplier = Number(body.multiplier ?? 1);
  const previewColor = String(body.previewColor ?? "").trim();

  if (!name) return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
  if (Number.isNaN(multiplier)) return NextResponse.json({ ok: false, error: "Multiplier must be number" }, { status: 400 });

  const created = await Material.create({
    name,
    multiplier,
    previewColor,
    enabled: true,
  });

  return NextResponse.json({ ok: true, material: JSON.parse(JSON.stringify(created)) });
}