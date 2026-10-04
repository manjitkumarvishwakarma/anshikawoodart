import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Enquiry } from "@/models/Enquiry";
import { Design } from "@/models/Design";
import { Material } from "@/models/Material";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

function normalizeIndiaPhoneToE164(input: string) {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  let v = raw.replace(/[^\d+]/g, "");
  if (v.includes("+")) v = (v.startsWith("+") ? "+" : "") + v.replace(/\+/g, "");

  if (v.startsWith("+")) {
    const digits = v.slice(1).replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return null;
  }

  const digits = v.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  return null;
}

export async function POST(req: Request) {
  try {
    // Rate limit: 10 enquiries / 10 minutes per IP
    const ip = getClientIp(req);
    const rl = rateLimit(`enq:${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { designId, name, phone, city, notes, hp } = body;

    // Honeypot: if bots fill it, pretend success but do nothing
    if (typeof hp === "string" && hp.trim().length > 0) {
      return NextResponse.json({ ok: true, enquiryId: "honeypot" });
    }

    if (!designId) return NextResponse.json({ ok: false, error: "Missing designId" }, { status: 400 });
    if (!name || !String(name).trim()) return NextResponse.json({ ok: false, error: "Missing name" }, { status: 400 });
    if (!phone || !String(phone).trim()) return NextResponse.json({ ok: false, error: "Missing phone" }, { status: 400 });

    const normalizedPhone = normalizeIndiaPhoneToE164(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { ok: false, error: "Invalid phone. Use 10 digits or +91 followed by 10 digits." },
        { status: 400 }
      );
    }

    await connectMongo();

    const design = await Design.findById(designId).lean();
    if (!design) return NextResponse.json({ ok: false, error: "Design not found" }, { status: 404 });

    const material = await Material.findById(design.materialId).lean();

    const enquiry = await Enquiry.create({
      designId: design._id,
      name: String(name).trim(),
      phone: normalizedPhone,
      city: (city ?? "").toString().trim(),
      notes: (notes ?? "").toString().trim(),
      template: "Mandir",
      sizeKey: design.sizeKey,
      materialName: material?.name ?? "",
      estimatedPrice: design.verifiedEstimate,
      previewImageUrl: design.previewImageUrl,
      status: "new",
      customSize: design.customSize ?? { enabled: false },
    });

    return NextResponse.json({ ok: true, enquiryId: String(enquiry._id) });
  } catch (e: any) {
    console.error("POST /api/enquiries error:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}