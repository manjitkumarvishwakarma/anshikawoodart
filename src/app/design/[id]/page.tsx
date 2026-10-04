import Link from "next/link";
import { connectMongo } from "@/lib/mongodb";
import { Design } from "@/models/Design";
import { Material } from "@/models/Material";

export const dynamic = "force-dynamic";

export default async function DesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectMongo();

  const design = await Design.findById(id).lean();
  if (!design) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Design not found</h1>
        <Link className="underline" href="/">Go Home</Link>
      </div>
    );
  }

  const material = await Material.findById(design.materialId).lean();

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-semibold">Saved Design</h1>

      <div className="rounded border overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={design.previewImageUrl} alt="Saved mandir design preview" className="w-full" />
      </div>

      <div className="rounded bg-gray-50 p-4 space-y-1">
        <div><b>Template:</b> {design.templateCategory}</div>
        <div><b>Size:</b> {design.sizeKey}</div>
        <div><b>Wood:</b> {material?.name ?? "—"}</div>
        <div><b>Verified Estimate:</b> ₹ {Number(design.verifiedEstimate).toLocaleString("en-IN")}</div>
      </div>
    </div>
  );
}