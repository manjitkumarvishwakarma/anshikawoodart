import { connectMongo } from "@/lib/mongodb";
import { Part } from "@/models/Part";
import PartsTable from "./ui/PartsTable";
import { toPlain } from "@/lib/toPlain";
export const dynamic = "force-dynamic";

export default async function AdminPartsPage() {
  await connectMongo();

  const partsRaw = await Part.find({ category: "mandir" })
  .sort({ group: 1, layerOrder: 1, name: 1 })
  .lean();
  
  const parts = toPlain(partsRaw);
  return <PartsTable initialParts={parts as any} />;


//   const parts = await Part.find({ category: "mandir" })
//     .sort({ group: 1, layerOrder: 1, name: 1 })
//     .lean();

//   return (
//     <div className="space-y-4">
//       <h1 className="text-xl font-semibold">Parts (Mandir)</h1>
//       <p className="text-sm text-gray-600">
//         Edit prices for M24/M30 and enable/disable parts.
//       </p>
//       <PartsTable initialParts={parts as any} />
//     </div>
//   );
}