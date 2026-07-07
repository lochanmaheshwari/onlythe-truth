'use client';

import React, { useState, useRef, forwardRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lora, Playfair_Display } from 'next/font/google';
import HTMLFlipBook from 'react-pageflip';

/* ─── Google Fonts ─── */
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

/* ─── Types ─── */
type Article = {
  id: string; section: string;
  headline: string; subhead: string; byline: string;
  about: string[]; left: string[]; right: string[]; reality: string[];
  imageUrl: string; imageCredit: string;
  rank: number; isLead: boolean;
};

/* ─── Data imports ─── */
import indianPoliticsRaw from '@/data/indian-politics.json';
import worldNewsRaw from '@/data/world-news.json';
import financialNewsRaw from '@/data/financial-news.json';
import sportsRaw from '@/data/sports.json';
import entertainmentRaw from '@/data/entertainment.json';

const indianPolitics = indianPoliticsRaw as Article[];
const worldNews = worldNewsRaw as Article[];
const financialNews = financialNewsRaw as Article[];
const sports = sportsRaw as Article[];
const entertainment = entertainmentRaw as Article[];

type SectionKey = 'indian-politics' | 'world-news' | 'financial-news' | 'sports' | 'entertainment';

const sectionMeta: Record<SectionKey, { label: string; masthead: string; data: Article[] }> = {
  'indian-politics': { label: 'Indian Politics', masthead: 'INDIAN POLITICS', data: indianPolitics },
  'world-news':      { label: 'World News',      masthead: 'WORLD NEWS',      data: worldNews },
  'financial-news':  { label: 'Financial News',  masthead: 'FINANCIAL NEWS',  data: financialNews },
  'sports':          { label: 'Sports',           masthead: 'SPORTS',          data: sports },
  'entertainment':   { label: 'Entertainment',    masthead: 'ENTERTAINMENT',   data: entertainment },
};

/* ─── Page wrapper (forwardRef required by react-pageflip) ─── */
const FlipPage = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => <div ref={ref} {...props} />
);
FlipPage.displayName = 'FlipPage';

/* ─── Mobile card image with graceful fallback ───
   Renders the story image (object-fit: cover, fixed aspect box) and, when the
   imageUrl is empty or the request errors, swaps in a retro printer's-ornament
   placeholder instead of leaking raw alt text into the layout. */
