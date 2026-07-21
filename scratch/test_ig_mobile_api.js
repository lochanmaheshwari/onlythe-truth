const https = require('https');

function fetchIgMobileApi(shortcode) {
  return new Promise((resolve) => {
    const url = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'X-IG-App-ID': '936619743392459',
        'Accept': '*/*'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', err => resolve({ err }));
  });
}

async function test() {
  const shortcode = 'DbA9_ufslZ3';
  const res = await fetchIgMobileApi(shortcode);
  console.log("Mobile API status:", res.status);
  if (res.json) {
    const items = res.json.items || [res.json.graphql?.shortcode_media];
    if (items && items[0]) {
      console.log("Item found! video_versions:", items[0].video_versions ? items[0].video_versions.length : 0);
      if (items[0].video_versions && items[0].video_versions[0]) {
        console.log("Direct mp4 URL:", items[0].video_versions[0].url);
      }
    }
  }
}

test();
