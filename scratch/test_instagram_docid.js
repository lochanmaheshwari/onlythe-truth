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

async function testAllDocIds() {
  const shortcode = 'DbA9_ufslZ3';
  const docIds = [
    '8845758582119845',
    '7398188173617300',
    '10015901848480474',
    '25531498899829322',
    '17888483320083067'
  ];

  for (const docId of docIds) {
    console.log(`Testing doc_id: ${docId}...`);
    const res = await fetchIGDocId(shortcode, docId);
    console.log(`doc_id ${docId} status:`, res.status);
    if (res.data) {
      const media = res.data.data?.xdt_shortcode_media || res.data.data?.shortcode_media;
      if (media) {
        console.log("SUCCESS WITH DOC_ID!", docId);
        console.log("video_url:", media.video_url);
        console.log("audio_src:", media.audio_src || media.clips_metadata?.audio_type);
        console.log("owner:", media.owner?.username);
        return media.video_url;
      }
    }
  }
}

testAllDocIds();
