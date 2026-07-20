/**
 * Custom Instagram Media & Audio URL Extractor Engine
 * Self-hosted multi-tier extractor to obtain video/audio CDN URLs and metadata from Instagram Reels.
 */

export interface CustomInstagramMediaResult {
  shortcode: string;
  mediaUrl: string;
  audioUrl?: string;
  videoUrl?: string;
  caption?: string;
  ownerUsername?: string;
  ownerFullName?: string;
  displayUrl?: string;
  extractedVia: 'oembed' | 'direct_html' | 'apify_primary' | 'apify_fallback';
}

export function extractShortcode(url: string): string | null {
  if (!url) return null;
  const match =
    url.match(/instagram\.com\/(?:[^/?#]+\/)?(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i) ||
    url.match(/instagram\.com\/share\/(?:reel|reels|r|p)\/([a-zA-Z0-9_-]+)/i);
  return match?.[1] || null;
}

/**
 * Tier 1: Extract basic metadata from Instagram oEmbed API
 */
export async function fetchInstagramOembed(shortcode: string): Promise<{ username?: string; caption?: string; thumbnail?: string } | null> {
  try {
    const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=https://www.instagram.com/p/${shortcode}/`;
    const res = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      return {
        username: data.author_name,
        caption: data.title,
        thumbnail: data.thumbnail_url
      };
    }
  } catch (err) {
    console.warn("Custom IG oEmbed fetch failed:", err);
  }
  return null;
}

/**
 * Tier 2: Direct HTML & Meta Tag Extractor
 */
export async function fetchInstagramDirectHtml(shortcode: string): Promise<string | null> {
  try {
    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (res.ok) {
      const html = await res.text();
      const videoMatch = html.match(/"video_url":\s*"([^"]+)"/);
      if (videoMatch && videoMatch[1]) {
        return videoMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
      }
      const ogVideoMatch = html.match(/<meta property="og:video" content="([^"]+)"/);
      if (ogVideoMatch && ogVideoMatch[1]) {
        return ogVideoMatch[1].replace(/&amp;/g, '&');
      }
    }
  } catch (err) {
    console.warn("Custom IG HTML scraper failed:", err);
  }
  return null;
}

/**
 * Full Extractor Engine: Runs multi-tier extraction pipeline
 */
export async function extractInstagramMedia(url: string, apifyToken?: string): Promise<CustomInstagramMediaResult> {
  const shortcode = extractShortcode(url);
  if (!shortcode) {
    throw new Error("Invalid Instagram link provided.");
  }

  // 1. Fetch metadata via oEmbed
  const oembed = await fetchInstagramOembed(shortcode);

  // 2. Try direct HTML extraction
  const directVideoUrl = await fetchInstagramDirectHtml(shortcode);
  if (directVideoUrl) {
    return {
      shortcode,
      mediaUrl: directVideoUrl,
      videoUrl: directVideoUrl,
      caption: oembed?.caption,
      ownerUsername: oembed?.username,
      displayUrl: oembed?.thumbnail,
      extractedVia: 'direct_html'
    };
  }

  // 3. Fallback to Apify High-Speed Details Scraper actor
  if (apifyToken) {
    try {
      const primaryUrl = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${apifyToken}`;
      const apifyRes = await fetch(primaryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directUrls: [url],
          resultsType: "details",
          resultsLimit: 1
        })
      });

      if (apifyRes.ok) {
        const data = await apifyRes.json();
        const item = Array.isArray(data) ? data[0] : data;
        const mediaUrl = item?.audioUrl || item?.videoUrl;

        if (mediaUrl) {
          return {
            shortcode,
            mediaUrl,
            audioUrl: item.audioUrl,
            videoUrl: item.videoUrl,
            caption: item.caption || oembed?.caption,
            ownerUsername: item.ownerUsername || oembed?.username,
            ownerFullName: item.ownerFullName,
            displayUrl: item.displayUrl || oembed?.thumbnail,
            extractedVia: 'apify_primary'
          };
        }
      }
    } catch (apifyErr) {
      console.warn("Apify primary actor failed in custom engine:", apifyErr);
    }
  }

  throw new Error("Could not extract downloadable video or audio URL from Instagram Reel.");
}
