'use client';
import React, { useState, useRef, useEffect, CSSProperties } from 'react';

interface ExpandableTextProps {
  text: string;
  lines?: number;
  className?: string;
  style?: CSSProperties;
  /** Color of the Read more toggle; defaults to the brand blue. */
  accent?: string;
}

/**
 * Paragraph clamped to N lines with a Read more / Read less toggle,
 * the way long copy behaves in native news apps. The toggle only appears
 * when the text actually overflows the clamp.
 */
export default function ExpandableText({ text, lines = 6, className, style, accent }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 2);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [text, lines, expanded]);

  const clampStyle: CSSProperties = expanded
    ? {}
    : {
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      };

  return (
    <div>
      <p ref={ref} className={className} style={{ margin: 0, ...style, ...clampStyle }}>
        {text}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem 0 0',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
            cursor: 'pointer',
            color: accent || 'var(--c-blue, #0b66c3)',
          }}
        >
          {expanded ? 'Read less ↑' : 'Read more ↓'}
        </button>
      )}
    </div>
  );
}
