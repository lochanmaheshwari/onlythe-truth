'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lora, Playfair_Display } from 'next/font/google';
import { 
  ChevronLeft, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Scale, 
  Info,
  Sparkles,
  Link as LinkIcon 
} from 'lucide-react';

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

import topStoriesRaw from '@/data/top-stories.json';
import financialNewsRaw from '@/data/financial-news.json';
import sportsRaw from '@/data/sports.json';
import entertainmentRaw from '@/data/entertainment.json';

const allData: Record<string, Article[]> = {
  'top-stories': topStoriesRaw as Article[],
  'financial-news': financialNewsRaw as Article[],
  'sports': sportsRaw as Article[],
  'entertainment': entertainmentRaw as Article[],
};

const sectionLabels: Record<string, string> = {
  'top-stories': 'Top 10 News of the Day',
  'financial-news': 'Financial News',
  'sports': 'Sports',
  'entertainment': 'Entertainment',
};

interface ArticleReaderClientProps {
  section: string;
  id: string;
}

export default function ArticleReaderClient({ section, id }: ArticleReaderClientProps) {
  const articles = allData[section] ?? [];
  const article = articles.find((a) => a.id === id);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    about: true,
    perspectives: false,
    reality: false
  });

  const toggleSection = (sec: string) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  if (!article) {
    return (
      <div className={`${lora.variable} ${playfair.variable}`} style={{
        background: '#fcfaf7', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: '#fff', border: '1px solid #e7e5e4',
          padding: '2.5rem 1.5rem', textAlign: 'center', maxWidth: 400,
          borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#111' }}>Dispatch Not Found</h2>
          <p style={{ opacity: .7, marginBottom: '1.5rem', fontSize: '14px' }}>This article could not be located.</p>
          <Link href="/?focus=news" style={{
            color: '#8b5cf6', textDecoration: 'underline',
            fontWeight: 700, textTransform: 'uppercase', fontSize: '.8rem',
            letterSpacing: '0.04em'
          }}>
            ← Back to Broadsheet
          </Link>
        </div>
      </div>
    );
  }

  // Generate a short 2-3 sentence overview
  const getOverview = () => {
    if (article.about && article.about.length > 0) {
      return article.about[0];
    }
    return article.subhead;
  };

  const hasPerspectives = (article.left && article.left.length > 0) || (article.right && article.right.length > 0);

  return (
    <div className={`${lora.variable} ${playfair.variable}`} style={{
      width: '100%',
      minHeight: '100vh',
      background: '#fcfaf7',
      color: '#1a1a1a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '4rem',
      boxSizing: 'border-box'
    }}>
      {/* ═══ IOS STYLE NAVIGATION HEADER ═══ */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 99,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'calc(56px + env(safe-area-inset-top, 0px))',
        padding: 'env(safe-area-inset-top, 0px) 16px 0 16px',
        background: 'rgba(252, 250, 247, 0.94)',
        borderBottom: '1px solid #e5e0d8',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <Link href="/?focus=news" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          color: '#8b5cf6',
          fontSize: '16px',
          fontWeight: 500,
          textDecoration: 'none',
          padding: '4px 0'
        }}>
          <ChevronLeft size={20} strokeWidth={2.5} />
          Feed
        </Link>

        <span style={{
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          fontFamily: 'Georgia, serif',
          textTransform: 'lowercase'
        }}>
          only the truth
        </span>

        <div style={{ width: '48px' }} />
      </header>

      {/* ═══ DOSSIER MAIN CONTENT CONTAINER ═══ */}
      <div style={{
        padding: '20px 16px 0 16px',
        maxWidth: '680px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {/* Category Label */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{
            background: '#8b5cf6',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '100px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {sectionLabels[section] || section}
          </span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: '24px',
          lineHeight: '1.25',
          fontWeight: 800,
          fontFamily: 'Georgia, serif',
          color: '#111',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          {article.headline}
        </h1>

        {/* Subhead / Byline */}
        <p style={{
          fontSize: '15px',
          lineHeight: '1.45',
          color: '#57534e',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          margin: '0 0 12px 0'
        }}>
          {article.subhead}
        </p>

        <div style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: '#78716c',
          letterSpacing: '0.04em',
          marginBottom: '20px'
        }}>
          By {article.byline || 'Broadsheet Desk'}
        </div>

        {/* Media Block */}
        {article.imageUrl && (
          <div style={{
            background: '#000',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '24px',
            border: '1px solid #e7e5e4',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <img 
              src={article.imageUrl} 
              alt={article.headline} 
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                maxHeight: '380px',
                objectFit: 'cover',
                filter: 'grayscale(0.15) contrast(1.05)'
              }}
            />
            <div style={{
              padding: '8px 14px',
              fontSize: '10px',
              color: '#a8a29e',
              background: '#fafaf9',
              borderTop: '1px solid #e7e5e4',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              fontWeight: 500
            }}>
              Photo: {article.imageCredit || 'Broadsheet Archive'}
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div style={{
          background: '#f4ede4',
          border: '1px solid #e4dcd0',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#78716c',
            marginBottom: '8px',
            letterSpacing: '0.04em'
          }}>
            <Sparkles size={13} style={{ color: '#8b5cf6' }} />
            Quick Overview
          </div>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#292524',
            fontWeight: 500,
            margin: 0,
            fontStyle: 'italic'
          }}>
            "{getOverview()}"
          </p>
        </div>

        {/* Accordions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* 1. WHAT IT'S ABOUT */}
          {article.about && article.about.length > 0 && (
            <div style={{
              background: '#fff',
              border: '1px solid #e7e5e4',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
            }}>
              <button 
                onClick={() => toggleSection('about')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center' }}>
                    <BookOpen size={18} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917' }}>Narrative Focus</span>
                </div>
                {expandedSections.about ? <ChevronDown size={18} color="#78716c" /> : <ChevronRight size={18} color="#78716c" />}
              </button>
              {expandedSections.about && (
                <div style={{
                  padding: '0 16px 16px 16px',
                  borderTop: '1px solid #f5f5f4',
                  fontSize: '15px',
                  color: '#374151'
                }}>
                  {article.about.map((p, idx) => (
                    <p key={idx} style={{ lineHeight: '1.7', marginBottom: '1rem', fontSize: '15px' }}>{p}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. PERSPECTIVES */}
          {hasPerspectives && (
            <div style={{
              background: '#fff',
              border: '1px solid #e7e5e4',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
            }}>
              <button 
                onClick={() => toggleSection('perspectives')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center' }}>
                    <Scale size={18} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917' }}>Narrative Angles</span>
                </div>
                {expandedSections.perspectives ? <ChevronDown size={18} color="#78716c" /> : <ChevronRight size={18} color="#78716c" />}
              </button>
              {expandedSections.perspectives && (
                <div style={{
                  padding: '16px',
                  borderTop: '1px solid #f5f5f4',
                  background: '#fafaf9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Left (Opposition) */}
                  {article.left && article.left.length > 0 && (
                    <div style={{
                      background: '#fff',
                      border: '1px solid #dbeafe',
                      borderRadius: '12px',
                      padding: '14px'
                    }}>
                      <div style={{
                        background: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}>
                        Left-Leaning / Critical Stance
                      </div>
                      {article.left.map((p, idx) => (
                        <p key={idx} style={{ fontSize: '14px', lineHeight: '1.6', color: '#1e293b', margin: '0 0 10px 0' }}>{p}</p>
                      ))}
                    </div>
                  )}

                  {/* Right (Government) */}
                  {article.right && article.right.length > 0 && (
                    <div style={{
                      background: '#fff',
                      border: '1px solid #fee2e2',
                      borderRadius: '12px',
                      padding: '14px'
                    }}>
                      <div style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}>
                        Right-Leaning / Official Stance
                      </div>
                      {article.right.map((p, idx) => (
                        <p key={idx} style={{ fontSize: '14px', lineHeight: '1.6', color: '#78350f', margin: '0 0 10px 0' }}>{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. BRUTAL REALITY / EXPLORATORY DEEP DIVE */}
          {article.reality && article.reality.length > 0 && (
            <div style={{
              background: '#fff',
              border: '1px solid #e7e5e4',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
            }}>
              <button 
                onClick={() => toggleSection('reality')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center' }}>
                    <Info size={18} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917' }}>The Brutal Reality</span>
                </div>
                {expandedSections.reality ? <ChevronDown size={18} color="#78716c" /> : <ChevronRight size={18} color="#78716c" />}
              </button>
              {expandedSections.reality && (
                <div style={{
                  padding: '16px',
                  borderTop: '1px solid #f5f5f4',
                  background: '#1c1917',
                  color: '#e7e5e4',
                  fontSize: '15px'
                }}>
                  {article.reality.map((p, idx) => (
                    <p key={idx} style={{ lineHeight: '1.7', marginBottom: '1rem', color: '#e7e5e4' }}>{p}</p>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
