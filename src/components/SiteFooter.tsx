import Link from "next/link";

export default function SiteFooter() {
  const shopName = "Anshika Wood Art";
  const tagline =
    "Handcrafted wooden furniture & wood art in Pune. Experience timeless craftsmanship.";

  const address =
    "Ashika Wood Art, Ota, Nagar Colony, near Sundaram Idali, Bhawani Peth, Pune, Maharashtra 411042, India";

  const directionsLink =
    "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(address);

  const whatsappLink =
    "https://wa.me/918087412575?text=" +
    encodeURIComponent("Hi Anshika Wood Art, I want to enquire about furniture / customization.");

  const instagramLink = "https://www.instagram.com/anshikawoodart/";

  // If you have a domain later, put it here (or read from env)
  const websiteLabel = "anshikawoodart.com"; // change later if needed
  const websiteLink = "/"; // you can set to "https://anshikawoodart.com" after deployment

  return (
    <footer className="border-t bg-[#fffaf3]">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="text-xl font-semibold tracking-tight">
              {shopName}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {tagline}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="rounded bg-emerald-700 text-white px-3 py-2 text-sm"
              >
                WhatsApp
              </a>
              <a
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="rounded border px-3 py-2 text-sm hover:bg-white"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <div className="font-semibold">Quick Links</div>
            <ul className="text-sm text-gray-700 space-y-2">
              <li><Link className="hover:underline" href="/">Home</Link></li>
              <li><Link className="hover:underline" href="/creations">Creations</Link></li>
              <li><Link className="hover:underline" href="/customize">Customize</Link></li>
              <li><Link className="hover:underline" href="/reviews">Reviews</Link></li>
              <li><Link className="hover:underline" href="/contact">Contact</Link></li>
              <li><Link className="hover:underline" href="/visit-us">Visit Us</Link></li>
              <li><Link className="hover:underline" href="/cart">Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <div className="font-semibold">Contact</div>

            <div className="text-sm text-gray-700 space-y-2">
              <div>
                <div className="text-gray-600">Address</div>
                <a
                  className="hover:underline"
                  href={directionsLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  {address}
                </a>
              </div>

              <div>
                <div className="text-gray-600">WhatsApp</div>
                <a className="hover:underline" href={whatsappLink} target="_blank" rel="noreferrer">
                  +91 80874 12575
                </a>
              </div>

              <div>
                <div className="text-gray-600">Website</div>
                <a className="hover:underline" href={websiteLink}>
                  {websiteLabel}
                </a>
              </div>

              <div className="text-gray-600">
                Open daily: <span className="text-gray-800 font-medium">9:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="border-t pt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-gray-600">
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </div>

          <div className="text-xs text-gray-700">
            Dhanyavaad! धन्यवाद! • Aabhar! आभार!
          </div>
        </div>
      </div>
    </footer>
  );
}