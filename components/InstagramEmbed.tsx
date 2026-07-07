'use client';
import React, { useEffect } from 'react';

interface InstagramEmbedProps {
  url: string;
  compact?: boolean;
}

export default function InstagramEmbed({ url, compact = false }: InstagramEmbedProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).instgrm) {
      try {
        (window as any).instgrm.Embeds.process();
      } catch (e) {
        console.error("Failed to process Instagram embed:", e);
      }
    }
  }, [url]);

  if (!url) return null;

  const isInstagram = /instagram\.com/i.test(url);

  const containerStyle: React.CSSProperties = compact
    ? { display: 'flex', justifyContent: 'center', margin: 0, width: '100%' }
    : { display: 'flex', justifyContent: 'center', margin: '1.5rem 0', width: '100%' };

  const cardMaxWidth = compact ? '260px' : '540px';
  const cardPadding = compact ? '0.75rem' : '1.5rem';

  if (!isInstagram) {
    const isYouTube = /youtube\.com|youtu\.be/i.test(url);
    const platformName = isYouTube ? 'YouTube' : url.includes('tiktok.com') ? 'TikTok' : 'Video Source';
    return (
      <div className={`reader-embed-container${compact ? ' reader-embed-compact' : ''}`} style={containerStyle}>
        <div style={{
          width: '100%',
          maxWidth: cardMaxWidth,
          background: '#FFF',
          border: '1px solid var(--border-dark)',
          borderRadius: compact ? '10px' : '12px',
          padding: cardPadding,
          margin: '0 auto',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--c-blue)', fontWeight: 600, textDecoration: 'underline', fontSize: compact ? '0.78rem' : '1rem' }}>
            View original video on {platformName} ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`reader-embed-container${compact ? ' reader-embed-compact' : ''}`} style={containerStyle}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          width: '100%',
          maxWidth: cardMaxWidth,
          minWidth: compact ? 'unset' : undefined,
          background: '#FFF',
          border: '1px solid var(--border-dark)',
          borderRadius: compact ? '10px' : '12px',
          padding: cardPadding,
          margin: '0 auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          transform: compact ? 'scale(0.92)' : undefined,
          transformOrigin: 'top center',
        }}
      >
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--c-blue)', fontWeight: 600, textDecoration: 'underline', fontSize: compact ? '0.78rem' : '1rem' }}>
          View original post on Instagram ↗
        </a>
      </blockquote>
    </div>
  );
}
