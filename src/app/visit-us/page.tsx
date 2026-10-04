export const dynamic = "force-dynamic";

export default function VisitUsPage() {
  const shopName = "Anshika Wood Art, Pune";
  const address =
    "Ashika Wood Art, Ota, Nagar Colony, near Sundaram Idali, Bhawani Peth, Pune, Maharashtra 411042, India";

  // Directions link: Google Maps will use user's current location automatically
  const directionsLink =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(address) +
    "&destination_place_id="; // optional (leave empty)

  // Just open location (pin) (optional)
  const locationLink =
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Visit Us</h1>
        <p className="text-gray-700">
          Visit our workshop/showroom in Pune to explore designs and discuss custom furniture.
        </p>
      </div>

      <div className="rounded border p-5 space-y-3">
        <div className="font-semibold">{shopName}</div>
        <p className="text-gray-700">{address}</p>

        <div className="flex flex-wrap gap-2">
          <a
            href={directionsLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded bg-black text-white px-4 py-2"
          >
            Get Directions
          </a>

          <a
            href={locationLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded border px-4 py-2 hover:bg-gray-50"
          >
            Open in Maps
          </a>
        </div>

        <div className="text-sm text-gray-600">
          Open daily from <b>9:00 AM</b>.
        </div>
      </div>

      <div className="rounded border overflow-hidden">
        <iframe
          title="Anshika Wood Art Location"
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          width="100%"
          height="360"
          loading="lazy"
        />
      </div>
    </div>
  );
}