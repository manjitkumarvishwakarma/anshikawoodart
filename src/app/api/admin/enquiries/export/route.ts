import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { Enquiry } from "@/models/Enquiry";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function csvEscape(value: any) {
  const s = String(value ?? "");
  // wrap in quotes, escape quotes by doubling
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  await connectMongo();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "all";
  const q = (searchParams.get("q") || "").trim();

  const filter: any = {};
  if (status !== "all") filter.status = status;

  if (q) {
    const safe = escapeRegExp(q);
    const rx = new RegExp(safe, "i");
    filter.$or = [{ name: rx }, { phone: rx }, { city: rx }];
  }

  const rows = await Enquiry.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  const header = [
    "createdAt",
    "name",
    "phone",
    "city",
    "template",
    "sizeKey",
    "materialName",
    "estimatedPrice",
    "status",
    "notes",
    "designId",
    "previewImageUrl",
  ];

  const lines = [
    header.join(","),
    ...rows.map((e: any) =>
      [
        csvEscape(e.createdAt),
        csvEscape(e.name),
        csvEscape(e.phone),
        csvEscape(e.city),
        csvEscape(e.template),
        csvEscape(e.sizeKey),
        csvEscape(e.materialName),
        csvEscape(e.estimatedPrice),
        csvEscape(e.status),
        csvEscape(e.notes),
        csvEscape(e.designId),
        csvEscape(e.previewImageUrl),
      ].join(",")
    ),
  ];

  const csv = lines.join("\n");
  const fileName = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${fileName}"`,
      "cache-control": "no-store",
    },
  });
}