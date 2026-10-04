import { connectMongo } from "@/lib/mongodb";
import { Enquiry } from "@/models/Enquiry";
import EnquiriesTable from "./ui/EnquiriesTable";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  await connectMongo();

  const enquiries = await Enquiry.find()
    .sort({ createdAt: -1 })
    .lean();

  const plainEnquiries = JSON.parse(JSON.stringify(enquiries));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Enquiries</h1>
        <p className="text-sm text-gray-600">
          View customer enquiries and update their status.
        </p>
      </div>

      <EnquiriesTable initialEnquiries={plainEnquiries} />
    </div>
  );
}