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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!article) {
    return (
      <div className={`${lora.variable} ${playfair.variable}`} style={{
        background: '#f5efe4', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{
          background: '#ffffff', borderRadius: 24,
          padding: '24px', textAlign: 'center', maxWidth: 420,
          fontFamily: 'var(--font-playfair), serif', boxShadow: '0 12px 40px rgba(17,24,39,0.08)',
        }}>
          <h2 style={{ fontSize: '1.55rem', marginBottom: '0.75rem' }}>Story not found</h2>
          <p style={{ opacity: 0.7, marginBottom: '1rem' }}>This article could not be located.</p>
          <Link href="/?focus=news" style={{
            color: '#0f172a', textDecoration: 'none', fontWeight: 700,
            fontSize: '0.9rem',
          }}>
            ← Back to reading list
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

  return (
    <div className={`${lora.variable} ${playfair.variable}`}>
      <style jsx global>{`
        :root {
          color-scheme: light;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #f5efe4;
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
        }
        a { color: inherit; text-decoration: none; }
        button { font: inherit; }

        .reader-app {
          min-height: 100vh;
          background: linear-gradient(180deg, #f9f4eb 0%, #efe6d8 100%);
          padding: max(16px, env(safe-area-inset-top)) 0 calc(24px + env(safe-area-inset-bottom));
        }
        .reader-shell {
          max-width: 480px;
          margin: 0 auto;
          min-height: 100vh;
          padding-bottom: 24px;
        }
        .reader-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px 12px;
          background: rgba(249, 244, 235, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(17, 24, 39, 0.06);
        }
        .reader-back, .reader-menu {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(17, 24, 39, 0.05);
          color: #111827;
          border: 0;
        }
        .reader-topbar-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 2px;
          margin: 0 8px;
        }
        .reader-topbar-kicker {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6b7280;
        }
        .reader-topbar-section {
          font-size: 0.82rem;
          font-weight: 600;
          color: #111827;
        }

        .reader-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px 16px 24px;
        }
        .reader-hero {
          padding: 8px 2px 4px;
        }
        .reader-pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }
        .reader-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: #111827;
          color: #f9f4eb;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .reader-pill.is-muted {
          background: rgba(17, 24, 39, 0.07);
          color: #374151;
        }
        .reader-headline {
          font-family: var(--font-playfair), serif;
          font-size: clamp(1.55rem, 4.8vw, 2rem);
          line-height: 1.12;
          letter-spacing: -0.025em;
          margin: 0 0 10px;
          max-width: 14ch;
        }
        .reader-summary {
          font-size: 1rem;
          line-height: 1.7;
          color: #374151;
          margin: 0 0 10px;
          max-width: 60ch;
        }
        .reader-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .reader-media {
          border-radius: 20px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }
        .reader-media img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          display: block;
        }

        .reader-card {
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(17, 24, 39, 0.06);
          border-radius: 20px;
          padding: 14px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
          backdrop-filter: blur(10px);
        }
        .reader-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }
        .reader-card-eyebrow {
          margin: 0 0 4px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6b7280;
        }
        .reader-card-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
        }
        .reader-card-action {
          border: 0;
          border-radius: 999px;
          padding: 6px 10px;
          background: #f3efe7;
          color: #111827;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .reader-card-preview {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #374151;
        }
        .reader-card-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }
        .reader-card-body p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.65;
          color: #374151;
        }
        .reader-bullets {
          margin: 0;
          padding-left: 1rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #374151;
          font-size: 0.95rem;
          line-height: 1.55;
        }
        .reader-source {
          padding-top: 4px;
          border-top: 1px solid rgba(17, 24, 39, 0.06);
          font-size: 0.9rem;
          color: #374151;
        }

        @media (min-width: 768px) {
          .reader-shell {
            max-width: 560px;
          }
          .reader-content { padding: 20px 20px 32px; }
        }
      `}</style>

      <div className="reader-app">
        <div className="reader-shell">
          <header className="reader-topbar">
            <Link href="/?focus=news" className="reader-back" aria-label="Back">
              ←
            </Link>
            <div className="reader-topbar-center">
              <span className="reader-topbar-kicker">Only the Truth</span>
              <span className="reader-topbar-section">{sectionLabels[section] || section}</span>
            </div>
            <button className="reader-menu" type="button" aria-label="More options">
              ☰
            </button>
          </header>

          <main className="reader-content">
            <section className="reader-hero">
              <div className="reader-pill-row">
                <span className="reader-pill">Mobile brief</span>
                <span className="reader-pill is-muted">{sectionLabels[section] || section}</span>
              </div>
              <h1 className="reader-headline">{article.headline}</h1>
              <p className="reader-summary">{article.subhead || shortenText(article.about?.[0] || '', 220)}</p>
              <div className="reader-meta">
                <span>{article.byline}</span>
                <span>•</span>
                <span>{article.imageCredit || 'Source notes'}</span>
              </div>
            </section>

            {article.imageUrl && (
              <div className="reader-media">
                <img src={article.imageUrl} alt={article.headline} />
              </div>
            )}

            {sections.map((sectionItem) => {
              const items = (sectionItem.items || []).filter(Boolean);
              if (!items.length) return null;
              const isOpen = Boolean(expanded[sectionItem.key]);
              return (
                <article className="reader-card" key={sectionItem.key}>
                  <div className="reader-card-header">
                    <div>
                      <p className="reader-card-eyebrow">{sectionItem.subtitle}</p>
                      <h2 className="reader-card-title">{sectionItem.title}</h2>
                    </div>
                    <button className="reader-card-action" type="button" onClick={() => toggleSection(sectionItem.key)}>
                      {isOpen ? 'Hide' : 'Read more'}
                    </button>
                  </div>
                  <p className="reader-card-preview">
                    {isOpen ? shortenText(items.join(' '), 260) : shortenText(items[0] || '', 180)}
                  </p>
                  {isOpen && (
                    <div className="reader-card-body">
                      {items.map((item, index) => (
                        <p key={`${sectionItem.key}-${index}`}>{item}</p>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}

            <article className="reader-card">
              <div className="reader-card-header">
                <div>
                  <p className="reader-card-eyebrow">Evidence</p>
                  <h2 className="reader-card-title">Quick reference points</h2>
                </div>
              </div>
              <ul className="reader-bullets">
                {sections.flatMap((sectionItem) =>
                  (sectionItem.items || []).slice(0, 2).map((item, index) => (
                    <li key={`${sectionItem.key}-bullet-${index}`}>{shortenText(item, 140)}</li>
                  ))
                )}
              </ul>
            </article>

            <article className="reader-card">
              <div className="reader-card-header">
                <div>
                  <p className="reader-card-eyebrow">Sources</p>
                  <h2 className="reader-card-title">Reference points</h2>
                </div>
              </div>
              <div className="reader-source">{article.byline}</div>
              <div className="reader-source">{article.imageCredit || 'Source notes available in the archive'}</div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
