import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectMongo } from "../lib/mongodb";
import { Template } from "../models/Template";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

async function main() {
  await connectMongo();

  // Drop old unique index on category (if it existed)
  try {
    await Template.collection.dropIndex("category_1");
    console.log("Dropped index category_1");
  } catch {
    console.log("No category_1 index to drop (ok).");
  }

  const all = await Template.find().lean();

  for (const t of all as any[]) {
    const slug = t.slug?.trim() ? t.slug : `${slugify(t.category)}-default`;
    const name = t.name?.trim() ? t.name : "Mandir Default";

    await Template.updateOne(
      { _id: t._id },
      {
        $set: {
          name,
          slug,
          isDefault: typeof t.isDefault === "boolean" ? t.isDefault : true,
          enabled: typeof t.enabled === "boolean" ? t.enabled : true,
        },
      }
    );
  }

  console.log("Template migration done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});