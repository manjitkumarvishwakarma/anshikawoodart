import { connectMongo } from "@/lib/mongodb";
import { Material } from "@/models/Material";
import MaterialsTable from "./ui/MaterialsTable";

export const dynamic = "force-dynamic";

export default async function AdminMaterialsPage() {
  await connectMongo();

  const materialsRaw = await Material.find().sort({ name: 1 }).lean();
  const materials = JSON.parse(JSON.stringify(materialsRaw));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Materials</h1>
      <MaterialsTable materials={materials} />
    </div>
  );
}