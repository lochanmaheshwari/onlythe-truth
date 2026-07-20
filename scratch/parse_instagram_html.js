const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function inspectHtml() {
  const html = await fetchHtml('https://www.instagram.com/reel/DbA9_ufslZ3/');
  console.log("HTML length:", html.length);

  // Search for any video urls (.mp4)
  const mp4Matches = [...html.matchAll(/https:\\\/\\\/[^\s"']+\.mp4[^\s"']*/g)].map(m => m[0].replace(/\\\/|\\/g, '/').replace(/\\u0026/g, '&'));
  console.log("Found mp4 matches count:", mp4Matches.length);
  if (mp4Matches.length > 0) {
    console.log("First mp4 match:", mp4Matches[0]);
  }

  // Search for cdninstagram URLs
  const cdnMatches = [...html.matchAll(/https:\\\/\\\/scontent[^\s"']+/g)].map(m => m[0].replace(/\\\/|\\/g, '/').replace(/\\u0026/g, '&'));
  console.log("Found CDN matches count:", cdnMatches.length);

  // Search for video_url or audio_url keys in script tags
  const videoKeys = [...html.matchAll(/"video_url"\s*:\s*"([^"]+)"/g)].map(m => m[1].replace(/\\u0026/g, '&').replace(/\\/g, ''));
  console.log("Found video_url keys count:", videoKeys.length);
  if (videoKeys.length > 0) {
    console.log("First video_url key:", videoKeys[0]);
  }

  // Search for owner / username
  const usernameMatch = html.match(/"owner"\s*:\s*\{[^}]*"username"\s*:\s*"([^"]+)"/i) || html.match(/"username"\s*:\s*"([^"]+)"/i);
  console.log("Username match:", usernameMatch ? usernameMatch[1] : 'null');
}

inspectHtml();
