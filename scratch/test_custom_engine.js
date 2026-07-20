const fs = require('fs');
const { extractInstagramMedia } = require('../lib/customInstagramScraper');

let APIFY_TOKEN = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/APIFY_TOKEN=(.*)/);
  if (match && match[1]) APIFY_TOKEN = match[1].trim();
} catch (e) {}

async function test() {
  console.log("Testing Custom Instagram Extractor Engine...");
  try {
    const result = await extractInstagramMedia('https://www.instagram.com/reel/DbA9_ufslZ3/', APIFY_TOKEN);
    console.log("\n--- CUSTOM EXTRACTION ENGINE RESULT ---");
    console.log("Shortcode:", result.shortcode);
    console.log("Extracted Via:", result.extractedVia);
    console.log("Media URL:", result.mediaUrl);
    console.log("Audio URL:", result.audioUrl);
    console.log("Video URL:", result.videoUrl);
    console.log("Owner Username:", result.ownerUsername);
    console.log("Caption:", result.caption);
    console.log("----------------------------------------");
  } catch (e) {
    console.error("Extraction error:", e);
  }
}

test();
