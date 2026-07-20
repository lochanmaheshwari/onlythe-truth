const https = require('https');
const http = require('http');
const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const execFilePromise = promisify(execFile);

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;

    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      ...headers
    };

    client.get(url, { headers: defaultHeaders }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location, headers));
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

// Local Strategy 1: HTML Meta Tag & Script Parser
async function localHtmlScraper(shortcode) {
  console.log("\n[LOCAL SCRAPER] Trying HTML parser for shortcode:", shortcode);

  const urls = [
    `https://www.instagram.com/reel/${shortcode}/`,
    `https://www.instagram.com/p/${shortcode}/`,
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`
  ];

  for (const targetUrl of urls) {
    console.log("Fetching local URL:", targetUrl);
    try {
      const { statusCode, body } = await fetchUrl(targetUrl);
      console.log("Status:", statusCode, "Body length:", body.length);

      // Search for og:video
      const ogVideo = body.match(/<meta property="og:video" content="([^"]+)"/i) ||
                      body.match(/<meta property="og:video:secure_url" content="([^"]+)"/i);

      let videoUrl = ogVideo ? ogVideo[1].replace(/&amp;/g, '&') : null;

      // Search for video_url in JSON script blocks
      if (!videoUrl) {
        const videoUrlMatch = body.match(/"video_url":\s*"([^"]+)"/);
        if (videoUrlMatch) {
          videoUrl = videoUrlMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
        }
      }

      // Search for caption
      const captionMatch = body.match(/"caption":\s*"([^"]+)"/) || body.match(/<meta property="og:title" content="([^"]+)"/i);
      const caption = captionMatch ? captionMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : null;

      // Search for username
      const userMatch = body.match(/"username":\s*"([^"]+)"/) || body.match(/@([a-zA-Z0-9._]+)/);
      const username = userMatch ? userMatch[1] : null;

      if (videoUrl) {
        console.log("SUCCESS! Extracted direct videoUrl locally:", videoUrl.slice(0, 80) + "...");
        return { videoUrl, caption, username, method: 'local_html' };
      }
    } catch (e) {
      console.warn("Failed fetching", targetUrl, e.message);
    }
  }

  return null;
}

// Local Strategy 2: Local yt-dlp binary with custom headers
async function localYtDlpScraper(shortcode) {
  console.log("\n[LOCAL YT-DLP] Running local bin/yt-dlp...");
  const targetUrl = `https://www.instagram.com/reel/${shortcode}/`;

  try {
    const { stdout } = await execFilePromise(
      path.join(process.cwd(), 'bin', 'yt-dlp'),
      [
        '-J',
        '--no-check-certificates',
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        targetUrl
      ],
      { timeout: 20000 }
    );

    const json = JSON.parse(stdout);
    if (json.url) {
      console.log("SUCCESS! yt-dlp extracted direct stream URL:", json.url.slice(0, 80) + "...");
      return {
        videoUrl: json.url,
        caption: json.description || json.title,
        username: json.uploader || json.uploader_id,
        method: 'local_ytdlp'
      };
    }
  } catch (err) {
    console.warn("yt-dlp local failed:", err.message);
  }

  return null;
}

async function testAllLocal() {
  const shortcode = 'DbA9_ufslZ3';

  let res = await localHtmlScraper(shortcode);
  if (!res) {
    res = await localYtDlpScraper(shortcode);
  }

  console.log("\n--- FINAL LOCAL EXTRACTION RESULT ---");
  console.log(res);
}

testAllLocal();
