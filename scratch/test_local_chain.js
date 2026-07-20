const https = require('https');

async function tryInDown(shortcode) {
  console.log("\nTrying InDown local extractor...");
  try {
    const url = `https://www.instagram.com/reel/${shortcode}/`;
    const res = await fetch("https://indown.io/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Referer": "https://indown.io/"
      },
      body: `link=${encodeURIComponent(url)}&referer=https%3A%2F%2Findown.io%2F`
    });

    const html = await res.text();
    console.log("InDown status:", res.status, "HTML length:", html.length);
    const videoMatch = html.match(/href="([^"]+\.mp4[^"]*)"/i) || html.match(/src="([^"]+\.mp4[^"]*)"/i);
    if (videoMatch) {
      console.log("INDOUN SUCCESS! Direct mp4 URL:", videoMatch[1]);
      return videoMatch[1];
    }
  } catch (e) {
    console.warn("InDown failed:", e.message);
  }
  return null;
}

async function tryInstaVideoSave(shortcode) {
  console.log("\nTrying InstaVideoSave local extractor...");
  try {
    const url = `https://www.instagram.com/reel/${shortcode}/`;
    const res = await fetch(`https://instavideosave.net/api/convert?url=${encodeURIComponent(url)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json"
      }
    });

    const data = await res.json();
    console.log("InstaVideoSave status:", res.status, "data:", data);
    if (data.url || data.video_url || (data.url && data.url[0])) {
      const media = data.video_url || data.url || (Array.isArray(data.url) ? data.url[0].url : null);
      console.log("INSTAVIDEOSAVE SUCCESS! Direct media URL:", media);
      return media;
    }
  } catch (e) {
    console.warn("InstaVideoSave failed:", e.message);
  }
  return null;
}

async function trySnapInsta(shortcode) {
  console.log("\nTrying SnapInsta direct POST...");
  try {
    const reelUrl = `https://www.instagram.com/reel/${shortcode}/`;
    const params = new URLSearchParams();
    params.append('url', reelUrl);
    params.append('action', 'post');

    const res = await fetch("https://snapinsta.app/action2.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Referer": "https://snapinsta.app/"
      },
      body: params.toString()
    });

    const html = await res.text();
    console.log("SnapInsta status:", res.status, "length:", html.length);
    const downloadMatch = html.match(/href="([^"]+)"/g);
    if (downloadMatch) {
      console.log("SNAPINSTA SUCCESS! Matches:", downloadMatch.slice(0, 3));
    }
  } catch (e) {
    console.warn("SnapInsta failed:", e.message);
  }
}

async function testAll() {
  const shortcode = 'DbA9_ufslZ3';
  await tryInDown(shortcode);
  await tryInstaVideoSave(shortcode);
  await trySnapInsta(shortcode);
}

testAll();
