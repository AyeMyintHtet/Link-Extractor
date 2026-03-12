"use server";

import * as cheerio from "cheerio";

export type CrawlMode = "fast" | "spider";

export type LinkNode = {
  url: string;
  status?: number;
  error?: string;
  firewall?: string;
  seoIssues?: {
    missingAltImages: string[];
  };
  children: LinkNode[] | null;
};

// Helper to detect common WAFs from headers
function detectFirewall(headers: Headers): string | undefined {
  const server = headers.get('server')?.toLowerCase() || '';
  if (server.includes('cloudflare')) return 'Cloudflare';
  if (server.includes('sucuri')) return 'Sucuri';
  if (headers.has('x-sucuri-id')) return 'Sucuri';
  if (server.includes('imperva') || server.includes('incapsula')) return 'Imperva';
  if (server.includes('akamai')) return 'Akamai';
  if (server.includes('hcdn') || headers.has('x-hcdn-request-id')) return 'Hostinger CDN';
  if (headers.has('x-fw-type')) return 'Custom WAF';
  return undefined;
}

// We create a helper function so we can pass currentDepth and visited track sets around easily
async function crawlPath(
  url: string,
  currentDepth: number,
  mode: CrawlMode,
  baseDomain: string,
  maxDepth: number,      
  maxBranches: number,   
  visited: Set<string>
): Promise<LinkNode> {
  // Ensure the URL is valid
  let validUrl: URL;
  try {
    const urlString = url.startsWith('http') ? url : `https://${url}`;
    validUrl = new URL(urlString);
  } catch {
    return { url, error: "Invalid URL format", children: null };
  }

  try {
    // 1. Fetch the raw HTML
    const response = await fetch(validUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      },
    });

    const firewall = detectFirewall(response.headers);

    if (!response.ok) {
      return { url: validUrl.toString(), status: response.status, error: `Status ${response.status}`, firewall, children: null };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const missingAltImages: string[] = [];
    $('img').each((_, el) => {
      const alt = $(el).attr('alt');
      // If the alt attribute is missing entirely or contains only whitespace
      if (alt === undefined || alt.trim() === '') {
        const src = $(el).attr('src') || 'Unknown Image';
        missingAltImages.push(src);
      }
    });
    const seoIssues = missingAltImages.length > 0 ? { missingAltImages } : undefined;

    // Extract all unique absolute links on THIS page
    const linkSet = new Set<string>();
    
    // 1. Visible Links: parse standard anchor tags (this catches relative links too!)
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          // Resolve relative URLs
          const absoluteUrl = new URL(href, validUrl.toString());
          const urlString = absoluteUrl.toString();
          
          if (urlString.startsWith('http') && urlString !== validUrl.toString()) {
            linkSet.add(urlString);
          }
        } catch {
          // Ignore invalid URLs
        }
      }
    });

    // 2. Hidden Links: Spider the raw HTML for ANY http/https patterns
    // This catches URLs embedded in JavaScript, metadata, JSON payloads, etc.
    const urlRegex = /https?:\/\/[^\s"'<>`()[\]{}]+/g;
    const hiddenMatches = html.match(urlRegex) || [];
    
    for (const match of hiddenMatches) {
      try {
        const absoluteUrl = new URL(match);
        const urlString = absoluteUrl.toString();
        
        // Exclude the current page URL itself
        if (urlString.startsWith('http') && urlString !== validUrl.toString()) {
          linkSet.add(urlString);
        }
      } catch {
        // Ignore parsing errors for malformed hidden links
      }
    }

    // 3. Sitemap XML Extraction
    // Most websites have a hidden sitemap.xml mapping out their entire site graph.
    // If we're at the root level, we should attempt to fetch and parse it for massive data collection.
    if (currentDepth === 0) {
      try {
        const sitemapUrl = `${validUrl.origin}/sitemap.xml`;
        const sitemapResponse = await fetch(sitemapUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
        });
        
        if (sitemapResponse.ok) {
          const sitemapText = await sitemapResponse.text();
          
          // Check if this is a sitemap index (contains other sitemaps)
          if (sitemapText.includes('<sitemapindex')) {
            const childSitemaps = sitemapText.match(urlRegex) || [];
            
            // Limit to first 5 child sitemaps to prevent timing out on giant networks
            const limitedSitemaps = childSitemaps.slice(0, 5);
            
            for (const childMapUrl of limitedSitemaps) {
              if (childMapUrl.endsWith('.xml')) {
                try {
                  const childRes = await fetch(childMapUrl, { 
                    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
                  });
                  if (childRes.ok) {
                    const childText = await childRes.text();
                    const pageUrls = childText.match(urlRegex) || [];
                    for (const match of pageUrls) {
                      try {
                        const absoluteUrl = new URL(match);
                        const urlString = absoluteUrl.toString();
                        // Only add actual HTML/page URLs, ignore more XMLs or schemas
                        if (urlString.startsWith('http') && 
                            !urlString.endsWith('.xml') && 
                            urlString !== validUrl.toString()) {
                          linkSet.add(urlString);
                        }
                      } catch {
                        // ignore malformed
                      }
                    }
                  }
                } catch {
                  // ignore child fetch error
                }
              }
            }
          } else {
            // It's a standard sitemap, extract URLs directly
            const sitemapMatches = sitemapText.match(urlRegex) || [];
            for (const match of sitemapMatches) {
              try {
                const absoluteUrl = new URL(match);
                const urlString = absoluteUrl.toString();
                if (urlString.startsWith('http') && 
                    !urlString.endsWith('.xml') && 
                    urlString !== validUrl.toString()) {
                  linkSet.add(urlString);
                }
              } catch {
                // Ignore invalid URLs inside the sitemap
              }
            }
          }
        }
      } catch {
        // Ignore network errors fetching the sitemap (it might not exist)
      }
    }

    const uniqueLinks = Array.from(linkSet);

    // Globally filter out any links that have already been discovered
    // This prioritizes the parent and ensures all links are 100% unique across the tree
    const novelLinks: string[] = [];
    for (const link of uniqueLinks) {
      if (!visited.has(link)) {
        visited.add(link);
        
        // In spider mode, ONLY follow links on the exact same base domain
        if (mode === "spider" && new URL(link).hostname !== baseDomain) {
          // We won't follow it, but we can add it as a leaf to the set
          novelLinks.push(link);
        } else {
          novelLinks.push(link);
        }
      }
    }

    // If we have reached our max depth, stop recursing here but return the found links as leaf nodes
    if (currentDepth >= maxDepth) {
      return {
        url: validUrl.toString(),
        status: response.status,
        firewall,
        seoIssues,
        children: novelLinks.length > 0 ? novelLinks.map(l => ({ url: l, children: null })) : null
      };
    }

    // Otherwise, we recurse further into the first N branches
    // In spider mode, we only want to recurse into logic that stays on the domain
    // We already added external links to novelLinks to show them in the UI, 
    // but they should just be mapped to leaf nodes instead of being followed.
    const branchesToFollow: string[] = [];
    const leafNodes: string[] = [];

    for (const link of novelLinks) {
      if (branchesToFollow.length >= maxBranches) {
        leafNodes.push(link);
      } else {
        if (mode === "spider") {
          const lUrl = new URL(link);
          if (lUrl.hostname === baseDomain) {
            branchesToFollow.push(link);
          } else {
            leafNodes.push(link);
          }
        } else {
          branchesToFollow.push(link);
        }
      }
    }
    
    // We want to fetch all the child branches in parallel for speed!
    const childPromises = branchesToFollow.map(childUrl => 
      crawlPath(childUrl, currentDepth + 1, mode, baseDomain, maxDepth, maxBranches, visited)
    );
    
    const childResults = await Promise.allSettled(childPromises);
    
    const children: LinkNode[] = childResults.map((result, idx) => {
      // If the promise fulfilled successfully, return the scraped tree
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return { url: branchesToFollow[idx], error: "Failed to scrape child", children: null };
    });

    // Also include any links we skipped because of maxBranches limit, just as flat leaf nodes
    // Also include any links we skipped/didn't recurse into as basic leaves
    const remainingLeaves = leafNodes.map(l => ({ url: l, children: null }));
    const allChildren = [...children, ...remainingLeaves];

    return {
      url: validUrl.toString(),
      status: response.status,
      firewall,
      seoIssues,
      children: allChildren.length > 0 ? allChildren : null
    };

  } catch (err: any) {
    return { url: validUrl.toString(), error: err.message || "Extraction Failed", children: null };
  }
}

export async function extractLinksAction(url: string, mode: CrawlMode = "fast") {
  if (!url) {
    return { error: "URL is required" };
  }
  
  try {
    const urlString = url.startsWith('http') ? url : `https://${url}`;
    const validUrl = new URL(urlString);
    
    const visited = new Set<string>();
    visited.add(validUrl.toString()); // add root so children don't point back to it
    
    // Limits based on mode
    const maxDepth = mode === "spider" ? 4 : 2;
    const maxBranches = mode === "spider" ? 20 : 8;
    const baseDomain = validUrl.hostname;

    // Initiate the crawl from depth 0
    const tree = await crawlPath(validUrl.toString(), 0, mode, baseDomain, maxDepth, maxBranches, visited);
    return { tree };
  } catch (error) {
    console.error("Scraping Error:", error);
    return { error: "Could not fetch or extract links. Ensure the URL is public and accessible." };
  }
}
