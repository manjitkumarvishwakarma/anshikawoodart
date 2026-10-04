import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectMongo } from "../lib/mongodb";
import { Part } from "../models/Part";

async function main() {
  await connectMongo();

  const canopyAnchors = [
    { id: "cL_to_pillar", type: "PILLAR__CANOPY_L", gender: "male", x: 90, y: 120 },
    { id: "cR_to_pillar", type: "PILLAR__CANOPY_R", gender: "male", x: 430, y: 120 },

    { id: "finial_slot", type: "CANOPY__FINIAL", gender: "female", x: 260, y: 0 },

    // NEW: ornament slots (so orn_corners / orn_top can snap)
    { id: "orn_slot_L", type: "CANOPY__ORNAMENT", gender: "female", x: 60, y: 20 },
    { id: "orn_slot_R", type: "CANOPY__ORNAMENT", gender: "female", x: 460, y: 20 },
  ] as const;

  await Part.updateOne({ key: "canopy_1" }, { $set: { anchors: canopyAnchors } });
  await Part.updateOne({ key: "canopy_2" }, { $set: { anchors: canopyAnchors } });

  console.log("Updated canopy anchors for canopy_1 and canopy_2");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});