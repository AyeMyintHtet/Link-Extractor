import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deep Spider | Professional Link Extractor & Web Scraper",
  description: "Extract hidden web links, build visual sitemaps, and detect Web Application Firewalls (Cloudflare, Sucuri, Hostinger) with our powerful deep-crawling spider.",
  keywords: ["web scraper", "link extractor", "sitemap generator", "SEO tool", "WAF detector", "cloudflare bypass"],
  authors: [{ name: "LinkCrawler" }],
  openGraph: {
    title: "Deep Spider | Professional Link Extractor",
    description: "Extract hidden web links, build visual sitemaps, and detect Web Application Firewalls instantly.",
    type: "website",
    locale: "en_US",
    siteName: "Deep Spider",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Spider | Professional Link Extractor",
    description: "Extract hidden web links, build visual sitemaps, and detect Web Application Firewalls instantly.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
