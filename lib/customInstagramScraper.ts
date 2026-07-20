/**
 * Custom Self-Contained Instagram Media & Audio Extractor Engine
 * Native backend extractor for Instagram Reel media, metadata, and audio processing.
 */

export interface CustomInstagramMediaResult {
  shortcode: string;
  mediaUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  caption?: string | null;
  ownerUsername?: string | null;
  ownerFullName?: string | null;
  displayUrl?: string | null;
  extractedVia: 'direct_html' | 'oembed' | 'backend_apify' | 'fallback_metadata';
}

export function extractShortcode(url: string): string | null {
  if (!url) return null;
  const match =
    url.match(/instagram\.com\/(?:[^/?#]+\/)?(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i) ||
    url.match(/instagram\.com\/share\/(?:reel|reels|r|p)\/([a-zA-Z0-9_-]+)/i);
  return match?.[1] || null;
}

/**
 * Native Backend Method 1: Instagram oEmbed Metadata
 */
export async function fetchInstagramOembed(shortcode: string): Promise<{ username?: string; caption?: string; thumbnail?: string } | null> {
  try {
    const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=https://www.instagram.com/p/${shortcode}/`;
    const res = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
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
    console.warn("Native IG oEmbed fetch failed:", err);
  }
  return null;
}

/**
 * Native Backend Method 2: Direct HTML Stream Link Parser
 */
export async function fetchInstagramDirectHtml(shortcode: string): Promise<string | null> {
  try {
    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
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
    console.warn("Native IG HTML scraper failed:", err);
  }
  return null;
}

/**
 * Native Backend Extractor Pipeline
 */
export async function extractInstagramMedia(url: string, apifyToken?: string): Promise<CustomInstagramMediaResult> {
  const shortcode = extractShortcode(url);
  if (!shortcode) {
    throw new Error("Please enter a valid Instagram reel link.");
  }

  // 1. Fetch metadata natively via oEmbed
  const oembed = await fetchInstagramOembed(shortcode);

  // 2. Try native HTML stream parsing
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

  // 3. Optional backend service fetch
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
            extractedVia: 'backend_apify'
          };
        }
      }
    } catch (backendErr) {
      console.warn("Backend service fetch attempt skipped:", backendErr);
    }
  }

  // 4. Guaranteed Native Fallback using oEmbed metadata
  return {
    shortcode,
    mediaUrl: null,
    caption: oembed?.caption || "Instagram Reel Video Scan",
    ownerUsername: oembed?.username || "instagram_user",
    displayUrl: oembed?.thumbnail,
    extractedVia: 'fallback_metadata'
  };
}
