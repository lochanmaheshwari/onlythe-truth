const https = require('https');

function fetchIGDocId(shortcode, docId) {
  return new Promise((resolve, reject) => {
    const variables = JSON.stringify({ shortcode });
    const url = `https://www.instagram.com/graphql/query/?doc_id=${docId}&variables=${encodeURIComponent(variables)}`;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': '*/*',
        'Referer': `https://www.instagram.com/reel/${shortcode}/`
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function testReels() {
  const reels = ['DbA9_ufslZ3', 'DbBuctosdQX', 'DYdzbLssGh8'];
  const docIds = ['10015901848480474', '8845758582119845', '17888483320083067'];

  for (const shortcode of reels) {
    console.log(`\n=== Testing Reel: ${shortcode} ===`);
    let found = false;

    for (const docId of docIds) {
      const res = await fetchIGDocId(shortcode, docId);
      if (res.data && res.data.data) {
        const media = res.data.data?.xdt_shortcode_media || res.data.data?.shortcode_media;
        if (media && media.video_url) {
          console.log(`[SUCCESS] Extracted via doc_id ${docId}:`);
          console.log(`Video/Audio URL: ${media.video_url.slice(0, 90)}...`);
          console.log(`Owner: ${media.owner?.username}`);
          console.log(`Caption: ${media.edge_media_to_caption?.edges[0]?.node?.text || media.caption?.text || 'None'}`);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      console.log(`[FAIL] Shortcode ${shortcode} did not return via tested docIds.`);
    }
  }
}

testReels();
