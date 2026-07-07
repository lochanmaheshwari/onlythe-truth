'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  BookOpen, 
  Info,
  Scale,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

interface MobileDossierProps {
  result: any;
  onBack: () => void;
}

function generateInstagramComments(tableData?: any[]) {
  if (!tableData || tableData.length === 0) {
    return [
      "Let's fact-check before sharing! Research shows this information might lack complete context. Think critically, verify sources! 🌐 #FactCheck #CriticalThinking",
      "Sachai verify karna zaroori hai dosto. Don't believe everything blindly, raise questions. #ThinkCritically #OnlyTheTruth",
      "Do your own research guys. Media spin is real, let's analyze multiple perspectives. 🧐 #FactCheck",
      "Spreading awareness: Let's read both left & right frames before drawing conclusions. Keep questioning! #MediaLiteracy",
      "Hinglish check: Bina verification ke videos share mat karo, reality check is always important. 🧐",
      "Think twice before spreading this. Facts matter, check verified sources. 🔍 #VerifyFirst",
      "Bhai thoda dhyan se. Internet pe har cheez sach nahi hoti, verify the facts. #FactCheck #CriticalThinking",
      "Let's make humans critical thinkers again! Question everything, research verify karo. 🧠",
      "Polarization increases when we don't verify facts. Let's analyze details from independent sources. 📰",
      "A simple reminder: Verify claims before reposting. Factual accuracy is key! 🔍 #FactChecked"
    ];
  }

  const claims = tableData.map(row => ({
    said: row.said || '',
    truth: row.truth || '',
    verdict: (row.verdict || '').toUpperCase(),
    source: row.source || 'verified sources'
  }));

  const falseOrMisleading = claims.filter(c => c.verdict === 'FALSE' || c.verdict === 'MISLEADING');
  const targetClaim = falseOrMisleading.length > 0 ? falseOrMisleading[0] : claims[0];

  const saidTrunc = targetClaim.said.length > 60 ? targetClaim.said.slice(0, 60) + '...' : targetClaim.said;
  const truthTrunc = targetClaim.truth.length > 100 ? targetClaim.truth.slice(0, 100) + '...' : targetClaim.truth;
  const sourceName = targetClaim.source;

  return [
    `Fact-Check Alert: The claim "${saidTrunc}" is marked as ${targetClaim.verdict.toLowerCase()} by verified sources. Reality: ${truthTrunc}. Details verified via ${sourceName}. #FactCheck`,
    `Let's think critically: This video states "${saidTrunc}", but independent reports show that "${truthTrunc}". Verify the facts before sharing! 🧠 #MediaLiteracy`,
    `Quick check: The claim about "${saidTrunc}" is misleading. Actual facts: "${truthTrunc}". Source: ${sourceName}. 🔍 #ThinkCritically`,
    `Hey everyone, just a heads-up that verified sources (${sourceName}) have clarified this: "${truthTrunc}". Let's prevent misinformation! 📰`,
    `Bhai log, thoda research zaroori hai. Reel me bola hai "${saidTrunc}" par actual me ye hai कि "${truthTrunc}". Sachai check karo! #OnlyTheTruth`,
    `Reality Check: Ye claim ki "${saidTrunc}" false/misleading hai. Real fact ye hai ki "${truthTrunc}". Verify details on ${sourceName}. 🧐`,
    `Kya hum log sachme check kar rahe hain? Reels pe jo bola hai "${saidTrunc}" wo galat hai. Sach ye hai ki "${truthTrunc}". Source: ${sourceName}.`,
    `तथ्य जांच: इस वीडियो का यह दावा कि "${saidTrunc}" पूरी तरह से सही नहीं है। वास्तविक तथ्य यह है कि "${truthTrunc}"। कृपया सच्चाई की जांच करें। 🔍`,
    `हमें खुद सोचना होगा! इस दावे "${saidTrunc}" के पीछे का सच यह है: "${truthTrunc}"। स्वतंत्र स्रोतों से पुष्टि करें। 🧠`,
    `Let's make humans critical thinkers again! Don't spread unchecked claims like "${saidTrunc}" when verified facts show "${truthTrunc}". 🧐 #FactChecked #CriticalThinking`
  ];
}

