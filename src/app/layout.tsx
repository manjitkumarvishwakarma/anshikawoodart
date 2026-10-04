import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import { getSiteUrl } from "@/lib/siteUrl";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const site = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(site),

  title: {
    default: "Anshika Wood Art | Pune",
    template: "%s | Anshika Wood Art Pune",
  },
  description:
    "Crafting Dreams in Wood — Handcrafted furniture, mandir, and wood art in Pune.",

  alternates: {
    canonical: "/", // default canonical for home
  },

  openGraph: {
    type: "website",
    siteName: "Anshika Wood Art",
    url: "/", // resolves using metadataBase
    title: "Anshika Wood Art | Pune",
    description:
      "Crafting Dreams in Wood — Handcrafted furniture, mandir, and wood art in Pune.",
    // You can add a default OG image later:
    // images: [{ url: "/og-default.jpg", width: 1200, height: 630 }]
  },

  twitter: {
    card: "summary_large_image",
    title: "Anshika Wood Art | Pune",
    description:
      "Crafting Dreams in Wood — Handcrafted furniture, mandir, and wood art in Pune.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}