function CardImage({
  story,
  sectionLabel,
  variant,
}: {
  story: Article;
  sectionLabel: string;
  variant: 'lead' | 'thumb';
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(story.imageUrl) && !failed;

  return (
    <div className={`np-card-img np-card-img--${variant}`}>
      {showImage ? (
        <>
          <img
            src={story.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
          {variant === 'lead' && story.imageCredit ? (
            <span className="credit">{story.imageCredit}</span>
          ) : null}
        </>
      ) : (
        <div className="np-card-placeholder" aria-hidden="true">
          <span className="glyph">❦</span>
          {variant === 'lead' && <span className="label">{sectionLabel}</span>}
        </div>
      )}
    </div>
  );
}

/* ─── Reader-modal image with the same graceful fallback ─── */
function ReaderImage({ story }: { story: Article }) {
  const [failed, setFailed] = useState(false);
  if (!story.imageUrl || failed) return null;
  return (
    <div style={{
      position: 'relative', marginBottom: '1.75rem',
      border: '1px solid #1A1A1A', overflow: 'hidden',
    }}>
      <img
        src={story.imageUrl}
        alt=""
        onError={() => setFailed(true)}
        style={{
          width: '100%', maxHeight: '420px',
          objectFit: 'cover', display: 'block',
          filter: 'grayscale(100%) contrast(1.1) brightness(.95)',
          mixBlendMode: 'multiply',
        }}
      />
      {story.imageCredit ? (
        <div style={{
          fontSize: '.6rem', opacity: .7,
          textAlign: 'right', padding: '.2rem .4rem',
          borderTop: '1px dashed rgba(0,0,0,.1)',
        }}>{story.imageCredit}</div>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function NewspaperFeed() {
  const router = useRouter();
  const bookRef = useRef<any>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('indian-politics');
  const [mounted, setMounted] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const [clickedArticles, setClickedArticles] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const isMobileUA = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isLowWidth = typeof window !== 'undefined' && window.innerWidth <= 991;
      setIsMobile(isMobileUA || isLowWidth);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const loaded = localStorage.getItem('clickedArticles');
    if (loaded) {
      try {
        setClickedArticles(JSON.parse(loaded));
      } catch (e) {
        console.error(e);
      }
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const markArticleClicked = (id: string) => {
    if (clickedArticles.includes(id)) return;
    const updated = [...clickedArticles, id];
    setClickedArticles(updated);
    localStorage.setItem('clickedArticles', JSON.stringify(updated));
  };

  /* Keyboard arrow-key support */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') bookRef.current?.pageFlip()?.flipNext();
      if (e.key === 'ArrowLeft')  bookRef.current?.pageFlip()?.flipPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const meta = sectionMeta[activeSection];
  const articles = [...meta.data].sort((a, b) => a.rank - b.rank);

  /* Build pages: 3 stories on left pages, 2 on right pages (5 per spread) */
  const pages: { stories: Article[]; isLeft: boolean; spreadIdx: number; showMasthead: boolean; globalStartIdx: number }[] = [];
  for (let i = 0; i < articles.length; i += 5) {
    const spread = articles.slice(i, i + 5);
    const spreadIdx = Math.floor(i / 5);
    pages.push({ stories: spread.slice(0, 3), isLeft: true,  spreadIdx, showMasthead: i === 0, globalStartIdx: i });
    pages.push({ stories: spread.slice(3, 5), isLeft: false, spreadIdx, showMasthead: false,    globalStartIdx: i + 3 });
  }
  /* react-pageflip needs even page count; pad if necessary */
  if (pages.length % 2 !== 0) {
    pages.push({ stories: [], isLeft: false, spreadIdx: -1, showMasthead: false, globalStartIdx: -1 });
  }

  const getDate = () =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={`${lora.variable} ${playfair.variable} np-canvas`}>
      <style jsx global>{`
        /* ═══ CANVAS (dark charcoal behind pages) ═══ */
        .np-canvas {
          --paper: #F4EFE6;
          --ink: #1A1A1A;
          --brick: #B23A2E;
          --rule: #1A1A1A;
          --canvas: #1C1C1C;
          background: var(--canvas);
          padding: 2rem 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: var(--font-lora), Georgia, serif;
          color: var(--ink);
          position: relative;
        }

        /* ═══ SECTION TABS ═══ */
        .np-tabs {
          display: flex; gap: 1rem; flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .np-tabs button {
          background: transparent; border: 1px solid rgba(255,255,255,.2);
          color: rgba(255,255,255,.7);
          font-family: var(--font-playfair), serif;
          font-weight: 700; font-size: .8rem;
          text-transform: uppercase; letter-spacing: .06em;
          padding: .35rem .9rem; cursor: pointer;
          transition: all .2s;
        }
        .np-tabs button:hover { border-color: rgba(255,255,255,.5); color: #fff; }
        .np-tabs button.on {
          background: var(--brick); border-color: var(--brick);
          color: #fff;
        }

        @media (max-width: 768px) {
          .np-tabs {
            width: 100%;
            flex-wrap: nowrap;
            justify-content: flex-start;
            gap: 0.5rem;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            margin-bottom: 1rem;
            padding-bottom: 0.25rem;
          }
          .np-tabs::-webkit-scrollbar { display: none; }
          .np-tabs button {
            white-space: nowrap;
            padding: 0.55rem 1rem;
            font-size: 0.82rem;
            min-height: 40px;
            border-radius: 3px;
            -webkit-tap-highlight-color: transparent;
          }
        }

        /* ═══ EMPTY EDITION ═══ */
        .np-empty {
          width: 100%;
          max-width: 560px;
          background: var(--paper);
          border: 1.5px solid var(--rule);
          box-shadow: 3px 3px 0 #000;
          padding: 2.5rem 1.5rem;
          margin: 0.5rem auto 1rem;
          text-align: center;
          font-family: var(--font-lora), Georgia, serif;
        }
        .np-empty-glyph {
          display: block;
          font-size: 2rem;
          margin-bottom: 0.6rem;
        }
        .np-empty-title {
          font-family: var(--font-playfair), serif;
          font-weight: 800;
          font-size: 1.25rem;
          margin-bottom: 0.4rem;
        }
        .np-empty-copy {
          font-size: 0.9rem;
          font-style: italic;
          color: #555;
        }

        /* ═══ FLIP BOOK CONTAINER ═══ */
        .np-book-wrap {
          width: 100%; max-width: 1080px;
          display: flex; justify-content: center;
        }
        .np-book-wrap .stf__parent {
          box-shadow: 0 20px 60px rgba(0,0,0,.5) !important;
        }

        /* ═══ PAGE STYLING ═══ */
        /* react-pageflip injects inline display:block; height:Xpx — we must override */
        .np-page {
          background: var(--paper) !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          border: 1px solid rgba(0,0,0,.08) !important;
        }

        /* ═══ MASTHEAD ═══ */
        .np-masthead {
          text-align: center;
          padding: .9rem 1.5rem .6rem;
          border-bottom: 3px double var(--rule);
        }
        .np-mast-brand {
          font-family: var(--font-playfair), serif;
          font-style: italic; font-weight: 600;
          font-size: .95rem; letter-spacing: .04em;
          color: var(--ink); margin-bottom: .05rem;
        }
        .np-mast-title {
          font-family: var(--font-playfair), serif;
          font-weight: 900; font-size: 1.9rem;
          letter-spacing: .18em; text-transform: uppercase;
          line-height: 1; margin: .2rem 0;
        }
        .np-mast-meta {
          display: flex; justify-content: space-between;
          font-size: .62rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: .06em;
          border-top: 1px solid var(--rule);
          padding-top: .3rem; margin-top: .35rem;
        }

        /* ═══ STORY BAND ═══ */
        .np-band {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 200px !important; /* FIXED equal height — absolute equality */
          flex: none !important;
          border-bottom: 1px solid var(--rule);
          cursor: pointer;
          transition: background .2s;
          min-height: 0;
          overflow: hidden;
        }
        .np-band:last-child { border-bottom: none; }
        .np-band:hover { background: rgba(178, 58, 46, .08); }
        .np-band.clicked { background: #e5dec9 !important; }
        .np-band.clicked .np-band-text h3 { color: #8a2a1f !important; }

        /* Image half */
        .np-band-img {
          position: relative;
          overflow: hidden;
          background: var(--paper);
        }
        .np-band-img img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          filter: grayscale(100%) contrast(1.1) brightness(.95);
          mix-blend-mode: multiply;
        }
        .np-band-img .credit {
          position: absolute; bottom: 0; right: 0;
          font-size: .52rem; padding: .15rem .35rem;
          background: rgba(244,239,230,.85);
          color: var(--ink); opacity: .7;
        }

        /* Image placeholder */
        .np-band-placeholder {
          width: 100%; height: 100%;
          border: 1px dashed rgba(26,26,26,.2);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-playfair), serif;
          font-style: italic; font-size: .75rem;
          color: rgba(26,26,26,.3);
        }

        /* Text half */
        .np-band-text {
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 1rem 1.25rem;
          overflow: hidden;
        }
        .np-band-text h3 {
          font-family: var(--font-playfair), serif;
          font-weight: 800; font-size: 1.15rem;
          line-height: 1.15; color: var(--ink);
          margin: 0 0 .4rem;
        }
        .np-band-text .sub {
          font-style: italic; font-size: .82rem;
          line-height: 1.3; color: var(--ink);
          opacity: .85; margin-bottom: .4rem;
        }
        .np-band-text .by {
          font-size: .62rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: .04em;
          color: var(--brick);
        }

        /* ═══ EMPTY PAGE ═══ */
        .np-empty-page {
          display: flex; align-items: center;
          justify-content: center;
          flex: 1; padding: 2rem;
          text-align: center;
        }
        .np-empty-page p {
          font-family: var(--font-playfair), serif;
          font-style: italic; font-size: .9rem;
          opacity: .4;
        }

        /* ═══ NAVIGATION ═══ */
        .np-nav {
          display: flex; align-items: center; gap: 1.25rem;
          margin-top: 1.25rem;
        }
        .np-nav button {
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.2);
          color: rgba(255,255,255,.85);
          font-family: var(--font-playfair), serif;
          font-weight: 700; font-size: .78rem;
          text-transform: uppercase; letter-spacing: .06em;
          padding: .4rem 1rem; cursor: pointer;
          transition: all .2s;
        }
        .np-nav button:hover {
          background: var(--brick); border-color: var(--brick); color: #fff;
        }
        .np-nav button:disabled {
          opacity: .25; cursor: default;
          background: rgba(255,255,255,.05);
        }
        .np-nav .indicator {
          font-family: var(--font-playfair), serif;
          font-weight: 700; font-size: .78rem;
          color: rgba(255,255,255,.6);
          letter-spacing: .06em; text-transform: uppercase;
        }

        .np-hint {
          color: rgba(255,255,255,.3);
          font-size: .65rem; margin-top: .5rem;
          text-align: center;
        }

        /* ═══ MOBILE FEED CARDS (only rendered on the isMobile branch) ═══ */
        .np-mobile-feed {
          width: 100%; max-width: 600px;
          min-width: 0;
          display: flex; flex-direction: column;
          gap: 1rem;
        }
        .np-card {
          background: var(--paper);
          border: 1.5px solid var(--rule);
          box-shadow: 3px 3px 0 #000;
          cursor: pointer;
          overflow: hidden;
          min-width: 0;
          -webkit-tap-highlight-color: transparent;
          transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease;
        }
        /* Touch affordance: press-down state, no hover dependency */
        .np-card:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0 #000;
          opacity: .95;
        }
        .np-card.read { background: #e5dec9; }
        .np-card.read .np-card-hed { color: #8a2a1f; }

        /* Lead card: full-width image stacked on top (Apple News style) */
        .np-card--lead { display: block; }
        .np-card--lead .np-card-body { padding: .95rem 1rem 1.1rem; }

        /* Row cards: text left, square thumbnail right (NYT app style) */
        .np-card--row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 96px;
          gap: .9rem;
          align-items: center;
          padding: .85rem .9rem;
        }
        .np-card--row .np-card-body { min-width: 0; }

        /* Image boxes */
        .np-card-img {
          position: relative;
          overflow: hidden;
          background: #e9e1d0;
        }
        .np-card-img img {
          width: 100%; height: 100%;
          max-width: 100%;
          object-fit: cover; display: block;
          filter: grayscale(100%) contrast(1.1) brightness(.95);
          mix-blend-mode: multiply;
        }
        .np-card-img--lead {
          width: 100%;
          aspect-ratio: 3 / 2;
          border-bottom: 1.5px solid var(--rule);
        }
        .np-card-img--thumb {
          width: 96px; height: 96px;
          border: 1px solid var(--rule);
        }
        .np-card-img--lead .credit {
          position: absolute; bottom: 0; right: 0;
          font-size: .55rem; padding: .15rem .4rem;
          background: rgba(244,239,230,.9);
          color: var(--ink); opacity: .8;
        }

        /* Missing / broken image → printer's ornament placeholder */
        .np-card-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: .3rem;
          background:
            repeating-linear-gradient(-45deg, rgba(26,26,26,.05) 0 2px, transparent 2px 8px),
            #efe8d9;
        }
        .np-card-placeholder .glyph {
          font-family: var(--font-playfair), serif;
          font-size: 1.7rem; line-height: 1;
          color: rgba(26,26,26,.4);
        }
        .np-card-img--thumb .np-card-placeholder .glyph { font-size: 1.15rem; }
        .np-card-placeholder .label {
          font-family: var(--font-playfair), serif;
          font-weight: 700; font-size: .6rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: rgba(26,26,26,.5);
        }

        /* Card typography */
        .np-card-kicker {
          display: block;
          font-family: var(--font-playfair), serif;
          font-weight: 800; font-size: .62rem;
          text-transform: uppercase; letter-spacing: .14em;
          color: var(--brick);
          margin-bottom: .35rem;
        }
        .np-card-hed {
          font-family: var(--font-playfair), serif;
          font-weight: 800;
          font-size: 1.1rem; line-height: 1.25;
          color: var(--ink);
          margin: 0 0 .35rem;
          overflow-wrap: break-word;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        }
        .np-card--lead .np-card-hed {
          font-size: 1.35rem; line-height: 1.2;
          -webkit-line-clamp: 4;
        }
        .np-card-dek {
          font-style: italic;
          font-size: .9rem; line-height: 1.5;
          color: var(--ink); opacity: .85;
          margin: 0 0 .45rem;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
        .np-card--lead .np-card-dek { -webkit-line-clamp: 3; }
        .np-card-by {
          display: block;
          font-size: .62rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: .06em;
          color: var(--brick);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ═══ PHONE-WIDTH REFINEMENTS (desktop flipbook never renders here) ═══ */
        @media (max-width: 768px) {
          .np-canvas {
            padding: 1.25rem .75rem 1.5rem;
            overflow-x: hidden;
          }
          .np-card--row {
            grid-template-columns: minmax(0, 1fr) 88px;
            gap: .75rem;
            padding: .8rem .85rem;
          }
          .np-card-img--thumb { width: 88px; height: 88px; }

          /* Article reader modal: fit phone screens */
          .np-reader-overlay {
            padding: .9rem .6rem !important;
            align-items: flex-start !important;
          }
          /* Kill the inline margin:auto so align-items can top-align the sheet */
          .np-reader { margin: 0 auto !important; padding: 1.5rem 1.1rem 2rem !important; }
          .np-reader h1 { font-size: 1.65rem !important; line-height: 1.12 !important; }
          .np-reader .np-reader-sub { font-size: .98rem !important; }
          .np-reader .np-reader-meta {
            flex-wrap: wrap !important;
            gap: .3rem .75rem !important;
            margin-bottom: 1.25rem !important;
          }
          .np-reader .reader-body {
            font-size: .98rem !important;
            line-height: 1.6 !important;
            text-align: left !important;
          }
        }
        @media (max-width: 360px) {
          .np-card--row { grid-template-columns: minmax(0, 1fr) 76px; }
          .np-card-img--thumb { width: 76px; height: 76px; }
          .np-card-hed { font-size: 1.05rem; }
          .np-card--lead .np-card-hed { font-size: 1.25rem; }
        }
      `}</style>

      {/* Section tabs */}
      <div className="np-tabs" role="tablist" aria-label="News sections">
        {(Object.keys(sectionMeta) as SectionKey[]).map(key => (
          <button
            key={key}
            role="tab"
            aria-selected={activeSection === key}
            className={activeSection === key ? 'on' : ''}
            onClick={() => {
              setActiveSection(key);
              setCurrentSpread(0);
              bookRef.current?.pageFlip()?.turnToPage?.(0);
            }}
          >
            {sectionMeta[key].label}
          </button>
        ))}
      </div>

      {/* Empty edition */}
      {mounted && articles.length === 0 && (
        <div className="np-empty">
          <span className="np-empty-glyph">❦</span>
          <div className="np-empty-title">No stories in this edition yet</div>
          <div className="np-empty-copy">
            The {meta.label} desk hasn&apos;t filed for today&apos;s paper. Check back soon.
          </div>
        </div>
      )}

      {/* Book / Feed */}
      {mounted && articles.length > 0 && (
        isMobile ? (
          <div className="np-mobile-feed">
            {articles.map((story, idx) => {
              const isLead = idx === 0;
              const isRead = clickedArticles.includes(story.id);
              const openStory = () => {
                setSelectedArticle(story);
                markArticleClicked(story.id);
              };
              return (
                <article
                  key={story.id}
                  className={`np-card ${isLead ? 'np-card--lead' : 'np-card--row'} ${isRead ? 'read' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={openStory}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openStory();
                    }
                  }}
                >
                  {isLead ? (
                    <>
                      <CardImage story={story} sectionLabel={meta.label} variant="lead" />
                      <div className="np-card-body">
                        <span className="np-card-kicker">{meta.label}</span>
                        <h3 className="np-card-hed">{story.headline}</h3>
                        <p className="np-card-dek">{story.subhead}</p>
                        <span className="np-card-by">{story.byline}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="np-card-body">
                        <h3 className="np-card-hed">{story.headline}</h3>
                        <p className="np-card-dek">{story.subhead}</p>
                        <span className="np-card-by">{story.byline}</span>
                      </div>
                      <CardImage story={story} sectionLabel={meta.label} variant="thumb" />
                    </>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="np-book-wrap">
            {/* @ts-ignore — react-pageflip types */}
            <HTMLFlipBook
              ref={bookRef}
              width={520}
              height={700}
              size="stretch"
              minWidth={280}
              maxWidth={520}
              minHeight={400}
              maxHeight={700}
              showCover={false}
              mobileScrollSupport={false}
              usePortrait={false}
              maxShadowOpacity={0.35}
              drawShadow={true}
              flippingTime={600}
              useMouseEvents={true}
              className="np-flipbook"
              onFlip={(e: any) => setCurrentSpread(Math.floor(e.data / 2))}
            >
              {pages.map((page, pageIdx) => (
                <FlipPage key={`${activeSection}-${pageIdx}`} className="np-page">
                  {/* Masthead on first page only */}
                  {page.showMasthead && (
                    <div className="np-masthead">
                      <div className="np-mast-brand">only the truth</div>
                      <h2 className="np-mast-title">{meta.masthead}</h2>
                      <div className="np-mast-meta">
                        <span>VOL. CXXVI · No. 40,711</span>
                        <span>{getDate()}</span>
                        <span>₹5 · $0.10</span>
                      </div>
                    </div>
                  )}

                  {/* Story bands */}
                  {page.stories.length === 0 ? (
                    <div className="np-empty-page">
                      <p>Our correspondents are compiling<br />coverage for this section.</p>
                    </div>
                  ) : (
                    page.stories.map((story, localIdx) => {
                      const globalIdx = page.globalStartIdx + localIdx;
                      const isImageLeft = globalIdx % 2 === 0;
                      return (
                        <div
                          key={story.id}
                          className={`np-band ${clickedArticles.includes(story.id) ? 'clicked' : ''}`}
                          onClick={() => {
                            setSelectedArticle(story);
                            markArticleClicked(story.id);
                          }}
                        >
                          {isImageLeft ? (
                            <>
                              <div className="np-band-img">
                                {story.imageUrl ? (
                                  <>
                                    <img src={story.imageUrl} alt={story.headline} />
                                    <span className="credit">{story.imageCredit}</span>
                                  </>
                                ) : (
                                  <div className="np-band-placeholder">No image available</div>
                                )}
                              </div>
                              <div className="np-band-text">
                                <h3>{story.headline}</h3>
                                <p className="sub">{story.subhead}</p>
                                <span className="by">{story.byline}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="np-band-text">
                                <h3>{story.headline}</h3>
                                <p className="sub">{story.subhead}</p>
                                <span className="by">{story.byline}</span>
                              </div>
                              <div className="np-band-img">
                                {story.imageUrl ? (
                                  <>
                                    <img src={story.imageUrl} alt={story.headline} />
                                    <span className="credit">{story.imageCredit}</span>
                                  </>
                                ) : (
                                  <div className="np-band-placeholder">No image available</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </FlipPage>
              ))}
            </HTMLFlipBook>
          </div>
        )
      )}

      {/* Navigation - hide on mobile and for empty editions */}
      {!isMobile && articles.length > 0 && (
        <>
          <div className="np-nav">
            <button onClick={() => bookRef.current?.pageFlip()?.flipPrev()}>← Previous</button>
            <span className="indicator">Spread {currentSpread + 1} of {Math.ceil(pages.length / 2)}</span>
            <button onClick={() => bookRef.current?.pageFlip()?.flipNext()}>Next →</button>
          </div>
          <div className="np-hint">Use ← → arrow keys or drag page corners to flip</div>
        </>
      )}

      {/* Article Reader Modal Overlay */}
      {selectedArticle && (
        <div
          className="np-reader-overlay"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 99999,
            padding: '2rem 1rem',
            overflowY: 'auto'
          }}
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="np-reader"
            style={{
              background: '#F4EFE6',
              color: '#1A1A1A',
              border: '2px solid #1A1A1A',
              boxShadow: '0 15px 60px rgba(0,0,0,.45)',
              maxWidth: '780px', width: '100%',
              padding: '3rem',
              fontFamily: 'var(--font-lora), Georgia, serif',
              position: 'relative',
              margin: 'auto',
              textAlign: 'left'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedArticle(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                fontWeight: 800,
                color: '#1A1A1A'
              }}
            >
              ✕
            </button>

            <div style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: '.8rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '.12em',
              color: '#B23A2E',
              borderBottom: '1px solid #1A1A1A',
              paddingBottom: '3px', marginBottom: '1rem',
              display: 'inline-block',
            }}>
              {sectionMeta[activeSection]?.label || activeSection}
            </div>

            <h1 style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: '2.5rem', lineHeight: '1.06',
              fontWeight: 900, letterSpacing: '-.02em',
              marginBottom: '.65rem', color: '#1A1A1A',
            }}>{selectedArticle.headline}</h1>
            
            <p className="np-reader-sub" style={{
              fontSize: '1.1rem', fontStyle: 'italic',
              lineHeight: '1.4', opacity: .88,
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '4px double #1A1A1A',
            }}>{selectedArticle.subhead}</p>

            <div className="np-reader-meta" style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '.8rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.04em',
              marginBottom: '1.75rem',
            }}>
              <span>
                <span style={{
                  width: '8px', height: '8px',
                  background: '#B23A2E', borderRadius: '50%',
                  display: 'inline-block', marginRight: '.5rem',
                }} />
                {selectedArticle.byline}
              </span>
              <span style={{ opacity: .5 }}>ONLY THE TRUTH · 2026</span>
            </div>

            <ReaderImage key={selectedArticle.id} story={selectedArticle} />

            <div className="reader-body" style={{
              fontSize: '1.05rem', lineHeight: '1.58',
              textAlign: 'justify', maxWidth: '700px',
              margin: '0 auto'
            }}>
              {selectedArticle.about && selectedArticle.about.length > 0 && (
                <>
                  <div style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 800, fontSize: '.88rem', textTransform: 'uppercase', letterSpacing: '.06em', color: '#B23A2E', margin: '2rem 0 .5rem', borderBottom: '1.5px solid rgba(178,58,46,.18)', display: 'inline-block', paddingBottom: '2px' }}>
                    What it's actually about
                  </div>
                  {selectedArticle.about.map((p, i) => (
                    <p key={`about-${i}`} style={{ marginBottom: '.75rem' }}>{p}</p>
                  ))}
                </>
              )}

              {selectedArticle.left && selectedArticle.left.length > 0 && (
                <>
                  <div style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 800, fontSize: '.88rem', textTransform: 'uppercase', letterSpacing: '.06em', color: '#B23A2E', margin: '2rem 0 .5rem', borderBottom: '1.5px solid rgba(178,58,46,.18)', display: 'inline-block', paddingBottom: '2px' }}>
                    What the opposition-leaning frame says
                  </div>
                  {selectedArticle.left.map((p, i) => (
                    <p key={`left-${i}`} style={{ marginBottom: '.75rem' }}>{p}</p>
                  ))}
                </>
              )}

              {selectedArticle.right && selectedArticle.right.length > 0 && (
                <>
                  <div style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 800, fontSize: '.88rem', textTransform: 'uppercase', letterSpacing: '.06em', color: '#B23A2E', margin: '2rem 0 .5rem', borderBottom: '1.5px solid rgba(178,58,46,.18)', display: 'inline-block', paddingBottom: '2px' }}>
                    What the government-leaning frame says
                  </div>
                  {selectedArticle.right.map((p, i) => (
                    <p key={`right-${i}`} style={{ marginBottom: '.75rem' }}>{p}</p>
                  ))}
                </>
              )}

              {selectedArticle.reality && selectedArticle.reality.length > 0 && (
                <>
                  <div style={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 800, fontSize: '.88rem', textTransform: 'uppercase', letterSpacing: '.06em', color: '#B23A2E', margin: '2rem 0 .5rem', borderBottom: '1.5px solid rgba(178,58,46,.18)', display: 'inline-block', paddingBottom: '2px' }}>
                    Brutal reality
                  </div>
                  {selectedArticle.reality.map((p, i) => (
                    <p key={`reality-${i}`} style={{ marginBottom: '.75rem' }}>{p}</p>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
