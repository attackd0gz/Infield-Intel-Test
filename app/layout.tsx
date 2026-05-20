import type { Metadata } from "next";
import { Inter, Oswald, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/CookieConsent";
import { siteUrl, defaultOgImage } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const defaultDescription =
  "Rate, review, and discover baseball complexes near San Antonio, TX. " +
  "Real reviews from real players and families.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Infield Intel",
    template: "%s | Infield Intel",
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    siteName: "Infield Intel",
    title: "Infield Intel",
    description: defaultDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Infield Intel — Baseball Complex Reviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infield Intel",
    description: defaultDescription,
    images: [defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
