import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const base64 = bytes.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const upload = await cloudinary.uploader.upload(dataUrl, {
      folder: "anshika-wood-art/creations",
      resource_type: "image",
    });

    return NextResponse.json({
      ok: true,
      image: {
        url: upload.secure_url,
        publicId: upload.public_id,
        width: upload.width,
        height: upload.height,
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}