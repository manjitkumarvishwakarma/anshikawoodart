export const dynamic = "force-dynamic";

export default function ContactPage() {
  const phoneE164 = "918087412575"; // no + in wa.me
  const instagramUrl = "https://www.instagram.com/anshikawoodart/";

  const defaultMessage =
    "Hi Anshika Wood Art, I want to enquire about furniture / customization. Please share details.";

  const whatsappLink =
    `https://wa.me/${phoneE164}?text=` + encodeURIComponent(defaultMessage);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Contact Us</h1>
        <p className="text-gray-700">
          For inquiries, ready-made orders, or custom designs—message us on WhatsApp for a quick reply.
        </p>
      </div>

      <div className="rounded border p-5 space-y-4">
        <div>
          <div className="text-sm text-gray-600">WhatsApp</div>
          <div className="text-lg font-semibold">+91 80874 12575</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded bg-emerald-700 text-white px-4 py-2"
          >
            WhatsApp Us
          </a>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded border px-4 py-2 hover:bg-gray-50"
          >
            Instagram
          </a>
        </div>

        <div className="text-xs text-gray-500">
          Tip: Send reference images/sketch + required size for faster quotation.
        </div>
      </div>

      <div className="rounded border p-5 space-y-2">
        <div className="font-semibold">Business Hours</div>
        <div className="text-gray-700">Open daily from 9:00 AM.</div>
      </div>
    </div>
  );
}