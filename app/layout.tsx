import type { Metadata, Viewport } from "next";
import "./globals.css";
import StyledJsxRegistry from "./registry";

export const metadata: Metadata = {
  title: "Only the Truth | Fact-Check Any Video from Instagram, YouTube & TikTok",
  description: "Paste any short-form video link from Instagram, YouTube, or TikTok. We transcribe it, fact-check claims across hundreds of news sources, and give you only the truth.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f4ede3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <StyledJsxRegistry>{children}</StyledJsxRegistry>
      </body>
    </html>
  );
}
