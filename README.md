# 🎯 Broken Link & SEO Auditor

A powerful, high-performance web crawler built with **Next.js 15**, **TypeScript**, and **Cheerio**. Instantly audit any website for broken links (404s) and identify missing image Alt Text to boost your site's SEO.

![Broken Link Auditor Demo](https://raw.githubusercontent.com/lucide-react/lucide/main/icons/target.svg)

## 🚀 Key Features

- **⚡ Fast Map Mode**: Rapidly scan top-level links and immediate children for a quick health check.
- **🕷️ Deep Spider Mode**: Exhaustive crawling that follows internal links up to 4 levels deep, including hidden links found in JS/JSON and Sitemap XML parsing.
- **🛡️ WAF Detection**: Automatically identifies if a site is protected by Cloudflare, Sucuri, Akamai, and other Firewalls.
- **📊 Interactive SEO Summary**: Get a bird's-eye view of total scanned links, broken links, and missing alt attributes.
- **🌲 Detailed Flow Tree**: A recursive, expandable tree view of your site's architecture and issues.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Scraping Engine**: [Cheerio](https://cheerio.js.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd supabase-nextjs-chatapp
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📂 Project Structure

- `src/app/page.tsx`: The stunning, glassmorphic UI for the auditor.
- `src/app/actions.ts`: High-performance recursive Server Actions for web crawling and link extraction.
- `src/app/globals.css`: Modern Tailwind CSS configurations and animations.

## 🛡️ Security Note

This tool is designed for auditing sites you own or have permission to scan. Please be mindful of a website's `robots.txt` and crawling frequency to avoid being flagged as malicious traffic.

---

Built with ❤️ by [Aye Myint Htet](https://github.com/ayemyinthtet)
