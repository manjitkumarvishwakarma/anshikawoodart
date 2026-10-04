import { connectMongo } from "@/lib/mongodb";
import { Template } from "@/models/Template";
import TemplatesAdmin from "./ui/TemplatesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  await connectMongo();

  const templatesRaw = await Template.find({ category: "mandir" })
    .sort({ isDefault: -1, enabled: -1, createdAt: -1 })
    .lean();

  const templates = JSON.parse(JSON.stringify(templatesRaw));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Templates (Mandir)</h1>
      <TemplatesAdmin initialTemplates={templates} />
    </div>
  );
}