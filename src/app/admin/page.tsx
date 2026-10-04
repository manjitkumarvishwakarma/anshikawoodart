import Link from "next/link";
import { connectMongo } from "@/lib/mongodb";
import { Material } from "@/models/Material";
import { Part } from "@/models/Part";
import { Enquiry } from "@/models/Enquiry";
import { Creation } from "@/models/Creation";
import { Design } from "@/models/Design";

export const dynamic = "force-dynamic";

function toPlain<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export default async function AdminHome() {
  await connectMongo();

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    materialsCount,
    enabledMaterialsCount,

    partsCount,
    enabledPartsCount,

    enquiriesCount,
    newEnquiriesCount,
    enquiries24hCount,
    enquiries7dCount,

    creationsCount,
    enabledCreationsCount,

    designsCount,
    recentEnquiriesRaw,
  ] = await Promise.all([
    Material.countDocuments(),
    Material.countDocuments({ enabled: true }),

    Part.countDocuments({ category: "mandir" }),
    Part.countDocuments({ category: "mandir", enabled: true }),

    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: "new" }),
    Enquiry.countDocuments({ createdAt: { $gte: last24h } }),
    Enquiry.countDocuments({ createdAt: { $gte: last7d } }),

    Creation.countDocuments(),
    Creation.countDocuments({ enabled: true }),

    Design.countDocuments(),

    Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select({ name: 1, phone: 1, status: 1, createdAt: 1, template: 1, sizeKey: 1, estimatedPrice: 1 })
      .lean(),
  ]);

  const recentEnquiries = toPlain(recentEnquiriesRaw);

  const cards = [
    { title: "Materials", value: `${enabledMaterialsCount} / ${materialsCount}`, desc: "Enabled / Total", href: "/admin/materials" },
    { title: "Mandir Parts", value: `${enabledPartsCount} / ${partsCount}`, desc: "Enabled / Total", href: "/admin/parts" },
    { title: "Creations", value: `${enabledCreationsCount} / ${creationsCount}`, desc: "Enabled / Total", href: "/admin/creations" },
    { title: "Designs Saved", value: `${designsCount}`, desc: "Total saved designs", href: "#" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-600">Quick overview and shortcuts.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.title} href={c.href} className="rounded border p-4 hover:bg-gray-50">
            <div className="text-sm text-gray-600">{c.title}</div>
            <div className="text-2xl font-semibold mt-1">{c.value}</div>
            <div className="text-xs text-gray-500 mt-2">{c.desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Enquiry stats */}
        <div className="rounded border p-4 space-y-2">
          <div className="font-semibold">Enquiry Stats</div>
          <div className="text-sm flex justify-between"><span>New (unread)</span><span className="font-medium">{newEnquiriesCount}</span></div>
          <div className="text-sm flex justify-between"><span>Last 24 hours</span><span className="font-medium">{enquiries24hCount}</span></div>
          <div className="text-sm flex justify-between"><span>Last 7 days</span><span className="font-medium">{enquiries7dCount}</span></div>
          <div className="text-sm flex justify-between"><span>Total</span><span className="font-medium">{enquiriesCount}</span></div>

          <div className="pt-2">
            <Link className="text-sm underline" href="/admin/enquiries">
              View all enquiries →
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded border p-4 lg:col-span-2">
          <div className="font-semibold mb-2">Recent Enquiries</div>

          {recentEnquiries.length === 0 ? (
            <div className="text-sm text-gray-500">No enquiries yet.</div>
          ) : (
            <div className="overflow-auto rounded border">
              <table className="min-w-[820px] w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Customer</th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Estimate</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnquiries.map((e: any) => (
                    <tr key={e._id} className="border-t">
                      <td className="p-2">{e.name}</td>
                      <td className="p-2">
                        <a className="text-blue-600 underline" href={`tel:${e.phone}`}>{e.phone}</a>
                      </td>
                      <td className="p-2">{e.template ?? "Mandir"} {e.sizeKey ? `(${e.sizeKey})` : ""}</td>
                      <td className="p-2">₹ {(e.estimatedPrice ?? 0).toLocaleString("en-IN")}</td>
                      <td className="p-2">{e.status}</td>
                      <td className="p-2 text-gray-600">
                        {new Date(e.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded border px-3 py-2 text-sm hover:bg-gray-50" href="/admin/materials">Materials</Link>
            <Link className="rounded border px-3 py-2 text-sm hover:bg-gray-50" href="/admin/templates">Templates</Link>
            <Link className="rounded border px-3 py-2 text-sm hover:bg-gray-50" href="/admin/parts">Parts</Link>
            <Link className="rounded border px-3 py-2 text-sm hover:bg-gray-50" href="/admin/creations">Creations</Link>
            <Link className="rounded border px-3 py-2 text-sm hover:bg-gray-50" href="/admin/enquiries">Enquiries</Link>
          </div>
        </div>
      </div>
    </div>
  );
}