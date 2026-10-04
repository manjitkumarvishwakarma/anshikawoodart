import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectMongo } from "../lib/mongodb";
import { Material } from "../models/Material";

async function main() {
  await connectMongo();

  const materials = [
    { name: "Teak", multiplier: 1.0, previewColor: "#8b5a2b" },
    { name: "Sheesham", multiplier: 1.05, previewColor: "#6b3f2a" },
    { name: "Mango", multiplier: 0.85, previewColor: "#b07a3a" },
    { name: "Oak", multiplier: 1.1, previewColor: "#caa46a" },
  ];

  for (const m of materials) {
    await Material.updateOne(
      { name: m.name },
      { $set: { ...m, enabled: true } },
      { upsert: true }
    );
  }

  const all = await Material.find().lean();
  console.log(
    "Seeded materials:",
    all.map((x) => ({ name: x.name, multiplier: x.multiplier }))
  );

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});