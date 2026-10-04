import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { cloudinary } from "@/lib/cloudinary";
import { Design } from "@/models/Design";
import { Template } from "@/models/Template";
import { Material } from "@/models/Material";
import { Part } from "@/models/Part";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

type SizeKey = "M24" | "M30";

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        const rl = rateLimit(`design:${ip}`, 10, 10 * 60 * 1000); // 10 saves / 10 minutes
        if (!rl.ok) {
            return NextResponse.json(
                { ok: false, error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }
        const body = await req.json();
        if (typeof body.hp === "string" && body.hp.trim().length > 0) {
            return NextResponse.json({ ok: true, designId: "honeypot", previewImageUrl: "", verifiedEstimate: 0 });
        }
        const customSize = body.customSize ?? { enabled: false };

        const templateCategory = body.templateCategory ?? "mandir";
        const sizeKey: SizeKey = body.sizeKey;
        const materialId: string = body.materialId;
        const items = body.items ?? [];
        const dataUrl: string = body.dataUrl;

        if (!dataUrl?.startsWith("data:image/")) {
            return NextResponse.json({ ok: false, error: "Invalid preview image" }, { status: 400 });
        }
        if (!["M24", "M30"].includes(sizeKey)) {
            return NextResponse.json({ ok: false, error: "Invalid sizeKey" }, { status: 400 });
        }
        if (!materialId) {
            return NextResponse.json({ ok: false, error: "Missing materialId" }, { status: 400 });
        }

        await connectMongo();

        const templateSlug = body.templateSlug;

        const tpl = templateSlug
            ? await Template.findOne({ slug: templateSlug, enabled: true }).lean()
            : await Template.findOne({ category: templateCategory, enabled: true, isDefault: true }).lean();
        if (!tpl) return NextResponse.json({ ok: false, error: "Template not found" }, { status: 404 });

        const basePrice =
            tpl.sizePresets?.find((s: any) => s.key === sizeKey)?.basePrice ?? 0;

        const material = await Material.findById(materialId).lean();
        if (!material) return NextResponse.json({ ok: false, error: "Material not found" }, { status: 404 });

        const partKeys: string[] = items.map((it: any) => it.partKey).filter(Boolean);
        const parts = await Part.find({ key: { $in: partKeys }, category: templateCategory }).lean();

        const partPriceMap = new Map(parts.map((p: any) => [p.key, p.pricesBySize?.[sizeKey] ?? 0]));
        const partsTotal = partKeys.reduce((sum, k) => sum + (partPriceMap.get(k) ?? 0), 0);

        const verifiedEstimate = Math.round((basePrice + partsTotal) * (material.multiplier ?? 1));

        // 2) Upload preview to Cloudinary
        const upload = await cloudinary.uploader.upload(dataUrl, {
            folder: "anshika-wood-art/design-previews",
            resource_type: "image",
        });

        const previewImageUrl = upload.secure_url;

        // 3) Save design
        const design = await Design.create({
            templateCategory,
            templateSlug: templateSlug ?? (tpl as any).slug ?? "",
            sizeKey,
            materialId,
            items,
            previewImageUrl,
            verifiedEstimate,
            customSize,
        });

        return NextResponse.json({
            ok: true,
            designId: String(design._id),
            previewImageUrl,
            verifiedEstimate,
        });
    } catch (e: any) {
        console.error("POST /api/designs error:", e);
        return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
    }
}