export default function MobileDossier({ result, onBack }: MobileDossierProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    context: true,
    perspectives: false,
    reality: false,
    claims: true,
    sources: false,
    comments: false
  });

  const [expandedClaimIdx, setExpandedClaimIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCopyText = (text: string, idx: number) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedIdx(idx);
          setTimeout(() => setCopiedIdx(null), 1500);
        })
        .catch(() => fallbackCopy(text, idx));
    } else {
      fallbackCopy(text, idx);
    }
  };

  const fallbackCopy = (text: string, idx: number) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch (e) {
      console.error("Fallback copy failed", e);
    }
  };

  const isPolitical = !!(result.left || result.right);
  const fightLines = (result.fight || '').split('\n').filter(Boolean);
  const fightHeadline = fightLines[0] || 'The core clash';
  const fightBody = fightLines.slice(1).join('\n').trim() || result.fight;

  // Extract overview (first 2 sentences of context)
  const getOverviewText = () => {
    const textToSplit = isPolitical ? fightBody : result.fight;
    if (!textToSplit) return 'No context summary available.';
    const sentences = textToSplit.match(/[^.!?]+[.!?]+/g) || [textToSplit];
    return sentences.slice(0, 2).join(' ').trim();
  };

  const renderParagraphs = (text: string) => {
    if (!text) return null;
    return text.split('\n').filter(p => p.trim().length > 0).map((para, i) => (
      <p key={i} style={{ 
        fontSize: '16px', 
        lineHeight: '1.7', 
        color: '#374151', 
        marginBottom: '1rem',
        fontWeight: 400
      }}>
        {para}
      </p>
    ));
  };

  const getVerdictStyle = (verdict: string) => {
    const v = (verdict || '').toUpperCase();
    if (v === 'TRUE') {
      return { bg: '#eefcf4', color: '#166534', border: '#bcf0da', text: 'True' };
    } else if (v === 'FALSE') {
      return { bg: '#fff5f5', color: '#991b1b', border: '#fecaca', text: 'False' };
    } else if (v === 'MISLEADING') {
      return { bg: '#fffbeb', color: '#92400e', border: '#fef3c7', text: 'Misleading' };
    }
    return { bg: '#f9fafb', color: '#4b5563', border: '#e5e7eb', text: 'Unverified' };
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#fcfaf7',
      color: '#1a1a1a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
        <button 
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: '#8b5cf6',
            fontSize: '16px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
          Back
        </button>

        <span style={{
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          fontFamily: 'Georgia, serif',
          textTransform: 'lowercase'
        }}>
          only the truth
        </span>

        <div style={{ width: '48px' }} /> {/* Spacer to align title center */}
      </header>

      {/* ═══ DOSSIER MAIN CONTENT CONTAINER ═══ */}
      <div style={{
        padding: '20px 16px 0 16px',
        maxWidth: '680px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {/* Category & Stats Metadata */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '12px'
        }}>
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
            {(result.category || 'news').replace('_', ' ')}
          </span>
          <span style={{ fontSize: '12px', color: '#78716c' }}>•</span>
          <span style={{ fontSize: '11px', color: '#78716c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            {result.viewCount !== undefined ? `${result.viewCount} verified scans` : '1 scan'}
          </span>
          <span style={{ fontSize: '12px', color: '#78716c' }}>•</span>
          <span style={{ fontSize: '11px', color: '#78716c', fontWeight: 600 }}>
            {result.uploadedAt 
              ? new Date(result.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : 'Recent'}
          </span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: '24px',
          lineHeight: '1.25',
          fontWeight: 800,
          fontFamily: 'Georgia, serif',
          color: '#111',
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em'
        }}>
          {result.headline || 'Verified Claim Analysis'}
        </h1>

        {/* Summary Card (Progressive Disclosure Lead) */}
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
            lineHeight: '1.65',
            color: '#292524',
            fontWeight: 500,
            margin: 0,
            fontStyle: 'italic'
          }}>
            "{getOverviewText()}"
          </p>
        </div>

        {/* ═══ PROGRESSIVE DISCLOSURE ACCORDIONS ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* 1. WHAT HAPPENED */}
          <div style={{
            background: '#fff',
            border: '1px solid #e7e5e4',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
          }}>
            <button 
              onClick={() => toggleSection('context')}
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
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917' }}>Detailed Context</span>
              </div>
              {expandedSections.context ? <ChevronDown size={18} color="#78716c" /> : <ChevronRight size={18} color="#78716c" />}
            </button>
            {expandedSections.context && (
              <div style={{
                padding: '0 16px 16px 16px',
                borderTop: '1px solid #f5f5f4',
                fontSize: '15px',
                color: '#444'
              }}>
                {renderParagraphs(isPolitical ? fightBody : result.fight)}
              </div>
            )}
          </div>

          {/* 2. PERSPECTIVES (LEFT VS RIGHT) */}
          {isPolitical && (result.left || result.right) && (
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
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917' }}>Framing & Perspectives</span>
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
                  {/* Left Perspective */}
                  {result.left && (
                    <div style={{
                      background: '#fff',
                      border: '1px solid #dbeafe',
                      borderRadius: '12px',
                      padding: '14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.01)'
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
                      <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#1e293b', fontWeight: 500, margin: '0 0 10px 0' }}>
                        {result.left.summary}
                      </p>
                      
                      {result.left.keyPoints && result.left.keyPoints.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Key Claims</div>
                          <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {result.left.keyPoints.map((pt: string, idx: number) => <li key={idx}>{pt}</li>)}
                          </ul>
                        </div>
                      )}

                      {result.left.strongestPoint && (
                        <div style={{ fontSize: '13px', borderLeft: '3px solid #3b82f6', paddingLeft: '8px', fontStyle: 'italic', color: '#334155', marginBottom: '8px' }}>
                          <strong>Strongest argument:</strong> "{result.left.strongestPoint}"
                        </div>
                      )}

                      {result.left.blindSpot && (
                        <div style={{ fontSize: '12px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '6px 10px', borderRadius: '6px' }}>
                          <strong>Blind spot:</strong> {result.left.blindSpot}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Right Perspective */}
                  {result.right && (
                    <div style={{
                      background: '#fff',
                      border: '1px solid #fee2e2',
                      borderRadius: '12px',
                      padding: '14px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.01)'
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
                      <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#451a03', fontWeight: 500, margin: '0 0 10px 0' }}>
                        {result.right.summary}
                      </p>
                      
                      {result.right.keyPoints && result.right.keyPoints.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#78350f', marginBottom: '4px' }}>Key Claims</div>
                          <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '13px', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {result.right.keyPoints.map((pt: string, idx: number) => <li key={idx}>{pt}</li>)}
                          </ul>
                        </div>
                      )}

                      {result.right.strongestPoint && (
                        <div style={{ fontSize: '13px', borderLeft: '3px solid #f59e0b', paddingLeft: '8px', fontStyle: 'italic', color: '#78350f', marginBottom: '8px' }}>
                          <strong>Strongest argument:</strong> "{result.right.strongestPoint}"
                        </div>
                      )}

                      {result.right.blindSpot && (
                        <div style={{ fontSize: '12px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '6px 10px', borderRadius: '6px' }}>
                          <strong>Blind spot:</strong> {result.right.blindSpot}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. THE BRUTAL REALITY / DEEP DIVE */}
          {result.reality && (
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
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917' }}>
                    {isPolitical ? 'The Brutal Reality' : 'The Full Story'}
                  </span>
                </div>
                {expandedSections.reality ? <ChevronDown size={18} color="#78716c" /> : <ChevronRight size={18} color="#78716c" />}
              </button>
              {expandedSections.reality && (
                <div style={{
                  padding: '16px',
                  borderTop: '1px solid #f5f5f4',
                  background: isPolitical ? '#1c1917' : '#fff',
                  color: isPolitical ? '#f5f5f4' : '#1a1a1a',
                  fontSize: '15px'
                }}>
                  {isPolitical ? (
                    <div style={{
                      fontSize: '15px',
                      lineHeight: '1.7',
                      color: '#e7e5e4',
                      fontWeight: 400
                    }}>
                      {renderParagraphs(result.reality)}
                    </div>
                  ) : (
                    renderParagraphs(result.reality)
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4. VERIFIED CLAIMS LEDGER (CARD-BASED INTERACTIVE LIST) */}
          {result.table && result.table.length > 0 && (
            <div style={{
              background: '#fff',
              border: '1px solid #e7e5e4',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
            }}>
              <button 
                onClick={() => toggleSection('claims')}
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
                    <CheckCircle2 size={18} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917' }}>Claims Checked ({result.table.length})</span>
                </div>
                {expandedSections.claims ? <ChevronDown size={18} color="#78716c" /> : <ChevronRight size={18} color="#78716c" />}
              </button>
              {expandedSections.claims && (
                <div style={{
                  padding: '12px 12px 16px 12px',
                  borderTop: '1px solid #f5f5f4',
                  background: '#fafaf9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {result.table.map((row: any, i: number) => {
                    const style = getVerdictStyle(row.verdict);
                    const isExpanded = expandedClaimIdx === i;
                    return (
                      <div 
                        key={i}
                        onClick={() => setExpandedClaimIdx(isExpanded ? null : i)}
                        style={{
                          background: '#fff',
                          border: '1px solid #e7e5e4',
                          borderRadius: '12px',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Title Row: Claim & Verdict Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#292524', flex: 1, textAlign: 'left', lineHeight: '1.4' }}>
                            "{row.said}"
                          </span>
                          <span style={{
                            background: style.bg,
                            color: style.color,
                            border: `1px solid ${style.border}`,
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
                          }}>
                            {style.text}
                          </span>
                        </div>

                        {/* Interactive Expand Hint */}
                        {!isExpanded && (
                          <div style={{ fontSize: '10px', color: '#a8a29e', textAlign: 'left', fontWeight: 500 }}>
                            Tap to reveal reality check...
                          </div>
                        )}

                        {/* Expanded details */}
                        {isExpanded && (
                          <div style={{
                            borderTop: '1px solid #f5f5f4',
                            paddingTop: '8px',
                            marginTop: '4px',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            color: '#444',
                            textAlign: 'left'
                          }}>
                            <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: '2px', fontSize: '11px', textTransform: 'uppercase' }}>
                              Factual Reality
                            </div>
                            <div style={{ marginBottom: '8px', color: '#1c1917' }}>
                              {row.truth}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#78716c' }}>
                              <span>Verified Source:</span>
                              {row.link ? (
                                <a 
                                  href={row.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ color: '#8b5cf6', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px', textDecoration: 'underline' }}
                                >
                                  {row.source} <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span style={{ fontWeight: 600 }}>{row.source}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. SOURCES */}
          {result.articles && result.articles.length > 0 && (
            <div style={{
              background: '#fff',
              border: '1px solid #e7e5e4',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
            }}>
              <button 
                onClick={() => toggleSection('sources')}
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
                    <Globe size={18} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917' }}>Sources Consulted ({result.articles.length})</span>
                </div>
                {expandedSections.sources ? <ChevronDown size={18} color="#78716c" /> : <ChevronRight size={18} color="#78716c" />}
              </button>
              {expandedSections.sources && (
                <div style={{
                  padding: '12px 12px 16px 12px',
                  borderTop: '1px solid #f5f5f4',
                  background: '#fafaf9',
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '8px'
                }}>
                  {result.articles.map((art: any, idx: number) => (
                    <a 
                      key={idx}
                      href={art.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#fff',
                        border: '1px solid #e7e5e4',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: '#1a1a1a',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, paddingRight: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#292524', textAlign: 'left', lineHeight: '1.3' }}>{art.title}</span>
                        <span style={{ fontSize: '10px', color: '#78716c', fontWeight: 600, textTransform: 'uppercase', textAlign: 'left' }}>{art.source}</span>
                      </div>
                      <LinkIcon size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. INSTAGRAM COMMENTS */}
          <div style={{
            background: '#fff',
            border: '1px solid #e7e5e4',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
          }}>
            <button 
              onClick={() => toggleSection('comments')}
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
                  <Copy size={18} />
                </div>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917' }}>Spread the Truth (Copy Comments)</span>
              </div>
              {expandedSections.comments ? <ChevronDown size={18} color="#78716c" /> : <ChevronRight size={18} color="#78716c" />}
            </button>
            {expandedSections.comments && (
              <div style={{
                padding: '12px 12px 16px 12px',
                borderTop: '1px solid #f5f5f4',
                background: '#fafaf9',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontSize: '12px', color: '#78716c', marginBottom: '4px', textAlign: 'left', lineHeight: '1.4' }}>
                  Copy-paste these context responses on the original video post to challenge false narratives.
                </div>
                {generateInstagramComments(result.table).map((comment, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: '#fff',
                      border: '1px solid #e7e5e4',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#444', fontStyle: 'italic', flex: 1, textAlign: 'left', lineHeight: '1.4' }}>
                      "{comment}"
                    </span>
                    <button 
                      onClick={() => handleCopyText(comment, idx)}
                      style={{
                        background: copiedIdx === idx ? '#10b981' : '#1a1a1a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.2s'
                      }}
                    >
                      {copiedIdx === idx ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
