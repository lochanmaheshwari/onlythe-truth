This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Mobile App (Capacitor / iOS)

The iOS app is the same Next.js UI wrapped in a Capacitor WebView. On phones the site renders a native-style shell: fixed masthead, bottom tab bar (Verify / News / Trending / Login), full-screen menu with every section, and phone-tuned layouts for the scanner, trending cards, scan dossiers, the newspaper feed, and article pages.

### Building the app bundle

```bash
npm run build:mobile   # static export (out/) + copies it into ios/
npx cap open ios       # then build/run from Xcode
```

`build:mobile` temporarily stashes `app/api` (server routes can't be statically exported), builds with `BUILD_TARGET=mobile` (`output: 'export'`, `trailingSlash`), restores the routes, and runs `npx cap copy ios`.

### Backend URL inside the app

The WebView has no server, so the scanner posts `/api/analyze` to a hosted backend. Set it at build time:

```bash
NEXT_PUBLIC_API_BASE=https://your-deployment.example npm run build:mobile
```

Without it, the app falls back to the dev machine's LAN address in `lib/config.ts` (fine for local testing, wrong for release builds — set the env var). Trending scans and auth talk to Supabase directly from the device and need no backend.

The regular web deployment is unaffected: `npm run build` keeps `/api/analyze` as a server route.

## Newsfeed Image Fetching & PIB Integration
We have integrated a retro newspaper Newsfeed. Images are sourced automatically from Wikimedia Commons or can be set manually (e.g. from PIB).

### Auto-fetching images:
To fetch images automatically from Wikimedia Commons based on the `searchQuery` or `headline` in the section JSON files, run:
```bash
node scripts/fetch-images.mjs
```

### Manual PIB Image Integration:
Since PIB has no public API, you can manually grab the image URL of same-day government event photos from [pib.gov.in](https://pib.gov.in) and paste them directly into the `imageUrl` field of any article in `data/indian-politics.json` (or other sections).
The `fetch-images.mjs` script will **always preserve** manually entered `imageUrl` values and skip auto-fetching for those articles.

