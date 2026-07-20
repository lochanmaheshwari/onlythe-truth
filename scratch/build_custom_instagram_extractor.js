async function testSaveInsta(reelUrl) {
  console.log("\n--- Testing SaveInsta direct API ---");
  try {
    const params = new URLSearchParams();
    params.append('q', reelUrl);
    params.append('t', 'media');
    params.append('lang', 'en');

    const res = await fetch("https://saveinsta.app/api/ajaxSearch", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://saveinsta.app/en"
      },
      body: params.toString()
    });

    const data = await res.json();
    console.log("SaveInsta status:", res.status, "keys:", Object.keys(data));
    if (data.data) {
      // Parse video_url or href from response data HTML
      const html = data.data;
      const downloadMatches = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
      const videoLinks = downloadMatches.filter(l => l.includes('download') || l.includes('cdn') || l.includes('instagram') || l.includes('.mp4'));
      console.log("SUCCESS WITH SAVEINSTA DIRECT EXTRACTOR!");
      console.log("Extracted video/audio download link:", downloadMatches[0]);
      return downloadMatches[0];
    }
  } catch (e) {
    console.error("SaveInsta failed:", e.message);
  }
}

async function testPubler(reelUrl) {
  console.log("\n--- Testing Publer direct API ---");
  try {
    const res = await fetch("https://publer.io/api/v1/media/downloader", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      },
      body: JSON.stringify({
        url: reelUrl,
        iphone: false
      })
    });

    const data = await res.json();
    console.log("Publer status:", res.status, "data:", data);
  } catch (e) {
    console.error("Publer failed:", e.message);
  }
}

async function run() {
  const testUrl = 'https://www.instagram.com/reel/DbA9_ufslZ3/';
  await testSaveInsta(testUrl);
  await testPubler(testUrl);
}

run();
