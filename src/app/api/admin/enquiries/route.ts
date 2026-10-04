import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Enquiry } from "@/models/Enquiry";

export async function GET() {
  try {
    await connectMongo();

    const enquiries = await Enquiry.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      ok: true,
      enquiries: JSON.parse(JSON.stringify(enquiries)),
    });
  } catch (error) {
    console.error("GET enquiries error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load enquiries",
      },
      { status: 500 }
    );
  }
}