import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectMongo();
    return NextResponse.json({ ok: true, time: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Mongo connection failed" },
      { status: 500 }
    );
  }
}