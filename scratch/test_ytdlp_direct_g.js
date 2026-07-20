const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const execFilePromise = promisify(execFile);

async function testYtDlpDirectUrl(shortcode) {
  const targetUrl = `https://www.instagram.com/reel/${shortcode}/`;
  console.log("Testing yt-dlp -g on:", targetUrl);

  try {
    const { stdout } = await execFilePromise(
      path.join(process.cwd(), 'bin', 'yt-dlp'),
      [
        '-g',
        '--no-check-certificates',
        '--user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        targetUrl
      ],
      { timeout: 15000 }
    );

    console.log("yt-dlp -g stdout:", stdout.trim());
    if (stdout && stdout.startsWith('http')) {
      console.log("SUCCESS! Extracted direct stream URL via yt-dlp -g!");
      return stdout.trim().split('\n')[0];
    }
  } catch (err) {
    console.error("yt-dlp -g failed:", err.message);
  }

  return null;
}

testYtDlpDirectUrl('DbA9_ufslZ3');
