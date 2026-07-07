'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lora, Playfair_Display } from 'next/font/google';

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

type Article = {
  id: string; section: string;
  headline: string; subhead: string; byline: string;
  about: string[]; left: string[]; right: string[]; reality: string[];
  imageUrl: string; imageCredit: string;
  rank: number; isLead: boolean;
};

import indianPoliticsRaw from '@/data/indian-politics.json';
import worldNewsRaw from '@/data/world-news.json';
import financialNewsRaw from '@/data/financial-news.json';
import sportsRaw from '@/data/sports.json';
import entertainmentRaw from '@/data/entertainment.json';

const allData: Record<string, Article[]> = {
  'indian-politics': indianPoliticsRaw as Article[],
  'world-news': worldNewsRaw as Article[],
  'financial-news': financialNewsRaw as Article[],
  'sports': sportsRaw as Article[],
  'entertainment': entertainmentRaw as Article[],
};

const sectionLabels: Record<string, string> = {
  'indian-politics': 'Indian Politics',
  'world-news': 'World News',
  'financial-news': 'Financial News',
  'sports': 'Sports',
  'entertainment': 'Entertainment',
};

interface ArticleReaderClientProps {
  section: string;
  id: string;
}

function shortenText(text: string, maxLen = 160) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trimEnd()}…`;
}

export default function ArticleReaderClient({ section, id }: ArticleReaderClientProps) {
  const articles = allData[section] ?? [];
  const article = articles.find((a) => a.id === id);
  // "What Happened" and the "Verdict" are the payoff of the page — readable
  // without a tap. The two framing sections stay collapsed to keep the page short.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ about: true, reality: true });
  const [imageFailed, setImageFailed] = useState(false);

  if (!article) {
    return (
      <div className={`${lora.variable} ${playfair.variable}`} style={{
        background: '#f4ede3', minHeight: '100vh', color: '#1c1710',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          background: '#fbf6ec', border: '2px solid #111111', borderRadius: 4,
          padding: '28px 24px', textAlign: 'center', maxWidth: 420,
          fontFamily: 'var(--font-playfair), Georgia, serif',
          boxShadow: '5px 5px 0 rgba(17, 17, 17, 0.9)',
        }}>
          <h2 style={{ fontSize: '1.55rem', margin: '0 0 0.75rem' }}>Story not found</h2>
          <p style={{
            opacity: 0.75, margin: '0 0 1.25rem', fontSize: '1rem', lineHeight: 1.6,
            fontFamily: 'var(--font-lora), Georgia, serif',
          }}>
            This article could not be located.
          </p>
          <Link href="/?focus=news" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 44, padding: '10px 20px', border: '2px solid #111111', borderRadius: 2,
            background: '#111111', color: '#f4ede3', textDecoration: 'none',
            fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            ← Back to the feed
          </Link>
        </div>
      </div>
    );
  }

  const sections = [
    { key: 'about', title: 'What Happened', subtitle: 'The core story in plain language', items: article.about ?? [] },
    { key: 'left', title: 'Left View', subtitle: 'How opposition-leaning outlets frame it', items: article.left ?? [] },
    { key: 'right', title: 'Right View', subtitle: 'How government-friendly outlets frame it', items: article.right ?? [] },
    { key: 'reality', title: 'Verdict', subtitle: 'The clearest reading of the evidence', items: article.reality ?? [] },
  ];

  const toggleSection = (key: string) => {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  };

  const showImage = Boolean(article.imageUrl) && !imageFailed;

  return (
    <div className={`${lora.variable} ${playfair.variable}`}>
      {/* Plain <style> (not styled-jsx): there is no styled-jsx SSR registry in
          app/layout.tsx, so jsx styles would only appear after hydration and the
          statically exported page would first paint unstyled in the Capacitor
          WebView. A plain tag is prerendered into the HTML, and React still
          removes it when the reader unmounts. */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Route-scoped: removed when the reader unmounts. Keep every selector
           under .reader-* so we never fight app/globals.css. */
        body {
          background: #f4ede3;
        }

        .reader-app {
          min-height: 100vh;
          min-height: 100dvh;
          background: #f4ede3;
          color: #1c1710;
          font-family: var(--font-lora), Georgia, 'Times New Roman', serif;
          overflow-x: clip; /* belt-and-braces against sideways scroll; clip (not hidden) keeps position:sticky working */
          -webkit-tap-highlight-color: transparent;
          padding-bottom: calc(28px + env(safe-area-inset-bottom));
        }
        .reader-app a {
          color: inherit;
        }
        .reader-app button {
          font: inherit;
        }
        .reader-app :is(a, button):focus-visible {
          outline: 3px solid #111111;
          outline-offset: 2px;
        }
        .reader-shell {
          max-width: 480px;
          margin: 0 auto;
        }

        /* Sticky masthead. Safe-area padding lives ON the bar so its cream
           background keeps covering the notch/status-bar once you scroll. */
        .reader-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding-top: calc(8px + env(safe-area-inset-top));
          padding-bottom: 8px;
          padding-left: max(14px, env(safe-area-inset-left));
          padding-right: max(14px, env(safe-area-inset-right));
          background: rgba(244, 237, 227, 0.96);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 2px solid #111111;
        }
        .reader-back {
          flex: 0 0 44px;
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #111111;
          border-radius: 4px;
          background: #fbf6ec;
          color: #111111;
          font-size: 1.2rem;
          line-height: 1;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 2px 2px 0 rgba(17, 17, 17, 0.85);
        }
        .reader-back:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 rgba(17, 17, 17, 0.85);
        }
        .reader-topbar-spacer {
          flex: 0 0 44px;
          width: 44px;
        }
        .reader-topbar-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 2px;
          margin: 0 4px;
          min-width: 0;
        }
        .reader-topbar-kicker {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #111111;
          white-space: nowrap;
        }
        .reader-topbar-section {
          font-size: 0.78rem;
          font-style: italic;
          color: #6f6455;
        }

        .reader-content {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding-top: 18px;
          padding-bottom: 8px;
          padding-left: max(16px, env(safe-area-inset-left));
          padding-right: max(16px, env(safe-area-inset-right));
        }

        .reader-hero {
          padding: 2px 2px 0;
        }
        .reader-pill {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border: 1.5px solid #111111;
          border-radius: 2px;
          background: #111111;
          color: #f4ede3;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .reader-headline {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: clamp(1.65rem, 7vw, 2.25rem);
          line-height: 1.15;
          letter-spacing: -0.01em;
          margin: 12px 0 10px;
          color: #111111;
          text-wrap: balance;
          overflow-wrap: break-word;
        }
        .reader-summary {
          font-size: 1.1rem;
          font-style: italic;
          line-height: 1.6;
          color: #4a4238;
          margin: 0 0 14px;
          max-width: 36em;
          overflow-wrap: break-word;
        }
        .reader-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid rgba(17, 17, 17, 0.25);
          font-size: 0.75rem;
          font-weight: 600;
          color: #6f6455;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .reader-media {
          margin: 0;
          border: 2px solid #111111;
          border-radius: 2px;
          background: #fbf6ec;
          box-shadow: 4px 4px 0 rgba(17, 17, 17, 0.9);
          overflow: hidden;
        }
        .reader-media img {
          width: 100%;
          max-width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          display: block;
        }
        .reader-media figcaption {
          padding: 7px 12px;
          border-top: 1px solid rgba(17, 17, 17, 0.2);
          font-size: 0.72rem;
          font-style: italic;
          line-height: 1.45;
          color: #6f6455;
          overflow-wrap: break-word;
        }

        .reader-card {
          background: #fbf6ec;
          border: 2px solid #111111;
          border-radius: 2px;
          padding: 16px;
          box-shadow: 4px 4px 0 rgba(17, 17, 17, 0.9);
        }
        .reader-card-eyebrow {
          margin: 0 0 4px;
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6f6455;
        }
        .reader-card-title {
          margin: 0 0 10px;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.2;
          color: #111111;
        }
        /* Whole heading row is the accordion trigger — comfortably >44px tall. */
        .reader-card-toggle {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-height: 44px;
          padding: 0;
          border: 0;
          background: none;
          color: #111111;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
        }
        .reader-card-chip {
          flex: none;
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border: 1.5px solid #111111;
          border-radius: 999px;
          background: #f4ede3;
          color: #111111;
          font-family: var(--font-lora), Georgia, serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .reader-card-preview,
        .reader-card-body p {
          margin: 0;
          font-size: 1.0625rem; /* 17px — phone-news-app body size */
          line-height: 1.7;
          color: #2b251d;
          overflow-wrap: break-word;
        }
        .reader-card-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .reader-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding-top: 6px;
        }
        .reader-endmark {
          font-size: 0.7rem;
          letter-spacing: 0.5em;
          text-indent: 0.5em; /* re-centres letter-spaced glyphs */
          color: #111111;
        }
        .reader-footer-back {
          display: flex;
          width: 100%;
          min-height: 50px;
          align-items: center;
          justify-content: center;
          border: 2px solid #111111;
          border-radius: 2px;
          background: #111111;
          color: #f4ede3;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 4px 4px 0 rgba(17, 17, 17, 0.35);
        }
        .reader-footer-back:active {
          transform: translate(1px, 1px);
          box-shadow: 2px 2px 0 rgba(17, 17, 17, 0.35);
        }

        @media (min-width: 768px) {
          .reader-shell {
            max-width: 560px;
          }
          .reader-content {
            padding-top: 24px;
            padding-left: max(24px, env(safe-area-inset-left));
            padding-right: max(24px, env(safe-area-inset-right));
          }
        }
      ` }} />

      <div className="reader-app">
        <div className="reader-shell">
          <header className="reader-topbar">
            <Link href="/?focus=news" className="reader-back" aria-label="Back to the news feed">
              ←
            </Link>
            <div className="reader-topbar-center">
              <span className="reader-topbar-kicker">Only the Truth</span>
              <span className="reader-topbar-section">{sectionLabels[section] || section}</span>
            </div>
            <span className="reader-topbar-spacer" aria-hidden="true" />
          </header>

          <main className="reader-content">
            <section className="reader-hero">
              <span className="reader-pill">{sectionLabels[section] || section}</span>
              <h1 className="reader-headline">{article.headline}</h1>
              <p className="reader-summary">{article.subhead || shortenText(article.about?.[0] || '', 220)}</p>
              <div className="reader-meta">
                <span>{article.byline}</span>
              </div>
            </section>

            {showImage && (
              <figure className="reader-media">
                <img
                  src={article.imageUrl}
                  alt={article.headline}
                  decoding="async"
                  onError={() => setImageFailed(true)}
                />
                {article.imageCredit && <figcaption>{article.imageCredit}</figcaption>}
              </figure>
            )}

            {sections.map((sectionItem) => {
              const items = (sectionItem.items || []).filter(Boolean);
              if (!items.length) return null;
              const collapsible = items.join(' ').length > 240;
              const isOpen = !collapsible || Boolean(expanded[sectionItem.key]);
              return (
                <article className="reader-card" key={sectionItem.key}>
                  <p className="reader-card-eyebrow">{sectionItem.subtitle}</p>
                  <h2 className="reader-card-title">
                    {collapsible ? (
                      <button
                        className="reader-card-toggle"
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleSection(sectionItem.key)}
                      >
                        <span>{sectionItem.title}</span>
                        <span className="reader-card-chip">{isOpen ? 'Show less' : 'Read more'}</span>
                      </button>
                    ) : (
                      sectionItem.title
                    )}
                  </h2>
                  {isOpen ? (
                    <div className="reader-card-body">
                      {items.map((item, index) => (
                        <p key={`${sectionItem.key}-${index}`}>{item}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="reader-card-preview">{shortenText(items[0] || '', 220)}</p>
                  )}
                </article>
              );
            })}

            <footer className="reader-footer">
              <div className="reader-endmark" aria-hidden="true">
                ◆ ◆ ◆
              </div>
              <Link href="/?focus=news" className="reader-footer-back">
                ← Back to all stories
              </Link>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
