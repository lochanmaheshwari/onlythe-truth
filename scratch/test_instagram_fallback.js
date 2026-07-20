const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFilePromise = promisify(execFile);

async function testYtDlpInstagram(url) {
  console.log("Testing yt-dlp on Instagram URL:", url);
  try {
    const { stdout } = await execFilePromise(
      path.join(process.cwd(), 'bin', 'yt-dlp'),
      [
        '-J',
        '--js-runtimes', 'node',
        url
      ],
      { timeout: 15000 }
    );
    const json = JSON.parse(stdout);
    console.log("yt-dlp Instagram title:", json.title || json.description);
    console.log("yt-dlp Instagram webpage_url:", json.webpage_url);
    console.log("yt-dlp extracted successfully!");
  } catch (err) {
    console.error("yt-dlp Instagram failed:", err.message);
  }
}

testYtDlpInstagram('https://www.instagram.com/reel/DbA9_ufslZ3/');
