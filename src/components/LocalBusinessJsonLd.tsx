export default function LocalBusinessJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const data = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    name: "Anshika Wood Art",
    url: baseUrl,
    telephone: "+918087412575",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Ashika Wood Art, Ota, Nagar Colony, near Sundaram Idali, Bhawani Peth",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      postalCode: "411042",
      addressCountry: "IN",
    },
    openingHours: ["Mo-Su 09:00-21:00"],
    sameAs: ["https://www.instagram.com/anshikawoodart/"],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}