import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectMongo } from "../lib/mongodb";
import { Template } from "../models/Template";
import { Material } from "../models/Material";

async function main() {
  await connectMongo();

  const teak = await Material.findOne({ name: "Teak" }).lean();
  if (!teak?._id) throw new Error("Teak material not found. Run seed:materials first.");

  const mandir = {
    name: "Mandir",
    category: "mandir",
    enabled: true,
    defaultMaterialId: teak._id,
    sizePresets: [
      { key: "M24", label: '24"', basePrice: 18000 },
      { key: "M30", label: '30"', basePrice: 24000 },
    ],
    allowedPartIds: [],
  };

  await Template.updateOne(
    { category: "mandir" },
    { $set: mandir },
    { upsert: true }
  );

  const saved = await Template.findOne({ category: "mandir" })
    .populate("defaultMaterialId", "name multiplier")
    .lean();

  console.log("Seeded template:", saved);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});