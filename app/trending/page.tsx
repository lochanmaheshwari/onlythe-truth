'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { supabase } from '@/lib/supabaseClient';
import { Instagram, Facebook, Youtube, X } from '@/components/Icons';
import InstagramEmbed from '@/components/InstagramEmbed';
import ClaimsTable from '@/components/ClaimsTable';

interface CacheItem {
  id: string;
  url: string;
  topic: string;
  thumbnail?: string;
  view_count: number;
  created_at: string;
  category?: string;
  data?: {
    fight?: string;
    headline?: string;
    uploadedAt?: string;
    verdict?: string;
    category?: string;
    table?: { said: string; truth: string; verdict: string; source: string; link?: string }[];
    left?: { summary: string; keyPoints: string[]; strongestPoint: string; blindSpot: string };
    right?: { summary: string; keyPoints: string[]; strongestPoint: string; blindSpot: string };
    reality?: string;
    articles?: { title: string; source: string; link?: string }[];
    pipeline?: any;
  };
}

export default function TrendingPage() {
  const [reels, setReels] = useState<CacheItem[]>([]);
  const [filtered, setFiltered] = useState<CacheItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'newest_uploaded' | 'newest_scans'>('trending');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [selectedReel, setSelectedReel] = useState<CacheItem | null>(null);
  const [showAllSources, setShowAllSources] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [inputEmail, setInputEmail] = useState('');

  useEffect(() => {
    setUserEmail(localStorage.getItem('userEmail'));
    const handleStorageChange = () => {
      setUserEmail(localStorage.getItem('userEmail'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) return;
    localStorage.setItem('userEmail', inputEmail.trim());
    setUserEmail(inputEmail.trim());
    setInputEmail('');
    setShowLoginModal(false);
    window.dispatchEvent(new Event('storage'));
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('userEmail');
    setUserEmail(null);
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    async function fetchReels() {
      try {
        const { data, error: dbErr } = await supabase
          .from('instagram_cache')
          .select('*')
          .order('view_count', { ascending: false });

        if (dbErr) throw dbErr;
        setReels(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load trending database.');
      } finally {
        setLoading(false);
      }
    }
    fetchReels();
  }, []);

  // Filter and sort items
  useEffect(() => {
    let items = [...reels];

    // search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(r => 
        (r.topic || '').toLowerCase().includes(q) ||
        (r.url || '').toLowerCase().includes(q) ||
        (r.data?.headline || '').toLowerCase().includes(q) ||
        (r.data?.fight || '').toLowerCase().includes(q)
      );
    }

    // category filter
    if (selectedCategory !== 'ALL') {
      items = items.filter(r => {
        const itemCat = (r.category || r.data?.category || 'WORLD_NEWS').toUpperCase();
        return itemCat === selectedCategory;
      });
    }

    // sorting
    if (sortBy === 'trending') {
      // Sort using hot score: views / (ageInDays + 1)
      items.sort((a, b) => {
        const getScore = (x: CacheItem) => {
          const uploadTime = x.data?.uploadedAt ? new Date(x.data.uploadedAt).getTime() : new Date(x.created_at).getTime();
          const ageInDays = (Date.now() - uploadTime) / (1000 * 60 * 60 * 24);
          const views = x.view_count || 1;
          return views / (Math.max(0, ageInDays) + 1);
        };
        return getScore(b) - getScore(a);
      });
    } else if (sortBy === 'newest_uploaded') {
      items.sort((a, b) => {
        const dateA = a.data?.uploadedAt ? new Date(a.data.uploadedAt).getTime() : 0;
        const dateB = b.data?.uploadedAt ? new Date(b.data.uploadedAt).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === 'newest_scans') {
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFiltered(items);
  }, [reels, searchTerm, sortBy, selectedCategory]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        :root {
          --bg-warm: #f4ede4;
          --bg: #f4ede4;
          --text-dark: #000000;
          --border-dark: #000000;
          --sans: 'Inter', system-ui, -apple-system, sans-serif;
          --serif: 'Playfair Display', Georgia, serif;
          
          /* Colorful Block Colors */
          --c-blue: #0066cc;
          --c-yellow: #fcb900;
          --c-orange: #ff5500;
          --c-green: #00b33c;
          --c-purple: #a855f7;
          --c-black: #000000;
          --surface: #ffffff;
          --surface-2: #fcfbf9;
          --border: #000000;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        html { background-color: var(--bg-warm); }
        
        body {
          background-color: var(--bg-warm);
          color: var(--text-dark);
          font-family: var(--sans);
          line-height: 1.5;
          padding: 1.5rem;
        }

        /* ─── APP SHELL ─── */
        .app-layout {
          display: flex;
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
          align-items: start;
        }

        @media (max-width: 991px) {
          .app-layout {
            flex-direction: column;
          }
        }

        /* ─── STICKY SIDEBAR ─── */
        .sidebar {
          width: 240px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: sticky;
          top: 1.5rem;
          height: calc(100vh - 3rem);
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        @media (max-width: 991px) {
          .sidebar {
            width: 100%;
            height: auto;
            position: relative;
            top: 0;
          }
        }

        .sidebar-logo {
          font-family: var(--serif);
          font-size: 2.4rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 0.9;
          text-transform: lowercase;
          margin-bottom: 0.25rem;
          color: var(--text-dark);
          cursor: pointer;
        }

        .sidebar-sublogo {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-dark);
          opacity: 0.7;
          margin-top: 0.35rem;
          margin-bottom: 0.75rem;
        }

        /* Colorful Capsules */
        .side-btn {
          border: 1px solid var(--border-dark);
          border-radius: 12px;
          padding: 1rem 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          height: 100px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          text-decoration: none;
          color: #000;
          position: relative;
          outline: none;
        }

        .side-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .side-btn-num {
          font-size: 0.8rem;
          font-weight: 800;
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;
        }

        .side-btn-num span.arrow {
          font-size: 1.1rem;
          font-weight: 400;
        }

        .side-btn-label {
          font-size: 0.85rem;
          font-weight: 800;
          line-height: 1.25;
        }

        /* Specific background styling */
        .side-btn.blue { background-color: var(--c-blue); color: #fff; border-color: transparent; }
        .side-btn.yellow { background-color: var(--c-yellow); border-color: transparent; }
        .side-btn.orange { background-color: var(--c-orange); color: #fff; border-color: transparent; }
        .side-btn.green { background-color: var(--c-green); color: #fff; border-color: transparent; }
        
        .side-btn.blue:hover { box-shadow: 0 4px 15px rgba(0, 102, 204, 0.4); }
        .side-btn.yellow:hover { box-shadow: 0 4px 15px rgba(252, 185, 0, 0.4); }
        .side-btn.orange:hover { box-shadow: 0 4px 15px rgba(255, 85, 0, 0.4); }
        .side-btn.green:hover { box-shadow: 0 4px 15px rgba(0, 179, 60, 0.4); }

        .side-cta-btn {
          background-color: var(--c-purple);
          color: #fff;
          border: 1px solid var(--border-dark);
          border-radius: 12px;
          padding: 1rem;
          font-weight: 800;
          font-size: 0.85rem;
          text-align: center;
          cursor: pointer;
          transition: transform 0.15s;
          display: block;
          text-decoration: none;
          outline: none;
        }
        .side-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
        }

        .side-lang-btn {
          background-color: #000;
          color: #fff;
          border-radius: 12px;
          padding: 0.8rem 1.1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
        }

        .side-socials {
          background-color: #000;
          color: #fff;
          border-radius: 12px;
          padding: 0.8rem 1.1rem;
          display: flex;
          justify-content: space-around;
          align-items: center;
        }

        .side-social-icon {
          color: #fff;
          text-decoration: none;
          transition: color 0.15s;
          display: flex;
          align-items: center;
        }
        .side-social-icon:hover {
          color: var(--c-yellow);
        }

        /* ─── MAIN CONTENT ─── */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          min-width: 0;
        }

        /* ─── TRENDING HEADER CARD ─── */
        .trending-header-card {
          background-color: #ffffff;
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 2.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }

        .trending-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .trending-title {
          font-family: var(--serif);
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #000;
        }

        .search-box-wrap {
          flex: 1;
          min-width: 260px;
          max-width: 400px;
        }

        .search-box-input {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          font-family: var(--sans);
          font-size: 0.9rem;
          color: #000;
          outline: none;
          transition: border-color 0.15s;
        }
        .search-box-input:focus {
          border-color: var(--c-orange);
        }

        /* Sorting tabs */
        .sort-tabs-container {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1.5px solid rgba(0,0,0,0.06);
          padding-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .sort-tab-btn {
          background: transparent;
          border: 1px solid transparent;
          color: #666;
          padding: 0.5rem 1rem;
          font-family: var(--sans);
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s;
          outline: none;
        }
        .sort-tab-btn:hover {
          color: #000;
          background: rgba(0,0,0,0.02);
        }
        .sort-tab-btn.active {
          background: var(--c-orange);
          color: #fff;
          border-color: var(--c-orange);
        }

        /* ─── CATEGORY FILTER CHIPS ─── */
        .category-filters-container {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .cat-chip-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: #000;
          padding: 0.45rem 0.9rem;
          font-family: var(--sans);
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s;
          outline: none;
        }
        .cat-chip-btn:hover {
          background: rgba(0,0,0,0.05);
        }
        .cat-chip-btn.active {
          background: #000;
          color: #fff;
          border-color: #000;
        }

        /* ─── CAPSULE NEWS CARD LIST ─── */
        .news-capsule {
          border: 1px solid var(--border-dark);
          border-radius: 16px;
          padding: 1.5rem 1.8rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          min-height: 120px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          text-decoration: none;
          color: #000;
          position: relative;
          outline: none;
        }
        .news-capsule:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .news-capsule.blue { background-color: var(--c-blue); color: #fff; border-color: transparent; }
        .news-capsule.yellow { background-color: var(--c-yellow); border-color: transparent; }
        .news-capsule.orange { background-color: var(--c-orange); color: #fff; border-color: transparent; }
        .news-capsule.green { background-color: var(--c-green); color: #fff; border-color: transparent; }
        .news-capsule.purple { background-color: var(--c-purple); color: #fff; border-color: transparent; }

        .news-capsule.blue:hover { box-shadow: 0 4px 15px rgba(0, 102, 204, 0.4); }
        .news-capsule.yellow:hover { box-shadow: 0 4px 15px rgba(252, 185, 0, 0.4); }
        .news-capsule.orange:hover { box-shadow: 0 4px 15px rgba(255, 85, 0, 0.4); }
        .news-capsule.green:hover { box-shadow: 0 4px 15px rgba(0, 179, 60, 0.4); }
        .news-capsule.purple:hover { box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4); }

        .news-capsule-top {
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: flex-start;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          opacity: 0.8;
          margin-bottom: 0.75rem;
        }
        
        .news-capsule-title {
          font-family: var(--serif);
          font-size: 1.6rem;
          font-weight: 900;
          line-height: 1.25;
          margin-bottom: 1.5rem;
        }

        .news-capsule-bottom {
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: flex-end;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        /* ─── READER MODAL SYSTEM ─── */
        .reader-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 1rem;
        }

        .reader-modal-box {
          background-color: #fcfbf9;
          border: 2px solid var(--border-dark);
          border-radius: 24px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 3rem;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          position: relative;
          color: #000;
          animation: readerModalFade 0.25s ease-out;
        }

        @keyframes readerModalFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reader-close-btn {
          position: absolute;
          top: 1.5rem; right: 1.5rem;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s;
        }
        .reader-close-btn:hover {
          transform: scale(1.1);
        }

        /* Dossier Header */
        .reader-header {
          border-bottom: 2px solid #000;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        }

        .reader-meta-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 1rem;
        }

        .reader-category-badge {
          background: #000;
          color: #fff;
          padding: 3px 10px;
          border-radius: 4px;
        }

        .reader-title {
          font-family: var(--serif);
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #000;
        }

        /* Core conflict card */
        .reader-conflict-box {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-left: 6px solid var(--c-orange);
          padding: 1.5rem 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .reader-conflict-title {
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--c-orange);
          margin-bottom: 0.5rem;
        }

        .reader-conflict-text {
          font-family: var(--serif);
          font-size: 1.15rem;
          font-style: italic;
          line-height: 1.6;
          color: #111;
        }

        .reader-clash-hero {
          background: linear-gradient(135deg, #111111 0%, #1f2937 100%);
          color: #fff;
          border-radius: 22px;
          padding: 1.35rem 1.45rem;
          margin-bottom: 1.25rem;
          box-shadow: 0 14px 34px rgba(0,0,0,0.14);
        }

        .reader-clash-hero-kicker {
          font-size: 0.68rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--c-yellow);
          margin-bottom: 0.4rem;
        }

        .reader-clash-hero-title {
          font-size: 1rem;
          font-weight: 800;
          line-height: 1.45;
          margin-bottom: 0.35rem;
        }

        .reader-clash-hero-body {
          font-size: 0.93rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.92);
        }

        /* Left/Right grid */
        .reader-perspectives {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        @media (max-width: 768px) {
          .reader-perspectives {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .reader-persp-card {
          border: 1px solid var(--border-dark);
          border-radius: 16px;
          padding: 2rem;
          position: relative;
        }

        .reader-persp-card.left {
          background: #eff6ff;
          border-color: #93c5fd;
          border-top: 6px solid var(--c-blue);
        }

        .reader-persp-card.right {
          background: #fef2f2;
          border-color: #fca5a5;
          border-top: 6px solid #dc2626;
        }

        .reader-persp-label {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 10px;
          border-radius: 4px;
          color: #fff;
          margin-bottom: 1rem;
        }

        .reader-persp-label.left { background: var(--c-blue); }
        .reader-persp-label.right { background: #dc2626; }

        .reader-persp-summary {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #222;
          margin-bottom: 1.25rem;
          font-weight: 500;
        }

        .reader-section-title {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #555;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }

        .reader-points-list {
          list-style: none;
          padding: 0;
        }

        .reader-points-list li {
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 0.5rem;
          padding-left: 1.25rem;
          position: relative;
          color: #333;
        }

        .reader-points-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #666;
          font-weight: bold;
        }

        .reader-highlight {
          font-size: 0.88rem;
          line-height: 1.5;
          color: #222;
          padding: 0.75rem 1rem;
          background: rgba(0,0,0,0.03);
          border-left: 3px solid;
          border-radius: 0 6px 6px 0;
        }

        /* The Brutal Reality Block */
        .reader-reality-section {
          margin-bottom: 2.5rem;
        }

        .dossier-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 2rem;
          align-items: start;
        }

        .dossier-sidebar {
          position: sticky;
          top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .dossier-conflict-compact {
          background: #fcfcfc;
          border: 1px solid var(--border-dark);
          border-radius: 12px;
          padding: 1rem;
        }

        .dossier-conflict-compact-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #888;
          font-weight: 800;
          margin-bottom: 0.4rem;
        }

        .dossier-conflict-compact-text {
          font-size: 0.82rem;
          font-style: italic;
          color: #333;
          line-height: 1.45;
        }

        .dossier-story-block {
          background: #fcfcfc;
          border: 1px solid var(--border-dark);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .dossier-deep-dive {
          background: #f8f7f4;
          border: 1px solid var(--border-dark);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 900px) {
          .dossier-layout {
            grid-template-columns: 1fr;
          }

          .dossier-sidebar {
            position: static;
            order: 2;
          }
        }

        .reader-reality-card {
          background: #111;
          color: #fff;
          border-radius: 16px;
          padding: 2.5rem;
          border: 1px solid #000;
          position: relative;
          overflow: hidden;
        }

        .reader-reality-card::before {
          content: "TRUTH";
          position: absolute;
          right: -20px;
          bottom: -20px;
          font-size: 6rem;
          font-weight: 950;
          color: rgba(255,255,255,0.03);
          font-family: var(--sans);
          pointer-events: none;
        }

        .reader-reality-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--c-yellow);
          margin-bottom: 1rem;
        }

        .reader-reality-text {
          font-family: var(--serif);
          font-size: 1.25rem;
          line-height: 1.7;
          color: #f3f4f6;
        }

        /* Sources */
        .reader-sources-title {
          font-family: var(--serif);
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          border-bottom: 1px solid #ddd;
          padding-bottom: 0.5rem;
        }

        .reader-sources-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .reader-sources-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .reader-source-item {
          background: #fff;
          border: 1px solid var(--border-dark);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-decoration: none;
          color: #000;
          transition: transform 0.15s;
        }
        .reader-source-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .reader-source-name {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--c-blue);
        }

        .reader-source-title {
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-right: 0.5rem;
          flex: 1;
        }

        /* ─── MODAL DIALOGS ─── */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }

        .modal-box {
          background-color: var(--bg-warm);
          border: 2px solid var(--border-dark);
          border-radius: 20px;
          max-width: 500px;
          width: 100%;
          padding: 2.2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          position: relative;
          color: #000;
          animation: modalFade 0.25s ease;
        }

        @keyframes modalFade {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-title {
          font-family: var(--serif);
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .modal-body {
          font-size: 0.95rem;
          line-height: 1.55;
          margin-bottom: 1.5rem;
        }

        .modal-close-btn {
          position: absolute;
          top: 1.25rem; right: 1.25rem;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #000;
          display: flex;
          align-items: center;
        }

        .logout-link {
          background: none;
          border: none;
          color: #ff9e9e;
          font-size: 0.72rem;
          padding: 0;
          margin-top: 0.2rem;
          cursor: pointer;
          text-decoration: underline;
          font-weight: 600;
          text-align: left;
        }
        .logout-link:hover {
          color: #ffffff;
        }
        .user-email-truncate {
          font-size: 0.8rem;
          font-weight: bold;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #ffffff;
        }
        .logged-in-box {
          cursor: default !important;
        }

        /* ─── FOOTER ─── */
        .page-footer {
          text-align: center;
          padding: 2rem 0;
          border-top: 1px solid rgba(0,0,0,0.1);
          margin-top: 3rem;
          font-size: 0.7rem;
          color: var(--text-dark);
          opacity: 0.5;
        }

        /* Loading / Center states */
        .loading-center, .error-center, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          font-weight: 800;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid var(--border);
        }

        /* Claims Ledger Table */
        .reader-table-section {
          margin-bottom: 2.5rem;
        }
        .reader-table-title {
          font-family: var(--serif);
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          border-bottom: 1px solid #ddd;
          padding-bottom: 0.5rem;
        }
        .reader-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--border-dark);
          border-radius: 12px;
          background: #fff;
        }
        .reader-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          text-align: left;
        }
        .reader-table th {
          background: #f9f8f6;
          border-bottom: 2px solid var(--border-dark);
          padding: 1rem;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
          color: #444;
        }
        .reader-table td {
          padding: 1rem;
          border-bottom: 1px solid #eee;
          vertical-align: top;
          line-height: 1.5;
        }
        .reader-table tr:last-child td {
          border-bottom: none;
        }
        .verdict-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid;
          white-space: nowrap;
        }
        .verdict-badge.true { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
        .verdict-badge.false { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
        .verdict-badge.misleading { background: #fef3c7; color: #d97706; border-color: #fde68a; }
        .verdict-badge.unverified { background: #f3f4f6; color: #4b5563; border-color: #e5e7eb; }
        
        .source-link {
          color: var(--c-blue);
          text-decoration: underline;
          font-weight: 700;
        }
        .source-link:hover {
          color: #000;
        }
      `}</style>

      <div className="app-layout">
        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside className="sidebar">
          <Link href="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
            only <br /> the truth
            <div className="sidebar-sublogo">Independent Bias Tracker</div>
          </Link>
          
          {userEmail ? (
            <div className="side-btn blue logged-in-box">
              <div className="side-btn-num">★</div>
              <div className="side-btn-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Logged in as</span>
                <span className="user-email-truncate" title={userEmail}>{userEmail}</span>
                <button className="logout-link" onClick={handleLogout}>Log Out</button>
              </div>
            </div>
          ) : (
            <button className="side-btn blue" onClick={() => setShowLoginModal(true)}>
              <div className="side-btn-num">01 <span className="arrow">↗</span></div>
              <div className="side-btn-label">Login or Sign Up</div>
            </button>
          )}
          
          <Link href="/?focus=verify" className="side-btn yellow">
            <div className="side-btn-num">02 <span className="arrow">↗</span></div>
            <div className="side-btn-label">Fact Check Social Media</div>
          </Link>
          
          <Link href="/trending" className="side-btn orange">
            <div className="side-btn-num">03 <span className="arrow">↗</span></div>
            <div className="side-btn-label">Trending</div>
          </Link>
          
          <Link href="/?focus=news" className="side-btn green">
            <div className="side-btn-num">04 <span className="arrow">↗</span></div>
            <div className="side-btn-label">Newsfeed</div>
          </Link>
          
          <button className="side-cta-btn" onClick={() => setShowAboutModal(true)}>
            About Us
          </button>
          
          <div className="side-lang-btn">
            <span>English</span>
            <span>🌐</span>
          </div>
          
          <div className="side-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="side-social-icon">
              <Instagram size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="side-social-icon">
              <Facebook size={18} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="side-social-icon">
              <Youtube size={18} />
            </a>
          </div>
        </aside>

        {/* ═══ MAIN RIGHT CONTAINER ═══ */}
        <main className="main-content">
          {/* Header Card */}
          <section className="trending-header-card">
            <div className="trending-header-top">
              <h2 className="trending-title">Trending Scans</h2>
              <div className="search-box-wrap">
                <input
                  className="search-box-input"
                  type="text"
                  placeholder="Search scanned topics..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Sorting Tabs */}
            <div className="sort-tabs-container">
              <button 
                className={`sort-tab-btn ${sortBy === 'trending' ? 'active' : ''}`}
                onClick={() => setSortBy('trending')}
              >
                Most Searched
              </button>
              <button 
                className={`sort-tab-btn ${sortBy === 'newest_uploaded' ? 'active' : ''}`}
                onClick={() => setSortBy('newest_uploaded')}
              >
                Newest Videos
              </button>
              <button 
                className={`sort-tab-btn ${sortBy === 'newest_scans' ? 'active' : ''}`}
                onClick={() => setSortBy('newest_scans')}
              >
                Newest Scans
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="category-filters-container">
              <button 
                className={`cat-chip-btn ${selectedCategory === 'INDIAN_POLITICS' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('INDIAN_POLITICS')}
              >
                Indian Politics
              </button>
              <button 
                className={`cat-chip-btn ${selectedCategory === 'US_POLITICS' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('US_POLITICS')}
              >
                US Politics
              </button>
              <button 
                className={`cat-chip-btn ${selectedCategory === 'WORLD_NEWS' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('WORLD_NEWS')}
              >
                World News
              </button>
              <button 
                className={`cat-chip-btn ${selectedCategory === 'CRIMES_AGAINST_WOMEN' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('CRIMES_AGAINST_WOMEN')}
              >
                Crimes Against Women
              </button>
              <button 
                className={`cat-chip-btn ${selectedCategory === 'OTHERS' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('OTHERS')}
              >
                Others
              </button>
            </div>
          </section>

          {/* Scans List Grid */}
          {loading && (
            <div className="loading-center">Loading trending scans database...</div>
          )}

          {error && (
            <div className="error-center">✕ {error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">
              <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📰</p>
              <p>No scans match your search. Go to <Link href="/" style={{ color: 'var(--c-blue)', textDecoration: 'underline' }}>Verify</Link> to check a new Instagram Reel.</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filtered.map((reel, idx) => {
                const uploadDate = reel.data?.uploadedAt 
                  ? new Date(reel.data.uploadedAt) 
                  : new Date(reel.created_at);
                const uploadDateStr = uploadDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                const cycleClasses = ['blue', 'yellow', 'orange', 'green', 'purple'];
                const selectedColorClass = cycleClasses[idx % cycleClasses.length];
                
                return (
                  <Link
                    key={reel.id}
                    href={`/?url=${encodeURIComponent(reel.url)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedReel(reel);
                      setShowAllSources(false);
                    }}
                    className={`news-capsule ${selectedColorClass}`}
                  >
                    <div className="news-capsule-top">
                      <span>{reel.category || reel.data?.category || 'News'}</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 400 }}>↗</span>
                    </div>
                    <div className="news-capsule-title">
                      {reel.topic || reel.data?.headline || 'News Story Scan'}
                    </div>
                    <div className="news-capsule-bottom">
                      <span>{reel.view_count || 1} scans</span>
                      <span>Posted: {uploadDateStr}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* page-footer */}
          <div className="page-footer">
            Only The Truth · Independent media bias analysis · Not affiliated with any political organization
          </div>
        </main>
      </div>

      {/* ═══ MODAL 01: LOGIN DIALOG ═══ */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowLoginModal(false)}>
              <X size={20} />
            </button>
            <h3 className="modal-title">Join Only The Truth</h3>
            <p className="modal-body">
              Log in or create a free account to track media narratives, bookmark scans, configure custom alert thresholds, and contribute rating reviews.
            </p>
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={inputEmail}
                onChange={e => setInputEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.9rem', border: '1px solid var(--border-dark)', borderRadius: '8px', fontSize: '0.85rem', color: '#000', backgroundColor: '#fff' }} 
              />
              <button 
                type="submit"
                className="side-cta-btn" 
                style={{ border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Continue with Email
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL 02: ABOUT US DIALOG ═══ */}
      {showAboutModal && (
        <div className="modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAboutModal(false)}>
              <X size={20} />
            </button>
            <h3 className="modal-title">About Only The Truth</h3>
            <p className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span>
                <strong>Only The Truth</strong> is an open-source global news polarization index established in 2025.
              </span>
              <span>
                Mainstream media reporting across the world is highly polarized. By tracking the exact framing of opposing narratives, we present a Semafor-style balanced overview.
              </span>
              <span>
                We query thousands of news sources and social media posts, analyzing left-leaning and right-leaning frames to help citizens spot the spin, decode media bias, and think critically.
              </span>
            </p>
            <button 
              className="side-cta-btn" 
              onClick={() => setShowAboutModal(false)}
              style={{ border: 'none', borderRadius: '8px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ═══ MODAL 03: NEWS READER DOSSIER MODAL ═══ */}
      {selectedReel && (
        <div className="reader-modal-overlay" onClick={() => setSelectedReel(null)}>
          <div className="reader-modal-box" onClick={e => e.stopPropagation()}>
            <button className="reader-close-btn" onClick={() => setSelectedReel(null)}>
              <X size={18} />
            </button>
            
            {/* Dossier Header */}
            <div className="reader-header">
              <div className="reader-meta-row">
                <span className="reader-category-badge">
                  {selectedReel.category || selectedReel.data?.category || 'News'}
                </span>
                <span>•</span>
                <span>{selectedReel.view_count || 1} scans</span>
                <span>•</span>
                <span>
                  {selectedReel.created_at
                    ? new Date(selectedReel.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Recent'}
                </span>
              </div>
              <h2 className="reader-title">
                {selectedReel.data?.headline || selectedReel.topic || 'News Story Analysis'}
              </h2>
            </div>

            {/* Dossier body: analysis first, compact embed on side */}
            {(() => {
              const data = selectedReel.data;
              const isPolitical = !!(data?.left || data?.right);
              const embedUrl = data?.pipeline?.normalizedUrl || selectedReel.url;

              return (
                <div className="dossier-layout">
                  <div className="dossier-main">
                    {!isPolitical && data?.fight && (
                      <div className="dossier-story-block">
                        <div className="reader-conflict-title">What Happened</div>
                        <div className="reader-conflict-text" style={{ fontStyle: 'normal' }}>{data.fight}</div>
                      </div>
                    )}

                    {isPolitical && data?.fight && (
                      <div className="reader-clash-hero">
                        <div className="reader-clash-hero-kicker">Core clash</div>
                        <div className="reader-clash-hero-title">{(data.fight || '').split('\n').filter(Boolean)[0] || 'The core clash'}</div>
                        <div className="reader-clash-hero-body">{(data.fight || '').split('\n').slice(1).join(' ').trim()}</div>
                      </div>
                    )}

                    {isPolitical && (data?.left || data?.right) && (
                      <div className="reader-perspectives">
                        {data?.left && (
                          <div className="reader-persp-card left">
                            <span className="reader-persp-label left">Left Side Argument</span>
                            <p className="reader-persp-summary">{data.left.summary}</p>
                            {data.left.keyPoints && data.left.keyPoints.length > 0 && (
                              <>
                                <div className="reader-section-title">Key narrative points</div>
                                <ul className="reader-points-list">
                                  {data.left.keyPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                                </ul>
                              </>
                            )}
                            {data.left.strongestPoint && (
                              <>
                                <div className="reader-section-title">Strongest argument</div>
                                <div className="reader-highlight" style={{ borderLeftColor: 'var(--c-blue)' }}>
                                  {data.left.strongestPoint}
                                </div>
                              </>
                            )}
                            {data.left.blindSpot && (
                              <>
                                <div className="reader-section-title">Blind spot</div>
                                <div className="reader-highlight" style={{ borderLeftColor: 'var(--c-blue)' }}>
                                  {data.left.blindSpot}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        {data?.right && (
                          <div className="reader-persp-card right">
                            <span className="reader-persp-label right">Right Side Argument</span>
                            <p className="reader-persp-summary">{data.right.summary}</p>
                            {data.right.keyPoints && data.right.keyPoints.length > 0 && (
                              <>
                                <div className="reader-section-title">Key narrative points</div>
                                <ul className="reader-points-list">
                                  {data.right.keyPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                                </ul>
                              </>
                            )}
                            {data.right.strongestPoint && (
                              <>
                                <div className="reader-section-title">Strongest argument</div>
                                <div className="reader-highlight" style={{ borderLeftColor: '#dc2626' }}>
                                  {data.right.strongestPoint}
                                </div>
                              </>
                            )}
                            {data.right.blindSpot && (
                              <>
                                <div className="reader-section-title">Blind spot</div>
                                <div className="reader-highlight" style={{ borderLeftColor: '#dc2626' }}>
                                  {data.right.blindSpot}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {data?.reality && (
                      isPolitical ? (
                        <div className="reader-reality-section">
                          <div className="reader-reality-card">
                            <div className="reader-reality-header">
                              <span>✦ The Brutal Reality ✦</span>
                            </div>
                            <p className="reader-reality-text">{data.reality}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="dossier-deep-dive">
                          <div className="reader-conflict-title">The Full Story</div>
                          <p className="reader-reality-text" style={{ color: '#222', marginTop: '0.8rem' }}>{data.reality}</p>
                        </div>
                      )
                    )}

                    <ClaimsTable tableData={data?.table} articles={data?.articles} />

                    {data?.articles && data.articles.length > 0 && (() => {
                      const displayedSources = showAllSources ? data.articles : data.articles.slice(0, 6);
                      return (
                        <div>
                          <h3 className="reader-sources-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Verified Sources</span>
                            {data.articles.length > 6 && (
                              <button
                                onClick={() => setShowAllSources(!showAllSources)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--c-blue)',
                                  fontWeight: 800,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  padding: '0 0.5rem'
                                }}
                              >
                                {showAllSources ? 'View Less' : `View More (${data.articles.length - 6} more)`}
                              </button>
                            )}
                          </h3>
                          <div className="reader-sources-grid">
                            {displayedSources.map((art: any, i: number) => (
                              <a 
                                key={i} 
                                href={art.link || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="reader-source-item"
                              >
                                <span className="reader-source-title">{art.title}</span>
                                <span className="reader-source-name">{art.source} ↗</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Sidebar: compact embed only */}
                  <aside className="dossier-sidebar">
                    <InstagramEmbed url={embedUrl} compact />
                  </aside>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <Script 
        src="https://www.instagram.com/embed.js" 
        strategy="afterInteractive" 
        onLoad={() => {
          if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
          }
        }}
      />
    </>
  );
}
