#!/usr/bin/env node
/**
 * Builds the static bundle for the Capacitor mobile app.
 *
 * Static export can't include server API routes (POST /api/analyze runs
 * yt-dlp/Whisper/DeepSeek server-side), so they are stashed for the duration
 * of the build. Inside the app the scanner calls the hosted backend instead
 * (see lib/config.ts / NEXT_PUBLIC_API_BASE).
 *
 * Usage: npm run build:mobile   (then: npx cap sync ios)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiDir = path.join(root, 'app', 'api');
const stashDir = path.join(root, '.api-stash');

const run = (cmd, env = {}) =>
  execSync(cmd, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });

const hasApi = fs.existsSync(apiDir);
if (fs.existsSync(stashDir)) {
  console.error('Found leftover .api-stash — restoring it before building.');
  if (hasApi) fs.rmSync(stashDir, { recursive: true, force: true });
  else fs.renameSync(stashDir, apiDir);
}

if (fs.existsSync(apiDir)) fs.renameSync(apiDir, stashDir);

try {
  run('npx next build', { BUILD_TARGET: 'mobile' });
} finally {
  if (fs.existsSync(stashDir)) fs.renameSync(stashDir, apiDir);
}

// Copy the fresh bundle into the native iOS project when Capacitor is available.
try {
  run('npx cap copy ios');
  console.log('\n✔ Static bundle exported to out/ and copied into ios/.');
  console.log('  Open ios/App in Xcode (or run `npx cap open ios`) to build the app.');
} catch {
  console.warn('\n⚠ cap copy failed (platform tooling missing?). The web bundle is still in out/.');
}
