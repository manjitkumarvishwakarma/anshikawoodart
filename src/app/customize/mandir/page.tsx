import Link from "next/link";
import { connectMongo } from "@/lib/mongodb";
import { Material } from "@/models/Material";
import { Template } from "@/models/Template";
import { Part } from "@/models/Part";
import MandirCustomizer from "./ui/MandirCustomizer";

export const dynamic = "force-dynamic";

export default async function MandirCustomizePage() {
  await connectMongo();

  const materialsRaw = await Material.find({ enabled: true })
    .sort({ name: 1 })
    .select({ name: 1, multiplier: 1, previewColor: 1 })
    .lean();

  const templatesRaw = await Template.find({ category: "mandir", enabled: true })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();

  const partsRaw = await Part.find({ category: "mandir", enabled: true })
    .sort({ group: 1, layerOrder: 1, name: 1 })
    .lean();

  const materials = JSON.parse(JSON.stringify(materialsRaw));
  const templates = JSON.parse(JSON.stringify(templatesRaw));
  const parts = JSON.parse(JSON.stringify(partsRaw));

  if (!templates?.length) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Mandir templates not found. Create a template in Admin → Templates.
        </p>
        <Link className="underline" href="/">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Customize Your Mandir</h1>
      <MandirCustomizer materials={materials} templates={templates} parts={parts} />
    </div>
  );
}