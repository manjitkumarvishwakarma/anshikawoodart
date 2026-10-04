import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectMongo } from "../lib/mongodb";
import { Part } from "../models/Part";

type SizeKey = "M24" | "M30";

function img(size: SizeKey, key: string) {
  return `/parts/mandir/${size}/${key}.svg`;
}

/**
 * Anchor convention:
 * - Base provides FEMALE anchors
 * - Other modules provide MALE anchors to plug into base
 * - Pillar set provides FEMALE at top for canopy
 * - Canopy provides MALE to plug into pillar-top FEMALE
 */
async function main() {
  await connectMongo();

  const parts = [
    // BASES (fixed, bottom)
    {
      key: "base_a",
      name: "Base Platform – Style A",
      group: "Base",
      layerOrder: 10,
      imageBySize: { M24: img("M24", "base_a"), M30: img("M30", "base_a") },
      pricesBySize: { M24: 0, M30: 0 }, // base price comes from template
      anchors: [
        { id: "a_pillar_l", type: "BASE__PILLAR_L", gender: "female", x: 90, y: 0 },
        { id: "a_pillar_r", type: "BASE__PILLAR_R", gender: "female", x: 430, y: 0 },
        { id: "a_back",     type: "BASE__BACKPANEL", gender: "female", x: 180, y: 0 },
        { id: "a_front",    type: "BASE__FRONTFRAME", gender: "female", x: 340, y: 0 },
        { id: "a_drawer",   type: "BASE__DRAWER", gender: "female", x: 260, y: 20 },
      ],
    },
    {
      key: "base_b",
      name: "Base Platform – Style B",
      group: "Base",
      layerOrder: 10,
      imageBySize: { M24: img("M24", "base_b"), M30: img("M30", "base_b") },
      pricesBySize: { M24: 500, M30: 800 }, // extra for style B
      anchors: [
        { id: "b_pillar_l", type: "BASE__PILLAR_L", gender: "female", x: 90, y: 0 },
        { id: "b_pillar_r", type: "BASE__PILLAR_R", gender: "female", x: 430, y: 0 },
        { id: "b_back",     type: "BASE__BACKPANEL", gender: "female", x: 180, y: 0 },
        { id: "b_front",    type: "BASE__FRONTFRAME", gender: "female", x: 340, y: 0 },
        { id: "b_drawer",   type: "BASE__DRAWER", gender: "female", x: 260, y: 20 },
      ],
    },

    // BACK PANELS (behind)
    {
      key: "back_plain",
      name: "Back Panel – Plain",
      group: "Back & Sides",
      layerOrder: 5,
      imageBySize: { M24: img("M24", "back_plain"), M30: img("M30", "back_plain") },
      pricesBySize: { M24: 2000, M30: 2600 },
      anchors: [
        { id: "back_to_base", type: "BASE__BACKPANEL", gender: "male", x: 260, y: 420 },
        { id: "shelf_slot",   type: "BACKPANEL__SHELF", gender: "female", x: 260, y: 210 },
      ],
    },
    {
      key: "back_carved",
      name: "Back Panel – Carved",
      group: "Back & Sides",
      layerOrder: 5,
      imageBySize: { M24: img("M24", "back_carved"), M30: img("M30", "back_carved") },
      pricesBySize: { M24: 3500, M30: 4500 },
      anchors: [
        { id: "back_to_base", type: "BASE__BACKPANEL", gender: "male", x: 260, y: 420 },
        { id: "shelf_slot",   type: "BACKPANEL__SHELF", gender: "female", x: 260, y: 210 },
      ],
    },

    // PILLARS (middle)
    {
      key: "pillar_set_1",
      name: "Pillar Set – Style 1",
      group: "Pillars",
      layerOrder: 20,
      imageBySize: { M24: img("M24", "pillar_set_1"), M30: img("M30", "pillar_set_1") },
      pricesBySize: { M24: 3000, M30: 3800 },
      anchors: [
        { id: "pL_to_base", type: "BASE__PILLAR_L", gender: "male", x: 90, y: 420 },
        { id: "pR_to_base", type: "BASE__PILLAR_R", gender: "male", x: 430, y: 420 },
        { id: "pL_top",     type: "PILLAR__CANOPY_L", gender: "female", x: 90, y: 0 },
        { id: "pR_top",     type: "PILLAR__CANOPY_R", gender: "female", x: 430, y: 0 },
      ],
    },
    {
      key: "pillar_set_2",
      name: "Pillar Set – Style 2",
      group: "Pillars",
      layerOrder: 20,
      imageBySize: { M24: img("M24", "pillar_set_2"), M30: img("M30", "pillar_set_2") },
      pricesBySize: { M24: 3400, M30: 4300 },
      anchors: [
        { id: "pL_to_base", type: "BASE__PILLAR_L", gender: "male", x: 90, y: 420 },
        { id: "pR_to_base", type: "BASE__PILLAR_R", gender: "male", x: 430, y: 420 },
        { id: "pL_top",     type: "PILLAR__CANOPY_L", gender: "female", x: 90, y: 0 },
        { id: "pR_top",     type: "PILLAR__CANOPY_R", gender: "female", x: 430, y: 0 },
      ],
    },

    // CANOPY (top)
    {
      key: "canopy_1",
      name: "Canopy / Top – Style 1",
      group: "Top / Canopy",
      layerOrder: 30,
      imageBySize: { M24: img("M24", "canopy_1"), M30: img("M30", "canopy_1") },
      pricesBySize: { M24: 2200, M30: 2800 },
      anchors: [
        { id: "cL_to_pillar", type: "PILLAR__CANOPY_L", gender: "male", x: 90, y: 120 },
        { id: "cR_to_pillar", type: "PILLAR__CANOPY_R", gender: "male", x: 430, y: 120 },
        { id: "finial_slot",  type: "CANOPY__FINIAL", gender: "female", x: 260, y: 0 },
      ],
    },
    {
      key: "canopy_2",
      name: "Canopy / Top – Style 2",
      group: "Top / Canopy",
      layerOrder: 30,
      imageBySize: { M24: img("M24", "canopy_2"), M30: img("M30", "canopy_2") },
      pricesBySize: { M24: 2600, M30: 3300 },
      anchors: [
        { id: "cL_to_pillar", type: "PILLAR__CANOPY_L", gender: "male", x: 90, y: 120 },
        { id: "cR_to_pillar", type: "PILLAR__CANOPY_R", gender: "male", x: 430, y: 120 },
        { id: "finial_slot",  type: "CANOPY__FINIAL", gender: "female", x: 260, y: 0 },
      ],
    },

    // FRONT FRAME + DOORS
    {
      key: "frontframe_1",
      name: "Front Frame – Style 1",
      group: "Front & Doors",
      layerOrder: 40,
      imageBySize: { M24: img("M24", "frontframe_1"), M30: img("M30", "frontframe_1") },
      pricesBySize: { M24: 2600, M30: 3300 },
      anchors: [
        { id: "ff_to_base",  type: "BASE__FRONTFRAME", gender: "male", x: 260, y: 460 },
        { id: "ff_doors",    type: "FRONTFRAME__DOORS", gender: "female", x: 260, y: 230 },
      ],
    },
    {
      key: "frontframe_2",
      name: "Front Frame – Style 2",
      group: "Front & Doors",
      layerOrder: 40,
      imageBySize: { M24: img("M24", "frontframe_2"), M30: img("M30", "frontframe_2") },
      pricesBySize: { M24: 3100, M30: 3900 },
      anchors: [
        { id: "ff_to_base",  type: "BASE__FRONTFRAME", gender: "male", x: 260, y: 460 },
        { id: "ff_doors",    type: "FRONTFRAME__DOORS", gender: "female", x: 260, y: 230 },
      ],
    },
    {
      key: "doors_plain",
      name: "Door Set – Plain",
      group: "Front & Doors",
      layerOrder: 45,
      imageBySize: { M24: img("M24", "doors_plain"), M30: img("M30", "doors_plain") },
      pricesBySize: { M24: 2200, M30: 2800 },
      anchors: [
        { id: "d_to_ff", type: "FRONTFRAME__DOORS", gender: "male", x: 230, y: 420 },
      ],
    },
    {
      key: "doors_jali",
      name: "Door Set – Jali / Lattice",
      group: "Front & Doors",
      layerOrder: 45,
      imageBySize: { M24: img("M24", "doors_jali"), M30: img("M30", "doors_jali") },
      pricesBySize: { M24: 3000, M30: 3800 },
      anchors: [
        { id: "d_to_ff", type: "FRONTFRAME__DOORS", gender: "male", x: 230, y: 420 },
      ],
    },

    // STORAGE
    {
      key: "drawer_2",
      name: "Drawer Module – 2 Drawer",
      group: "Storage",
      layerOrder: 15,
      imageBySize: { M24: img("M24", "drawer_2"), M30: img("M30", "drawer_2") },
      pricesBySize: { M24: 1800, M30: 2300 },
      anchors: [
        { id: "dr_to_base", type: "BASE__DRAWER", gender: "male", x: 220, y: 110 },
      ],
    },
    {
      key: "shelf_1",
      name: "Shelf Module – 1 Shelf",
      group: "Storage",
      layerOrder: 12,
      imageBySize: { M24: img("M24", "shelf_1"), M30: img("M30", "shelf_1") },
      pricesBySize: { M24: 700, M30: 900 },
      anchors: [
        { id: "sh_to_back", type: "BACKPANEL__SHELF", gender: "male", x: 180, y: 15 },
      ],
    },
    {
      key: "shelf_2",
      name: "Shelf Module – 2 Shelves",
      group: "Storage",
      layerOrder: 12,
      imageBySize: { M24: img("M24", "shelf_2"), M30: img("M30", "shelf_2") },
      pricesBySize: { M24: 1200, M30: 1500 },
      anchors: [
        { id: "sh_to_back", type: "BACKPANEL__SHELF", gender: "male", x: 180, y: 30 },
      ],
    },

    // ORNAMENTS
    {
      key: "orn_corners",
      name: "Corner Brackets Pack",
      group: "Ornaments",
      layerOrder: 50,
      imageBySize: { M24: img("M24", "orn_corners"), M30: img("M30", "orn_corners") },
      pricesBySize: { M24: 900, M30: 1100 },
      anchors: [
        { id: "orn_to_canopy", type: "CANOPY__ORNAMENT", gender: "male", x: 40, y: 80 },
      ],
    },
    {
      key: "finial",
      name: "Top Finial / Kalash",
      group: "Ornaments",
      layerOrder: 60,
      imageBySize: { M24: img("M24", "finial"), M30: img("M30", "finial") },
      pricesBySize: { M24: 600, M30: 800 },
      anchors: [
        { id: "fin_to_canopy", type: "CANOPY__FINIAL", gender: "male", x: 35, y: 90 },
      ],
    },
  ];

  // Add one more decorative pack to reach 18 with useful anchor:
  parts.push({
    key: "orn_top",
    name: "Top Ornament",
    group: "Ornaments",
    layerOrder: 55,
    imageBySize: { M24: "/parts/mandir/M24/finial.svg", M30: "/parts/mandir/M30/finial.svg" }, // reuse placeholder
    pricesBySize: { M24: 500, M30: 650 },
    anchors: [{ id: "otc", type: "CANOPY__ORNAMENT", gender: "male", x: 35, y: 90 }],
  } as any);

  // Save all
  for (const p of parts) {
    await Part.updateOne(
      { key: p.key },
      { $set: { ...p, category: "mandir", enabled: true } },
      { upsert: true }
    );
  }

  console.log("Seeded parts:", await Part.countDocuments({ category: "mandir" }));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});