import React from 'react';

// Retro woodcut-style SVGs
export const RetroTypewriter = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" stroke="#1a0800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {/* Paper sheet */}
    <path d="M30 15h40v20H30z" fill="#f5e9cc" />
    <path d="M35 20h30M35 25h20M35 30h25" strokeWidth="1" />
    {/* Roller */}
    <rect x="20" y="32" width="60" height="8" rx="2" fill="#1a0800" />
    {/* Body */}
    <path d="M15 40h70v35c0 5-5 10-10 10H25c-5 0-10-5-10-10V40z" fill="#eeddb5" />
    <path d="M15 48h70" />
    {/* Keyboard plate */}
    <path d="M22 55h56v22H22z" fill="#f5e9cc" />
    {/* Keys */}
    <circle cx="28" cy="60" r="2.5" fill="#1a0800" />
    <circle cx="38" cy="60" r="2.5" fill="#1a0800" />
    <circle cx="48" cy="60" r="2.5" fill="#1a0800" />
    <circle cx="58" cy="60" r="2.5" fill="#1a0800" />
    <circle cx="68" cy="60" r="2.5" fill="#1a0800" />
    <circle cx="72" cy="60" r="2.5" fill="#1a0800" />
    <circle cx="33" cy="67" r="2.5" fill="#1a0800" />
    <circle cx="43" cy="67" r="2.5" fill="#1a0800" />
    <circle cx="53" cy="67" r="2.5" fill="#1a0800" />
    <circle cx="63" cy="67" r="2.5" fill="#1a0800" />
    {/* Spacebar */}
    <rect x="35" y="72" width="30" height="3" rx="1.5" fill="#1a0800" />
    {/* Brand label */}
    <text x="50" y="46" fontFamily="serif" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#1a0800">ROYAL</text>
  </svg>
);

export const RetroCamera = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" stroke="#1a0800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {/* Flash bulb / mount */}
    <path d="M42 25h16v8H42z" fill="#eeddb5" />
    <circle cx="50" cy="20" r="7" fill="#f5e9cc" />
    <circle cx="50" cy="20" r="2" fill="#1a0800" />
    {/* Shutter button */}
    <path d="M22 30h8v3h-8zM70 30h8v3h-8z" fill="#1a0800" />
    {/* Body */}
    <rect x="15" y="33" width="70" height="47" rx="6" fill="#eeddb5" />
    <rect x="18" y="36" width="64" height="41" rx="4" fill="none" strokeDasharray="3 3" />
    {/* Leatherette middle grip */}
    <rect x="15" y="45" width="70" height="23" fill="#1a0800" />
    {/* Lens rings */}
    <circle cx="50" cy="56" r="19" fill="#eeddb5" strokeWidth="2.5" />
    <circle cx="50" cy="56" r="14" fill="#1a0800" />
    <circle cx="50" cy="56" r="8" fill="#eeddb5" />
    <circle cx="50" cy="56" r="4" fill="#1a0800" />
    {/* Viewfinder window */}
    <rect x="24" y="39" width="10" height="6" rx="1" fill="#f5e9cc" />
  </svg>
);

export const RetroBicycle = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" stroke="#1a0800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {/* Rear Wheel */}
    <circle cx="28" cy="65" r="18" fill="none" strokeWidth="2" />
    <circle cx="28" cy="65" r="15" strokeWidth="0.8" strokeDasharray="1 3" />
    <circle cx="28" cy="65" r="2" fill="#1a0800" />
    {/* Front Wheel */}
    <circle cx="72" cy="65" r="18" fill="none" strokeWidth="2" />
    <circle cx="72" cy="65" r="15" strokeWidth="0.8" strokeDasharray="1 3" />
    <circle cx="72" cy="65" r="2" fill="#1a0800" />
    {/* Frame */}
    <path d="M28 65l16-24H68l4 24M28 65l22 0M44 41l12 24M44 41h24L56 65" />
    {/* Seat post & Seat */}
    <path d="M40 47l4-6" />
    <path d="M37 41h12" strokeWidth="2.5" />
    {/* Handlebars */}
    <path d="M68 41l1-8" />
    <path d="M63 33h10M73 33c2 0 4 2 4 4" strokeWidth="2" />
    {/* Pedals & Chain ring */}
    <circle cx="56" cy="65" r="4" fill="none" />
    <path d="M52 61l8 8M50 61h4M58 69h4" />
  </svg>
);

export const RetroGramophone = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" stroke="#1a0800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {/* Box Base */}
    <rect x="25" y="60" width="50" height="22" rx="2" fill="#eeddb5" />
    <path d="M25 66h50M25 76h50" />
    <circle cx="65" cy="71" r="2" fill="#1a0800" /> {/* Crank hook */}
    <path d="M67 71h5v5" />
    {/* Turntable plate */}
    <ellipse cx="50" cy="58" rx="20" ry="4" fill="#1a0800" />
    {/* Big Speaker Horn */}
    <path d="M42 54C42 42 30 35 20 30c0 0-5-2-4-5s10-1 10-1c15 5 28 20 32 30" fill="#eeddb5" />
    {/* Horn Flare */}
    <path d="M20 30c-5-5-2-12 5-16s15 1 20 6c4 5 1 12-5 16s-16-1-20-6z" fill="#1a0800" opacity="0.15" />
    <ellipse cx="20" cy="22" rx="8" ry="12" transform="rotate(-30 20 22)" strokeWidth="2" fill="#eeddb5" />
    {/* Arm / Needle */}
    <path d="M65 60v-8l-12 5" />
    <circle cx="53" cy="57" r="1.5" fill="#1a0800" />
  </svg>
);

export const RetroTelephone = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" stroke="#1a0800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {/* Base pyramid */}
    <path d="M30 75l6-30h28l6 30H30z" fill="#eeddb5" />
    {/* Dial ring */}
    <circle cx="50" cy="62" r="10" fill="#f5e9cc" />
    <circle cx="50" cy="62" r="7" strokeDasharray="2 2" />
    <circle cx="50" cy="62" r="2" fill="#1a0800" />
    {/* Cradle forks */}
    <path d="M42 45v-6h16v6M42 39h16" />
    {/* Handset */}
    <path d="M20 32c5-3 15-5 30-5s25 2 30 5c3 4 1 8-3 8-10-3-22-4-27-4s-17 1-27 4c-4 0-6-4-3-8z" fill="#1a0800" />
    {/* Cord hook */}
    <path d="M30 65c-4 4-8 4-8 8s4 4 8 4 8-4 8-8" strokeWidth="1.2" strokeDasharray="2 2" />
  </svg>
);

export const CoffeeStain = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" style={{ opacity: 0.12, pointerEvents: 'none' }}>
    {/* Outer ring */}
    <circle cx="50" cy="50" r="42" stroke="#6b4c28" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="120 10 50 15 80 5" />
    {/* Inner ring offset */}
    <circle cx="49" cy="51" r="40" stroke="#6b4c28" strokeWidth="0.8" strokeDasharray="40 30 90 20" />
    {/* Drips and splashes */}
    <path d="M85 62c2 1 4 0 4-2s-2-2-4 0z" fill="#6b4c28" />
    <path d="M12 40c1 3-1 4-3 2s0-3 3-2z" fill="#6b4c28" />
    <path d="M48 91c-1 2-3 1-3-1s2-2 3 0z" fill="#6b4c28" />
  </svg>
);
