import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { connectMongo } from "../lib/mongodb";
import { Enquiry } from "../models/Enquiry";

async function main() {
  await connectMongo();

  await Enquiry.create({
    name: "Test Customer",
    phone: "9876543210",
    city: "Pune",
    notes: "This is a test enquiry.",
    template: "Mandir",
    sizeKey: "M24",
    materialName: "Teak",
    estimatedPrice: 25000,
    status: "new",
  });

  console.log("Test enquiry created.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});