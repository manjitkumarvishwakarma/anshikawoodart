import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CustomizeLandingPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Customize Your Furniture</h1>
        <p className="text-gray-700">
          Start with a template and customize. Save your design and send it to us on WhatsApp for a quote.
        </p>
      </div>

      <div className="rounded border p-5 space-y-3">
        <div className="font-semibold">Mandir Customizer</div>
        <p className="text-gray-700">
          Build a mandir design using ready modules. Choose wood, size preset, and optional custom size.
        </p>
        <Link href="/customize/mandir" className="inline-block rounded bg-black text-white px-4 py-2">
          Customize Mandir
        </Link>
      </div>
    </div>
  );
}