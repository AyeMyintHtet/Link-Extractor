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
  title: "Broken Link & SEO Auditor",
  description: "Crawl your website to instantly identify broken links and images missing SEO-friendly ALT text.",
  keywords: ["seo auditor", "broken link checker", "web crawler", "missing alt text", "seo tool"],
  authors: [{ name: "SEO Auditor" }],
  openGraph: {
    title: "Broken Link & SEO Auditor",
    description: "Crawl your website to instantly identify broken links and images missing SEO-friendly ALT text.",
    type: "website",
    locale: "en_US",
    siteName: "SEO Auditor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Broken Link & SEO Auditor",
    description: "Crawl your website to instantly identify broken links and images missing SEO-friendly ALT text.",
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
  icons: {
    icon: [
      { url: '/favi.svg', type: 'image/svg+xml' }
    ]
  }
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
