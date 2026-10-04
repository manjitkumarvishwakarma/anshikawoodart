import { connectMongo } from "@/lib/mongodb";
import { Creation } from "@/models/Creation";
import { Template } from "@/models/Template";
import CreationsAdmin from "./ui/CreationsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCreationsPage() {
  await connectMongo();

  const itemsRaw = await Creation.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  const items = JSON.parse(JSON.stringify(itemsRaw));

  const mandirTemplatesRaw = await Template.find({ category: "mandir", enabled: true })
    .sort({ isDefault: -1, createdAt: -1 })
    .select({ name: 1, slug: 1, isDefault: 1 })
    .lean();

  const mandirTemplates = JSON.parse(JSON.stringify(mandirTemplatesRaw));

  return <CreationsAdmin initialItems={items} mandirTemplates={mandirTemplates} />;
}