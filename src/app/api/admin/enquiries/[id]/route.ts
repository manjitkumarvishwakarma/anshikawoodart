import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Enquiry } from "@/models/Enquiry";

const allowedStatuses = [
  "new",
  "contacted",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { ok: false, error: "Invalid enquiry status" },
        { status: 400 }
      );
    }

    await connectMongo();

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { $set: { status: body.status } },
      { returnDocument: "after" }
    ).lean();

    if (!enquiry) {
      return NextResponse.json(
        { ok: false, error: "Enquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      enquiry: JSON.parse(JSON.stringify(enquiry)),
    });
  } catch (error) {
    console.error("PATCH enquiry error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to update enquiry",
      },
      { status: 500 }
    );
  }
}