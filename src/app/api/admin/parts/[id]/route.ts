import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Part } from "@/models/Part";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // IMPORTANT
) {
  try {
    const { id } = await params; // IMPORTANT

    await connectMongo();
    const body = await req.json();

    const set: Record<string, any> = {};

    if (typeof body.enabled !== "undefined") set.enabled = Boolean(body.enabled);

    if (typeof body.M24 !== "undefined") {
      const n = Number(body.M24);
      if (Number.isNaN(n)) {
        return NextResponse.json({ ok: false, error: "M24 must be a number" }, { status: 400 });
      }
      set["pricesBySize.M24"] = n;
    }

    if (typeof body.M30 !== "undefined") {
      const n = Number(body.M30);
      if (Number.isNaN(n)) {
        return NextResponse.json({ ok: false, error: "M30 must be a number" }, { status: 400 });
      }
      set["pricesBySize.M30"] = n;
    }

    const updated = await Part.findByIdAndUpdate(
      id,
      { $set: set },
      { returnDocument: "after" } // avoids mongoose 'new' warning
    ).lean();

    if (!updated) {
      return NextResponse.json({ ok: false, error: "Part not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, part: updated });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}