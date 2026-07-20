'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { supabase } from '@/lib/supabaseClient';
import { Instagram, Facebook, Youtube, X, Search, FileText, TrendingUp } from '@/components/Icons';
import NewspaperFeed from '@/components/NewspaperFeed';
import InstagramEmbed from '@/components/InstagramEmbed';
import ClaimsTable from '@/components/ClaimsTable';
import MobileDossier from '@/components/MobileDossier';
import { Compass, BookOpen, Flame, User } from 'lucide-react';

/* ─── TYPES ─── */
interface AnalysisResult {
  headline?: string;
  table?: { said: string; truth: string; verdict: string; source: string; link?: string }[];
  left?: { summary: string; keyPoints: string[]; strongestPoint: string; blindSpot: string };
  right?: { summary: string; keyPoints: string[]; strongestPoint: string; blindSpot: string };
  fight?: string;
  reality?: string;
  articles?: { title: string; source: string; link: string }[];
  uploadedAt?: string;
  viewCount?: number;
  category?: string;
  pipeline?: any;
}

const translations = {
  EN: {
    heroTitle: "Making humans critical thinkers again.",
    heroSubtext: "Scan any video from Instagram, YouTube or TikTok - we fact-check every claim across hundreds of sources and give you only the truth.",
    factCheckBtn: "Fact Check",
    scanningBtn: "Scanning...",
    inputPlaceholder: "Paste any video link to fact-check",
    aboutUsBtn: "About Us",
    loginBtn: "Login / Sign Up",
    logoutBtn: "Log Out",
    loggedInAs: "Logged in as",
    trendingBtn: "Trending",
    newsfeedBtn: "Newsfeed",
    aboutTitle: "About Only The Truth",
  },
  HI: {
    heroTitle: "मनुष्यों को फिर से आलोचनात्मक विचारक बनाना।",
    heroSubtext: "इंस्टाग्राम, यूट्यूब या टिकटॉक से किसी भी वीडियो को स्कैन करें - हम सैकड़ों स्रोतों से हर दावे की जांच करते हैं और आपको केवल सच दिखाते हैं।",
    factCheckBtn: "सत्य जांचें",
    scanningBtn: "जांच जारी है...",
    inputPlaceholder: "सत्य जांचने के लिए वीडियो लिंक पेस्ट करें",
    aboutUsBtn: "हमारे बारे में",
    loginBtn: "लॉगिन / साइन अप",
    logoutBtn: "लॉग आउट",
    loggedInAs: "लॉग इन किया है:",
    trendingBtn: "ट्रेंडिंग",
    newsfeedBtn: "समाचार फ़ीड",
    aboutTitle: "ओनली द ट्रुथ के बारे में",
  },
  HIN: {
    heroTitle: "Humans ko fir se critical thinkers banana.",
    heroSubtext: "Instagram, YouTube ya TikTok ka koi bhi video scan karein - hum hundreds of sources se har claim fact-check karte hain aur aapko dete hain sirf sach.",
    factCheckBtn: "Fact Check Karein",
    scanningBtn: "Scanning ho rahi hai...",
    inputPlaceholder: "Fact check karne ke liye video link paste karein",
    aboutUsBtn: "About Us",
    loginBtn: "Login / Sign Up",
    logoutBtn: "Logged in as",
    loggedInAs: "Logged in as",
    trendingBtn: "Trending",
    newsfeedBtn: "Newsfeed",
    aboutTitle: "Only The Truth Ke Baare Mein",
  }
};

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

const WEIRD_FACTS = [
  "Bananas are berries, but strawberries aren't.",
  "Wombat poop is cube-shaped, which stops it from rolling away.",
  "Honey never spoils; you can eat 3,000-year-old Egyptian tomb honey.",
  "Sea otters hold hands when they sleep so they don't drift apart.",
  "The world's quietest room is so quiet you can hear your own heartbeat and bones grinding.",
  "A day on Venus is longer than a year on Venus.",
  "Cows have best friends and get stressed when they are separated.",
  "Sloths can hold their breath longer than dolphins can.",
  "An octopus has three hearts, nine brains, and blue blood.",
  "The first person convicted of speeding was going 8 mph in a 2 mph zone.",
  "Water makes a different sound when it is hot compared to when it is cold.",
  "The heaviest organism on Earth is Pando, a single forest of aspen trees sharing one root system.",
  "Human teeth are just as strong as shark teeth.",
  "Pineapples take nearly two years to grow from a single seed.",
  "Flamingos are pink only because of the shrimp and algae they eat.",
  "Before the eraser was invented, stale bread crumbs were used to wipe pencil marks.",
  "The tongue of a blue whale is heavier than an entire adult elephant.",
  "Butterflies taste food using receptors on their feet.",
  "Human bone is about five times stronger than steel of the same weight.",
  "A bolt of lightning is five times hotter than the surface of the sun.",
  "Rain contains vitamin B12.",
  "The Eiffel Tower can grow up to 6 inches taller during hot summers.",
  "Sea cucumbers breathe through their anus.",
  "A single strand of spaghetti is called a spaghetto.",
  "Sarcastic comments can boost creativity and critical thinking.",
  "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
  "There are more trees on Earth than stars in the Milky Way.",
  "Sharks existed before trees and Saturn's rings.",
  "A snail can sleep for up to three years.",
  "The wood frog can hold its pee for up to eight months.",
  "The heart of a shrimp is located in its head.",
  "Polar bear skin is black, and their fur is actually hollow and clear.",
  "There are more possible iterations of a game of chess than atoms in the observable universe.",
  "The unicorn is the national animal of Scotland.",
  "It is physically impossible for pigs to look up into the sky.",
  "Kangaroos can't walk backwards.",
  "A group of crows is called a murder.",
  "The average cloud weighs about 1.1 million pounds (500,000 kg).",
  "Avocados are berries, not vegetables.",
  "Sloths can take up to a month to digest a single leaf.",
  "Apples float in water because they are 25% air.",
  "A cloud of starlings is called a murmuration.",
  "Peanuts are not nuts; they grow underground and are legumes.",
  "The dry valleys in Antarctica haven't seen rain or snow in 2 million years.",
  "Wearing headphones for just an hour increases bacteria in your ear by 700 times.",
  "The dot over a lowercase 'i' or 'j' is called a tittle.",
  "Lobsters taste with their legs and chew with their stomachs.",
  "A flock of flamingos is called a flamboyance.",
  "Glaciers and ice sheets hold about 69 percent of the world's freshwater.",
  "Jellyfish and lobsters are biologically immortal; they don't die of old age.",
  "Cats have 32 muscles in each ear, allowing them to rotate them 180 degrees.",
  "The inventor of the Frisbee was cremated and turned into a Frisbee.",
  "Farting helps reduce high blood pressure and is healthy.",
  "A blue whale's heartbeat can be heard from over two miles away.",
  "Hippopotamus sweat is red and acts as a natural sunscreen.",
  "Venus is the only planet in our solar system that rotates clockwise.",
  "In Switzerland, it is illegal to own just one guinea pig because they get lonely.",
  "The first alarm clock could only ring at 4:00 AM.",
  "Cashew nuts grow on the bottom of yellow apples.",
  "The total weight of all ants on Earth is roughly equal to the total weight of all humans.",
  "Your nose can remember 50,000 different scents.",
  "Koalas have fingerprints that are virtually identical to human fingerprints.",
  "Earth is the only planet in our solar system not named after a mythological god.",
  "An adult human is made up of about 7 octillion atoms.",
  "You lose about 50 to 100 strands of hair every single day.",
  "Worms have five hearts.",
  "The cigarette lighter was invented before the match.",
  "Chewing gum while peeling onions stops you from crying.",
  "Reindeer eyes turn blue in winter to help them see in low light.",
  "Squirrels accidentally plant thousands of new trees each year by forgetting where they hid their nuts.",
  "Honeybees can recognize human faces.",
  "Male ostriches can roar like lions.",
  "Sea otters have a special pocket in their skin to keep their favorite rock.",
  "Cats sleep for 70% of their lives.",
  "A single teaspoon of a neutron star would weigh about 6 billion tons.",
  "The world's oldest toy is a stick.",
  "The first cell phone call was made in 1973 by a Motorola employee calling his rival.",
  "Owls don't have eyeballs; they have eye tubes that are fixed in place.",
  "Hummingbirds are the only birds that can fly backwards.",
  "An ostrich's eye is bigger than its entire brain.",
  "Crocodiles cannot stick their tongue out because it is attached to the roof of their mouth.",
  "Tigers have striped skin, not just striped fur.",
  "A chameleon's tongue is twice the length of its body.",
  "Elephants are the only mammals that cannot jump.",
  "The heart of a blue whale is the size of a small car.",
  "A standard pencil contains enough graphite to draw a line 35 miles long.",
  "Sloths poop only once a week, and it is a major event.",
  "An individual raindrop falls at an average speed of 7 miles per hour.",
  "Scorpions glow a vibrant blue-green color under ultraviolet light.",
  "Humans share 50% of their DNA with bananas.",
  "The tongue is the only muscle in the human body that is attached at only one end.",
  "A standard deck of cards has more possible shuffles than there are seconds since the Big Bang.",
  "Sound travels about four times faster in water than it does in air.",
  "Termites eat wood twice as fast when listening to rock music.",
  "Some turtles can breathe through their butts.",
  "The shortest war in history lasted only 38 minutes between Britain and Zanzibar.",
  "Nutmeg is a hallucinogen if consumed in large quantities.",
  "Ketchup was sold in the 1830s as a medicine for indigestion.",
  "The average human walks the equivalent of three times around the world in their lifetime.",
  "Panthers are not a separate species; they are just leopards or jaguars with black fur."
];

export default function HomePage() {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [scannedUrl, setScannedUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFactIdx, setCurrentFactIdx] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSubmitting) {
      setCurrentFactIdx(Math.floor(Math.random() * 100));
      interval = setInterval(() => {
        setCurrentFactIdx((prev) => (prev + 1) % 100);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSubmitting]);

  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingError, setLoadingError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showAllSources, setShowAllSources] = useState(false);

  // Redesign dynamic states
  const [newsfeedList, setNewsfeedList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'INDIAN_POLITICS' | 'US_POLITICS' | 'WORLD_NEWS' | 'CRIMES_AGAINST_WOMEN' | 'OTHERS'>('INDIAN_POLITICS');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [paymentId, setPaymentId] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [totalScansCount, setTotalScansCount] = useState<number>(0);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [inputEmail, setInputEmail] = useState('');

  const [activeMobileTab, setActiveMobileTab] = useState<'verify' | 'news' | 'trending' | 'profile'>('trending');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileApp, setIsMobileApp] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isLowWidth = typeof window !== 'undefined' && window.innerWidth <= 991;
      setIsMobileApp(isMobileUA || isLowWidth);
    };
    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      const timer = setTimeout(checkMobile, 100);
      return () => {
        window.removeEventListener('resize', checkMobile);
        clearTimeout(timer);
      };
    }
  }, []);

  // Translation & Comment states
  const [currentLang, setCurrentLang] = useState<'EN' | 'HI' | 'HIN'>('EN');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const t = translations[currentLang];

  const [dbError, setDbError] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrorBanner(`Error: ${event.message} at ${event.filename}:${event.lineno}`);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      setErrorBanner(`Unhandled Rejection: ${event.reason}`);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleCopy = (text: string, idx: number) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedIdx(idx);
          setTimeout(() => setCopiedIdx(null), 1500);
        })
        .catch(err => {
          console.error("Clipboard copy failed, using fallback:", err);
          fallbackCopyText(text, idx);
        });
    } else {
      fallbackCopyText(text, idx);
    }
  };

  const fallbackCopyText = (text: string, idx: number) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
      } else {
        console.error("Fallback copy execution returned false");
      }
    } catch (err) {
      console.error("Fallback copy failed with exception:", err);
    }
  };

  // Authentication states
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Main View states
  const [mainView, setMainView] = useState<'home' | 'education'>('home');

  // Education quiz states
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Trending states & scroll
  const [reels, setReels] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'newest_uploaded' | 'newest_scans'>('trending');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loadingTrending, setLoadingTrending] = useState(true);

  const scrollToTrending = () => {
    const el = document.getElementById('trending-scans-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function fetchReels() {
      try {
        setDbError(null);
        const { data, error: dbErr } = await supabase
          .from('instagram_cache')
          .select('*')
          .order('view_count', { ascending: false });

        if (dbErr) throw dbErr;
        setReels(data || []);
      } catch (err: any) {
        console.error(err.message || 'Failed to load trending database.');
        setDbError(err.message || 'Failed to load trending database.');
      } finally {
        setLoadingTrending(false);
      }
    }
    fetchReels();
  }, [result]);

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
        const getScore = (x: any) => {
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

  useEffect(() => {
    // 1. Load initial cached values to keep UI responsive
    setUserEmail(localStorage.getItem('userEmail'));
    setIsPremium(localStorage.getItem('isPremium') === 'true');

    // 2. Fetch fresh session from Supabase to sync status
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || '';
        localStorage.setItem('userEmail', email);
        setUserEmail(email);

        // Retrieve active subscription status from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', session.user.id)
          .single();

        const isPrem = !!profile?.is_premium;
        localStorage.setItem('isPremium', String(isPrem));
        setIsPremium(isPrem);
      }
    });

    // 3. Listen to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        localStorage.setItem('userEmail', email);
        setUserEmail(email);

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', session.user.id)
          .single();

        const isPrem = !!profile?.is_premium;
        localStorage.setItem('isPremium', String(isPrem));
        setIsPremium(isPrem);
      } else {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isPremium');
        setUserEmail(null);
        setIsPremium(false);
      }
      window.dispatchEvent(new Event('storage'));
    });

    // 4. Synchronize across browser tabs
    const handleStorageChange = () => {
      setUserEmail(localStorage.getItem('userEmail'));
      setIsPremium(localStorage.getItem('isPremium') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const handleMobileNav = (tab: 'verify' | 'news' | 'trending' | 'profile') => {
    setResult(null);
    setActiveMobileTab(tab);
    if (window.innerWidth <= 768) {
      window.scrollTo(0, 0);
    }
    if (tab === 'verify') {
      scrollToVerify();
    } else if (tab === 'news') {
      scrollToNews();
    } else if (tab === 'trending') {
      setMainView('home');
      setTimeout(scrollToTrending, 100);
    } else if (tab === 'profile') {
      // Handled inline inside main container
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim() || !password.trim()) return;
    
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: inputEmail.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
          }
        });
        if (error) throw error;
        
        if (data?.user) {
          // Manually upsert profile to public.profiles table in case trigger isn't ready
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              is_premium: false,
              updated_at: new Date().toISOString()
            });
        }
        
        setAuthSuccess("Sign up successful! A confirmation link has been sent to your email. Please check your inbox and verify your email to log in.");
        setInputEmail('');
        setPassword('');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: inputEmail.trim(),
          password: password.trim()
        });
        if (error) throw error;
        if (data?.user) {
          // Manually ensure profile row exists in public.profiles
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              updated_at: new Date().toISOString()
            });

          const email = data.user.email || inputEmail.trim();
          localStorage.setItem('userEmail', email);
          setUserEmail(email);

          // Retrieve active subscription status from profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_premium')
            .eq('id', data.user.id)
            .single();

          const isPrem = !!profile?.is_premium;
          localStorage.setItem('isPremium', String(isPrem));
          setIsPremium(isPrem);

          setShowLoginModal(false);
          setInputEmail('');
          setPassword('');
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch (err: any) {
      console.error("Supabase Auth error:", err.message);
      setAuthError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const utr = paymentId.trim();
    if (!utr) return;
    
    // UPI UTR check: Must be exactly 12 digits
    if (!/^\d{12}$/.test(utr)) {
      setPaymentError("Invalid transaction UTR. Must be exactly 12 digits.");
      return;
    }
    
    setPaymentError('');
    setPaymentLoading(true);
    
    // Simulate real UroPay API request lookup
    setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Sync premium state to Supabase profiles table
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              is_premium: true,
              updated_at: new Date().toISOString()
            });
          if (error) {
            console.error("Failed to update database profile status to premium:", error.message);
          }
        }
      } catch (err) {
        console.error("Auth session fetch error during payment submit:", err);
      }

      setPaymentLoading(false);
      setPaymentSuccess(true);
      // Save premium status to local storage
      localStorage.setItem('isPremium', 'true');
      setIsPremium(true);
      // Clear limits
      localStorage.setItem('unregisteredSearchCount', '0');
      // Dispatch storage event to sync other views
      window.dispatchEvent(new Event('storage'));
    }, 2000);
  };

  const handleLogout = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase signout failed:", err);
    }
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isPremium');
    setIsPremium(false);
    setUserEmail(null);
    setMainView('home');
    window.dispatchEvent(new Event('storage'));
  };

  const tabColors = {
    INDIAN_POLITICS: { bg: 'var(--c-blue)', color: '#fff', badge: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.2)', textMuted: 'rgba(255,255,255,0.7)' },
    US_POLITICS: { bg: 'var(--c-purple)', color: '#fff', badge: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.2)', textMuted: 'rgba(255,255,255,0.7)' },
    WORLD_NEWS: { bg: 'var(--c-yellow)', color: '#000', badge: 'rgba(0,0,0,0.15)', border: 'rgba(0,0,0,0.15)', textMuted: 'rgba(0,0,0,0.6)' },
    CRIMES_AGAINST_WOMEN: { bg: 'var(--c-orange)', color: '#fff', badge: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.2)', textMuted: 'rgba(255,255,255,0.7)' },
    OTHERS: { bg: 'var(--c-green)', color: '#fff', badge: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.2)', textMuted: 'rgba(255,255,255,0.7)' }
  };

  // Auto-analyze from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam) {
      const cleanUrl = decodeURIComponent(urlParam);
      setInstagramUrl(cleanUrl);
      runAnalysis(cleanUrl);
    }
  }, []);

  // Handle scroll focus on page load from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focusParam = params.get('focus');
    if (focusParam === 'verify') {
      setTimeout(scrollToVerify, 400);
    } else if (focusParam === 'news') {
      setTimeout(scrollToNews, 400);
    }
  }, []);

  // Fetch real news of the day (scans) from DB on load
  useEffect(() => {
    async function loadNewsfeed() {
      try {
        setNewsfeedList([]); // Keep newsfeed empty of items

        // Calculate total verified scans count
        const { data: allRows } = await supabase.from('instagram_cache').select('view_count');
        const grandTotal = allRows?.reduce((acc, row) => acc + (row.view_count || 1), 0) || 156;
        setTotalScansCount(grandTotal);
      } catch (err) {
        console.error("Failed to load newsfeed:", err);
        setTotalScansCount(156);
      }
    }
    loadNewsfeed();
  }, [result]);

  // Trigger Instagram embed processing when scannedUrl changes
  useEffect(() => {
    if (scannedUrl) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).instgrm) {
          try {
            (window as any).instgrm.Embeds.process();
            clearInterval(interval);
          } catch (e) {
            console.error("Failed to process Instagram embed:", e);
          }
        }
        if (attempts >= 20) {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [scannedUrl, result]);

  const getInstagramMediaId = (url: string): string | null => {
    if (!url) return null;

    // Matches /reel/ID, /reels/ID, /p/ID, /tv/ID — with or without a
    // username prefix like /username/reel/ID. Also handles /share/p/ID.
    const match =
      url.match(/instagram\.com\/(?:[^/?#]+\/)?(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i) ||
      // Explicit share links: /share/r/ID, /share/p/ID, /share/reel(s)/ID
      url.match(/instagram\.com\/share\/(?:reel|reels|r|p)\/([a-zA-Z0-9_-]+)/i);

    return match?.[1] || null;
  };

  const normalizeUrl = (u: string) => {
    if (!u) return '';
    let trimmed = u.trim();
    if (!/^https?:\/\//i.test(trimmed)) trimmed = `https://${trimmed}`;

    try {
      const parsed = new URL(trimmed);
      const hostname = parsed.hostname.replace(/^www\./i, '').toLowerCase();
      const path = parsed.pathname.replace(/\/+$/, '');

      if (hostname === 'youtu.be') {
        const id = path.split('/').filter(Boolean)[0];
        return id ? `https://www.youtube.com/watch?v=${id}` : trimmed;
      }

      if (hostname.endsWith('youtube.com')) {
        const shortsId = path.match(/^\/shorts\/([^/]+)/i)?.[1];
        if (shortsId) return `https://www.youtube.com/shorts/${shortsId}`;

        const videoId = parsed.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
      }

      if (hostname.endsWith('instagram.com')) {
        const mediaId = getInstagramMediaId(trimmed);
        if (mediaId) {
          const isPost = /\/p\//i.test(trimmed) || /\/share\/p\//i.test(trimmed);
          return `https://www.instagram.com/${isPost ? 'p' : 'reel'}/${mediaId}/`;
        }
      }

      if (hostname.endsWith('tiktok.com')) {
        return `https://${parsed.hostname}${path}`;
      }
    } catch (e) {
      // Fall through to a conservative cleanup.
    }

    return trimmed.split('?')[0].split('#')[0].replace(/\/+$/, '');
  };

  const runAnalysis = async (rawUrl: string) => {
    const url = normalizeUrl(rawUrl);
    if (!url) return;

    const today = new Date().toISOString().split('T')[0];

    // Limit check before submission
    const maxScans = isPremium ? 20 : 5;

    if (!userEmail) {
      const unregisteredCount = parseInt(localStorage.getItem('unregisteredSearchCount') || '0', 10);
      if (unregisteredCount >= 1) {
        setLoadingError('Please log in or sign up to perform more than 1 scan, or upgrade to Premium for 20 scans a day.');
        setShowLoginModal(true);
        return;
      }
    } else {
      const dailyLimitStr = localStorage.getItem('dailySearchLimit');
      if (dailyLimitStr) {
        try {
          const limitObj = JSON.parse(dailyLimitStr);
          if (limitObj.date === today && limitObj.count >= maxScans) {
            if (isPremium) {
              setLoadingError(`You have reached your daily Premium limit of ${maxScans} scans. Please try again tomorrow.`);
            } else {
              setLoadingError(`You have reached your daily limit of ${maxScans} scans. Upgrade to Premium for 20 scans a day!`);
              setShowPremiumModal(true);
            }
            return;
          }
        } catch (e) {
          console.error("Error parsing dailySearchLimit:", e);
        }
      }
    }

    setIsSubmitting(true);
    setLoadingError('');
    setResult(null);
    setShowAllSources(false);
    setScannedUrl(url);
    setLoadingStep(1);

    // Scroll to verification report area is handled post-scan
    try {
      const apiHost = typeof window !== 'undefined' && !!(window as any).Capacitor ? 'http://192.168.0.131:3000' : '';
      const res = await fetch(`${apiHost}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      setLoadingStep(3);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      // Increment limits on successful analysis
      if (!userEmail) {
        const unregisteredCount = parseInt(localStorage.getItem('unregisteredSearchCount') || '0', 10);
        localStorage.setItem('unregisteredSearchCount', (unregisteredCount + 1).toString());
      } else {
        const dailyLimitStr = localStorage.getItem('dailySearchLimit');
        let currentCount = 0;
        if (dailyLimitStr) {
          try {
            const limitObj = JSON.parse(dailyLimitStr);
            if (limitObj.date === today) {
              currentCount = limitObj.count;
            }
          } catch (e) {}
        }
        localStorage.setItem('dailySearchLimit', JSON.stringify({
          date: today,
          count: currentCount + 1
        }));
      }

      setResult(data);

      // Modal will open automatically since result is set

    } catch (err: any) {
      console.error("Scan fetch error:", err);
      if (err instanceof SyntaxError) {
        setLoadingError("Failed to parse server response. The API endpoint might be missing or returned an invalid response.");
      } else if (err instanceof Error && err.message && err.message !== 'Failed to fetch' && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        setLoadingError(err.message);
      } else {
        const apiHost = typeof window !== 'undefined' && !!(window as any).Capacitor ? 'http://192.168.0.131:3000' : '';
        setLoadingError(`Could not connect to backend at ${apiHost || 'localhost'}. Make sure the server is running.`);
      }
    } finally {
      setIsSubmitting(false);
      setLoadingStep(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instagramUrl.trim()) return;
    runAnalysis(instagramUrl.trim());
  };

  const scrollToVerify = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToNews = () => {
    const el = document.getElementById('news-feed-card');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const verdictColor = (v: string) => {
    const l = (v || '').toLowerCase();
    if (l.includes('true') || l.includes('correct')) return { bg: '#1a3d1a', color: '#4ade80', border: '#2d6b2d' };
    if (l.includes('false') || l.includes('wrong')) return { bg: '#3d1a1a', color: '#f87171', border: '#6b2d2d' };
    if (l.includes('mislead') || l.includes('partial')) return { bg: '#3d3019', color: '#fbbf24', border: '#6b5a2d' };
    return { bg: '#2a2a2a', color: '#94a3b8', border: '#444' };
  };

  const loadingMessages = [
    '',
    'Checking database ledger...',
    'Extracting Reel transcripts & scraping media channels...',
    'AI is mapping Left vs Right bias arguments...'
  ];

  const filteredAndSortedNews = newsfeedList
    .filter((art: any) => art.category === activeTab)
    .sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (Math.abs(dateB - dateA) > 1000 * 60 * 60 * 24) {
        return dateB - dateA;
      }
      return (b.viewCount || 0) - (a.viewCount || 0);
    });

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

          /* Bias View Colors */
          --left-blue: #60a5fa;
          --right-red: #f87171;
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
          width: 100%;
          margin: 0;
          align-items: start;
        }

        @media (max-width: 991px) {
          .app-layout {
            flex-direction: column;
          }
        }

        /* ─── STICKY SIDEBAR ─── */
        .sidebar {
          width: 140px;
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
          font-size: 1.95rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 0.85;
          text-transform: lowercase;
          margin-bottom: 0.25rem;
          color: var(--text-dark);
          cursor: pointer;
          word-break: break-word;
        }

        .sidebar-sublogo {
          font-size: 0.52rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-dark);
          opacity: 0.7;
          margin-top: 0.35rem;
          margin-bottom: 0.75rem;
        }

        /* Colorful Capsules */
        .side-btn {
          border: 1px solid var(--border-dark);
          border-radius: 12px;
          padding: 0.8rem 0.9rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          width: 100%;
          aspect-ratio: 1 / 1;
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
          font-size: 1rem;
          font-weight: 400;
        }

        .side-btn-label {
          font-size: 0.76rem;
          font-weight: 800;
          line-height: 1.2;
          margin-top: auto;
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
          margin-bottom: 1rem;
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

        /* ─── TRENDING CARD CONTROLS ─── */
        .trending-header-card {
          background-color: #ffffff;
          border: 1px solid var(--border-dark);
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
          background: #fcfbf9;
          border: 1px solid var(--border-dark);
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
          border: 1px solid var(--border-dark);
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

        .side-cta-btn {
          background-color: var(--c-purple);
          color: #fff;
          border: 1px solid var(--border-dark);
          border-radius: 12px;
          padding: 0.8rem;
          font-weight: 800;
          font-size: 0.8rem;
          text-align: center;
          cursor: pointer;
          transition: transform 0.15s;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          outline: none;
          width: 100%;
          aspect-ratio: 1 / 1;
        }
        .side-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
        }

        .side-lang-btn-wrap {
          position: relative;
          width: 100%;
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
          width: 100%;
        }
        .lang-dropdown-menu {
          position: absolute;
          bottom: 110%;
          left: 0;
          width: 100%;
          background: #000;
          border: 1px solid var(--border-dark);
          border-radius: 12px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
        }
        .lang-dropdown-item {
          background: transparent;
          color: #fff;
          border: none;
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          font-weight: 800;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          outline: none;
        }
        .lang-dropdown-item:hover {
          background: #222;
        }
        .lang-dropdown-item.active {
          color: var(--c-yellow);
          background: #111;
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
          gap: 0;
          min-width: 0;
        }

        /* ─── HERO CARD (FULL VIEWPORT like units.gr) ─── */
        .hero-card {
          background-image: linear-gradient(
            to bottom,
            rgba(0,0,0,0.02) 0%,
            rgba(0,0,0,0.05) 40%,
            rgba(0,0,0,0.25) 75%,
            rgba(0,0,0,0.40) 100%
          ), url('/hero_faces_branded.png');
          background-color: var(--bg-warm);
          background-blend-mode: multiply;
          background-size: cover;
          background-position: center;
          border-radius: 32px;
          padding: 3.5rem;
          min-height: calc(100vh - 3rem);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: #ffffff;
          position: relative;
          box-shadow: 0 8px 40px rgba(0,0,0,0.15);
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .hero-card {
            padding: 2.5rem 1.5rem;
            min-height: calc(100vh - 2rem);
          }
        }

        .hero-title {
          font-family: var(--serif);
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.0;
          margin-bottom: 1.2rem;
          max-width: 850px;
          text-shadow: 0 2px 15px rgba(0,0,0,0.7), 0 4px 30px rgba(0,0,0,0.4);
        }

        .hero-subtext {
          font-size: clamp(1rem, 1.8vw, 1.2rem);
          font-weight: 500;
          max-width: 620px;
          line-height: 1.55;
          margin-bottom: 2rem;
          opacity: 0.95;
          text-shadow: 0 1px 10px rgba(0,0,0,0.7), 0 3px 20px rgba(0,0,0,0.4);
        }

        .hero-action-btn {
          background-color: #000;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 30px;
          padding: 0.9rem 1.8rem;
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: background-color 0.15s, transform 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          outline: none;
        }

        .hero-action-btn:hover {
          background-color: var(--c-yellow);
          color: #000;
          transform: translateY(-1px);
        }

        /* ─── COLOURFUL GRID "DOWNSTAIRS" ─── */
        .downstairs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 991px) {
          .downstairs-grid {
            grid-template-columns: 1fr;
          }
        }

        .grid-card {
          border-radius: 28px;
          padding: 2.2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 300px;
        }

        .grid-card.yellow {
          background-color: var(--c-yellow);
          color: #000;
        }

        .grid-card.orange {
          background-color: var(--c-orange);
          color: #fff;
        }

        .grid-card.blue {
          background-color: var(--c-blue);
          color: #fff;
        }

        .grid-card.green {
          background-color: var(--c-green);
          color: #fff;
        }

        .grid-card.purple {
          background-color: var(--c-purple);
          color: #fff;
        }

        .card-header-badge {
          align-self: flex-start;
          border: 1px solid currentColor;
          border-radius: 20px;
          padding: 0.4rem 1rem;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2rem;
        }

        .card-title {
          font-family: var(--serif);
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 1.1rem;
        }

        .card-desc {
          font-size: 0.95rem;
          line-height: 1.55;
          opacity: 0.9;
        }

        .card-btn-row {
          display: flex;
          gap: 0.75rem;
          margin-top: 2rem;
          flex-wrap: wrap;
        }

        .card-btn {
          border: 1px solid currentColor;
          border-radius: 20px;
          padding: 0.5rem 1.2rem;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          cursor: pointer;
          background: transparent;
          color: inherit;
          transition: background-color 0.15s, color 0.15s;
          outline: none;
        }

        .card-btn:hover {
          background-color: currentColor;
          color: #000;
        }
        .grid-card.orange .card-btn:hover {
          color: var(--c-orange);
        }

        /* ─── MARQUEE TICKER ─── */
        .marquee-banner {
          background-color: var(--c-orange);
          color: #fff;
          border-radius: 16px;
          padding: 0.8rem 0;
          overflow: hidden;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          grid-column: span 2;
        }

        @media (max-width: 991px) {
          .marquee-banner {
            grid-column: span 1;
          }
        }

        .marquee-content {
          display: inline-block;
          animation: marquee 30s linear infinite;
          font-size: 0.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ─── VERIFY FORM IN ORANGE CARD ─── */
        .verify-card-form {
          margin-top: 1.5rem;
        }

        .verify-card-input-wrapper {
          display: flex;
          background-color: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        .verify-card-input-wrapper:focus-within {
          border-color: #fff;
          background-color: rgba(255,255,255,0.18);
        }

        .verify-card-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 1.1rem;
          font-family: var(--sans);
          font-size: 0.9rem;
          color: #fff;
          outline: none;
        }
        .verify-card-input::placeholder {
          color: rgba(255,255,255,0.6);
        }

        .verify-card-submit-btn {
          background-color: #fff;
          color: var(--c-orange);
          border: none;
          padding: 0 1.5rem;
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .verify-card-submit-btn:hover:not(:disabled) {
          background-color: var(--c-yellow);
          color: #000;
        }
        .verify-card-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .verify-card-hint {
          font-size: 0.7rem;
          opacity: 0.8;
          line-height: 1.45;
        }

        /* ─── DYNAMIC NEWS CARD LIST ─── */
        .news-list-card {
          background-color: var(--c-yellow);
          color: #000;
        }

        .news-item-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.9rem 0;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          text-decoration: none;
          color: inherit;
          transition: opacity 0.15s;
        }
        .news-item-link:hover {
          opacity: 0.75;
        }

        .news-item-title {
          font-family: var(--serif);
          font-size: 1.1rem;
          font-weight: 900;
          line-height: 1.25;
          padding-right: 1.5rem;
        }

        .news-item-date {
          font-size: 0.7rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .news-tabs {
          display: flex;
          gap: 0.8rem;
          margin-top: 1rem;
          margin-bottom: 0.75rem;
          border-bottom: 2px solid rgba(0,0,0,0.15);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .news-tabs::-webkit-scrollbar {
          display: none;
        }
        .news-tab-btn {
          background: none;
          border: none;
          color: inherit;
          opacity: 0.65;
          font-weight: 800;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.6rem 0.25rem;
          cursor: pointer;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: opacity 0.15s, border-bottom-color 0.15s;
        }
        .news-tab-btn:hover {
          opacity: 0.85;
        }
        .news-tab-btn.active {
          opacity: 1;
          border-bottom: 2px solid currentColor;
        }

        .news-item-meta {
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0.75;
          display: flex;
          gap: 0.75rem;
          margin-top: 0.35rem;
        }

        .news-feed-item-card-block {
          transition: transform 0.15s, box-shadow 0.15s;
          cursor: pointer;
        }
        .news-feed-item-card-block:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08) !important;
        }
        .news-feed-item-card-block.blue { background-color: var(--c-blue); color: #fff; }
        .news-feed-item-card-block.orange { background-color: var(--c-orange); color: #fff; }
        .news-feed-item-card-block.yellow { background-color: var(--c-yellow); color: #000; }
        .news-feed-item-card-block.green { background-color: var(--c-green); color: #fff; }
        .news-feed-item-card-block.purple { background-color: var(--c-purple); color: #fff; }

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

        /* Left/Right grid */
        .reader-perspectives {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
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

        .dossier-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 2.5rem;
          align-items: start;
          margin-top: 0.5rem;
        }

        .dossier-main {
          min-width: 0;
        }

        .dossier-sidebar {
          position: sticky;
          top: 1.5rem;
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

        .dossier-clash-card {
          background: linear-gradient(135deg, #111111 0%, #1f2937 100%);
          color: #fff;
          border-radius: 24px;
          padding: 1.5rem 1.75rem;
          margin: 0 0 1.5rem 0;
          box-shadow: 0 18px 45px rgba(0,0,0,0.16);
        }

        .dossier-clash-kicker {
          font-size: 0.68rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--c-yellow);
          margin-bottom: 0.45rem;
        }

        .dossier-clash-title {
          font-size: 1.05rem;
          font-weight: 800;
          line-height: 1.45;
          margin-bottom: 0.55rem;
        }

        .dossier-clash-body {
          font-size: 0.95rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.9);
        }

        .dossier-persp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin: 0 0 2rem 0;
        }

        .dossier-persp-card {
          border: 1px solid var(--border-dark);
          border-radius: 20px;
          padding: 1.4rem 1.35rem;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          box-shadow: 0 10px 28px rgba(0,0,0,0.05);
        }

        .dossier-persp-card.left {
          background: linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%);
          border-color: #9ec2f7;
        }

        .dossier-persp-card.right {
          background: linear-gradient(180deg, #fffaf8 0%, #fff3f0 100%);
          border-color: #f8b7a9;
        }

        .dossier-persp-chip {
          align-self: flex-start;
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.35rem 0.6rem;
          border-radius: 999px;
          color: #fff;
        }

        .dossier-persp-chip.left { background: var(--c-blue); }
        .dossier-persp-chip.right { background: #dc2626; }

        .dossier-persp-card-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #111;
          line-height: 1.4;
        }

        .dossier-persp-card-copy {
          font-size: 0.9rem;
          color: #333;
          line-height: 1.6;
          margin: 0;
        }

        .dossier-deep-dive {
          background: #f8f7f4;
          border: 1px solid var(--border-dark);
          border-radius: 20px;
          padding: 2rem;
          margin: 2rem 0;
        }

        @media (max-width: 900px) {
          .dossier-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .dossier-sidebar {
            position: static;
            order: 2;
          }

          .dossier-main {
            order: 1;
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

        /* ─── MOBILE APP SHELL OVERRIDES ─── */
        .mobile-header {
          display: none;
        }
        .mobile-bottom-nav {
          display: none;
        }

        /* Forced mobile viewport context rules */
        .is-mobile-app-layout {
          flex-direction: column !important;
          gap: 0 !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .is-mobile-app-content {
          width: 100% !important;
          max-width: 100% !important;
          padding: 1.25rem 1rem 2rem 1rem !important;
          margin-top: calc(60px + env(safe-area-inset-top, 0px)) !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
        }

        /* ─── MOBILE HEADER & DROPDOWN MENU STYLES ─── */
        .mobile-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: calc(60px + env(safe-area-inset-top, 0px));
          background: #f4ede4;
          border-bottom: 2px solid #000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: env(safe-area-inset-top, 0px) 1.25rem 0 1.25rem;
          z-index: 10000;
        }
        .mobile-header-logo {
          font-family: var(--serif);
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: lowercase;
          letter-spacing: -0.04em;
          color: #000;
          user-select: none;
          cursor: pointer;
        }
        .mobile-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .mobile-about-btn {
          background: #8b5cf6;
          color: #fff;
          border: 2px solid #000;
          border-radius: 40px;
          padding: 8px 16px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 2px 2px 0px #000;
          transition: all 0.1s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .mobile-about-btn:active {
          transform: translate(2px, 2px);
          box-shadow: 0px 0px 0px #000;
        }
        .mobile-menu-toggle {
          background: #000;
          border: 2px solid #000;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 2px 2px 0px #000;
          border-radius: 8px;
          transition: all 0.1s;
        }
        .mobile-menu-toggle:active {
          transform: translate(2px, 2px);
          box-shadow: 0px 0px 0px #000;
        }
        
        .hamburger-icon {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 18px;
        }
        .hamburger-icon span {
          display: block;
          height: 2.5px;
          background: #fff;
          width: 100%;
          border-radius: 1px;
        }
        
        /* Dropdown Menu Overlay */
        .mobile-dropdown-menu {
          position: fixed;
          top: calc(60px + env(safe-area-inset-top, 0px));
          left: 0; right: 0; bottom: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          background: #000;
          animation: slideDownMenu 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideDownMenu {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .menu-block {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          border-bottom: 2px solid #000;
          cursor: pointer;
          text-align: left;
          font-family: var(--serif);
          transition: opacity 0.15s;
        }
        .menu-block:active {
          opacity: 0.9;
        }
        .menu-block.blue {
          background-color: var(--c-blue);
          color: #fff;
        }
        .menu-block.yellow {
          background-color: var(--c-yellow);
          color: #000;
        }
        .menu-block.orange {
          background-color: var(--c-orange);
          color: #fff;
        }
        .menu-block.green {
          background-color: var(--c-green);
          color: #fff;
        }
        
        .menu-block-label {
          font-size: 1.65rem;
          font-weight: 900;
          text-transform: lowercase;
          letter-spacing: -0.03em;
        }
        .menu-block-num {
          font-family: var(--sans);
          font-size: 1.1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          body {
            padding: 0 !important;
            background-color: var(--bg-warm);
          }
          .app-layout {
            flex-direction: column;
            gap: 0 !important;
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          .sidebar {
            display: none !important;
          }
          .main-content {
            width: 100% !important;
            max-width: 100% !important;
            padding: 1.25rem 1rem 5.5rem 1rem !important;
            margin-top: calc(56px + env(safe-area-inset-top, 0px)) !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }

          /* Native App Mobile Tab toggles */
          .main-content.mobile-tab-verify #news-feed-card,
          .main-content.mobile-tab-verify #trending-scans-card {
            display: none !important;
          }
          .main-content.mobile-tab-news .hero-card,
          .main-content.mobile-tab-news #trending-scans-card {
            display: none !important;
          }
          .main-content.mobile-tab-trending .hero-card,
          .main-content.mobile-tab-trending #news-feed-card {
            display: none !important;
          }
          .main-content.mobile-tab-profile .hero-card,
          .main-content.mobile-tab-profile #news-feed-card,
          .main-content.mobile-tab-profile #trending-scans-card {
            display: none !important;
          }
          
          /* Stack trending scans vertically on mobile and make capsules compact */
          .trending-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .news-capsule {
            padding: 1.2rem 1.4rem !important;
            margin-bottom: 0.5rem !important;
            min-height: auto !important;
          }
          .news-capsule-title {
            font-size: 1.25rem !important;
            line-height: 1.3 !important;
            margin-bottom: 0.75rem !important;
          }
          
          /* Native App Header */
          .mobile-header {
            position: fixed;
            top: 0; left: 0; right: 0;
            height: calc(56px + env(safe-area-inset-top, 0px));
            background: rgba(244, 237, 228, 0.9);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1.5px solid #000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: env(safe-area-inset-top, 0px) 1.25rem 0 1.25rem;
            z-index: 1000;
          }
          .mobile-header-logo {
            font-family: var(--serif);
            font-size: 1.35rem;
            font-weight: 900;
            text-transform: lowercase;
            letter-spacing: -0.04em;
            color: #000;
            user-select: none;
            cursor: pointer;
          }
          .mobile-about-btn {
            background: #000;
            color: #fff;
            border: none;
            border-radius: 20px;
            padding: 6px 14px;
            font-size: 0.72rem;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.1s;
          }
          .mobile-about-btn:active {
            transform: scale(0.95);
          }
 
          /* Native App Bottom Navigation */
          .mobile-bottom-nav {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: calc(64px + env(safe-area-inset-bottom, 0px));
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1.5px solid #000;
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding-bottom: env(safe-area-inset-bottom, 0px);
            z-index: 1000;
            box-shadow: 0 -4px 15px rgba(0,0,0,0.05);
          }
          .mobile-nav-item {
            background: none;
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: #666;
            font-size: 0.65rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            flex: 1;
            height: 100%;
            transition: color 0.15s, transform 0.1s;
          }
          .mobile-nav-item.active {
            color: #000;
          }
          .mobile-nav-item svg {
            transition: transform 0.15s ease;
          }
          .mobile-nav-item.active svg {
            transform: scale(1.1);
            stroke-width: 2.5px;
          }
          .mobile-nav-item:active {
            transform: scale(0.95);
          }
 
          /* App Bottom Sheet Drawers for Modals */
          .modal-box {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 24px 24px 0 0 !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            border-bottom: none !important;
            margin: 0 !important;
            padding: 2.5rem 1.5rem calc(2rem + env(safe-area-inset-bottom)) 1.5rem !important;
            animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }
      `}</style>

      {errorBanner && (
        <div style={{ background: '#B23A2E', color: '#fff', padding: '0.75rem 1.25rem', position: 'fixed', top: 'calc(56px + env(safe-area-inset-top, 0px))', left: 0, right: 0, zIndex: 9999, fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <span>⚠️ {errorBanner}</span>
          <button onClick={() => setErrorBanner(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', fontWeight: 900 }}>✕</button>
        </div>
      )}

      <div className={`app-layout ${isMobileApp ? 'is-mobile-app-layout' : ''}`}>
        {/* ═══ LEFT SIDEBAR ═══ */}
        {!isMobileApp && (
          <aside className="sidebar">
            <div className="sidebar-logo" onClick={() => window.location.reload()}>
              only <br /> the truth
              <div className="sidebar-sublogo">Independent Bias Tracker</div>
            </div>
            
            {!userEmail ? (
              <>
                <button className="side-btn blue" onClick={() => setShowLoginModal(true)}>
                  <div className="side-btn-num">01 <span className="arrow">↗</span></div>
                  <div className="side-btn-label">{t.loginBtn}</div>
                </button>
                
                <button className="side-btn yellow" onClick={scrollToVerify}>
                  <div className="side-btn-num">02 <span className="arrow">↗</span></div>
                  <div className="side-btn-label">{t.factCheckBtn}</div>
                </button>
                
                <button className="side-btn orange" onClick={() => { setMainView('home'); setTimeout(scrollToTrending, 100); }}>
                  <div className="side-btn-num">03 <span className="arrow">↗</span></div>
                  <div className="side-btn-label">{t.trendingBtn}</div>
                </button>
                
                <button className="side-btn green" onClick={scrollToNews}>
                  <div className="side-btn-num">04 <span className="arrow">↗</span></div>
                  <div className="side-btn-label">{t.newsfeedBtn}</div>
                </button>
              </>
            ) : (
              <>
                <button 
                  className={`side-btn blue ${mainView === 'home' ? 'active-highlight' : ''}`} 
                  onClick={() => { setMainView('home'); setTimeout(scrollToVerify, 100); }}
                >
                  <div className="side-btn-num">01 <span className="arrow">↗</span></div>
                  <div className="side-btn-label">{t.factCheckBtn}</div>
                </button>
                
                <button 
                  className="side-btn yellow" 
                  onClick={() => { setMainView('home'); setTimeout(scrollToNews, 100); }}
                >
                  <div className="side-btn-num">02 <span className="arrow">↗</span></div>
                  <div className="side-btn-label">{t.newsfeedBtn}</div>
                </button>
                
                <button 
                  className="side-btn orange" 
                  onClick={() => { setMainView('home'); setTimeout(scrollToTrending, 100); }}
                >
                  <div className="side-btn-num">03 <span className="arrow">↗</span></div>
                  <div className="side-btn-label">Watch Trending</div>
                </button>
                
                <button 
                  className={`side-btn green ${mainView === 'education' ? 'active-highlight' : ''}`} 
                  onClick={() => setMainView('education')}
                >
                  <div className="side-btn-num">04 <span className="arrow">↗</span></div>
                  <div className="side-btn-label">Education</div>
                </button>
              </>
            )}
            
            <button 
              className={`side-cta-btn ${isPremium ? 'premium-active-btn' : ''}`}
              onClick={() => setShowPremiumModal(true)}
              style={{
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                aspectRatio: 'auto',
                width: '100%',
                height: 'auto',
                background: isPremium ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
                marginBottom: '1rem',
                padding: '0.85rem'
              }}
            >
              <span>{isPremium ? '★ Premium Member' : '⚡ Upgrade to Premium'}</span>
            </button>

            <button className="side-cta-btn" onClick={() => setShowAboutModal(true)}>
              {t.aboutUsBtn}
            </button>
            
            {userEmail && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', padding: '0.4rem', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', width: '100%' }}>
                <span className="user-email-truncate" title={userEmail} style={{ fontSize: '0.62rem', fontWeight: 700, color: '#333', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail}
                </span>
                <button onClick={handleLogout} style={{ border: 'none', background: 'none', color: '#B23A2E', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>
                  {t.logoutBtn}
                </button>
              </div>
            )}

            <div className="side-lang-btn-wrap">
              <button 
                className="side-lang-btn" 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                style={{ border: 'none' }}
              >
                <span>{currentLang === 'EN' ? 'English' : currentLang === 'HI' ? 'हिंदी' : 'Hinglish'}</span>
                <span>🌐</span>
              </button>
              {showLangDropdown && (
                <div className="lang-dropdown-menu">
                  <button className={`lang-dropdown-item ${currentLang === 'EN' ? 'active' : ''}`} onClick={() => { setCurrentLang('EN'); setShowLangDropdown(false); }}>English</button>
                  <button className={`lang-dropdown-item ${currentLang === 'HI' ? 'active' : ''}`} onClick={() => { setCurrentLang('HI'); setShowLangDropdown(false); }}>हिंदी</button>
                  <button className={`lang-dropdown-item ${currentLang === 'HIN' ? 'active' : ''}`} onClick={() => { setCurrentLang('HIN'); setShowLangDropdown(false); }}>Hinglish</button>
                </div>
              )}
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
        )}

        {/* ═══ MAIN RIGHT CONTAINER ═══ */}
        <main className={`main-content mobile-tab-${activeMobileTab} ${isMobileApp ? 'is-mobile-app-content' : ''}`}>
          {result && !isMobileApp ? (
            /* Inline Full-Screen Result (Instagram analysis details dossier) */
            <section className="hero-card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'stretch', 
              textAlign: 'left', 
              padding: '3rem', 
              background: '#ffffff', 
              color: '#000000', 
              border: '1px solid var(--border-dark)', 
              borderRadius: '32px',
              minHeight: 'calc(100vh - 3rem)',
              overflowY: 'auto',
              boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              backgroundImage: 'none'
            }}>
              {/* Back button to return to home view */}
              <button 
                onClick={() => setResult(null)} 
                style={{ 
                  alignSelf: 'flex-start',
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--c-blue)', 
                  fontWeight: 800, 
                  cursor: 'pointer', 
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  marginBottom: '1.5rem',
                  textDecoration: 'underline'
                }}
              >
                ← Back to scanner
              </button>

              {/* Category, viewCount, etc. */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.8rem' }}>
                <span style={{ background: 'var(--c-yellow)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 800 }}>
                  {result.category || 'News'}
                </span>
                <span>•</span>
                <span>{result.viewCount !== undefined ? `${result.viewCount} scans` : '1 scan'}</span>
                <span>•</span>
                <span>
                  {result.uploadedAt 
                    ? new Date(result.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Recent'}
                </span>
              </div>

              <h2 className="hero-title" style={{ color: '#000000', fontSize: '2.5rem', marginBottom: '1rem', textShadow: 'none', fontFamily: 'var(--serif)' }}>
                {result.headline || 'News Story Analysis'}
              </h2>

              {(() => {
                const isPolitical = !!(result.left || result.right);
                const embedUrl = result.pipeline?.normalizedUrl || scannedUrl || instagramUrl;
                const fightLines = (result.fight || '').split('\n').filter(Boolean);
                const fightHeadline = fightLines[0] || 'The core clash';
                const fightBody = fightLines.slice(1).join(' ').trim();

                return (
                  <div className="dossier-layout">
                    {/* Main analysis column — shown first, not the embed */}
                    <div className="dossier-main">
                      {/* Non-political: start with what happened */}
                      {!isPolitical && result.fight && (
                        <div className="dossier-story-block">
                          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', fontWeight: 800, marginBottom: '0.5rem' }}>
                            What Happened
                          </div>
                          <div style={{ fontSize: '1.05rem', color: '#222', lineHeight: '1.6' }}>
                            {result.fight}
                          </div>
                        </div>
                      )}

                      {isPolitical && result.fight && (
                        <div className="dossier-clash-card">
                          <div className="dossier-clash-kicker">Core clash</div>
                          <div className="dossier-clash-title">{fightHeadline}</div>
                          {fightBody ? <div className="dossier-clash-body">{fightBody}</div> : null}
                        </div>
                      )}

                      {/* Political: left/right perspectives */}
                      {isPolitical && (result.left || result.right) && (
                        <div className="dossier-persp-grid">
                          {result.left && (
                            <div className="dossier-persp-card left">
                              <span className="dossier-persp-chip left">Left Side Argument</span>
                              <p className="dossier-persp-card-copy">{result.left.summary}</p>
                              {result.left.keyPoints && result.left.keyPoints.length > 0 && (
                                <>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.2rem' }}>Key narrative points</div>
                                  <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: '#555' }}>
                                    {result.left.keyPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                                  </ul>
                                </>
                              )}
                              {result.left.strongestPoint && (
                                <>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.2rem' }}>Strongest argument</div>
                                  <div style={{ fontSize: '0.82rem', color: '#333', borderLeft: '4px solid var(--c-blue)', paddingLeft: '0.8rem', fontStyle: 'italic' }}>
                                    {result.left.strongestPoint}
                                  </div>
                                </>
                              )}
                              {result.left.blindSpot && (
                                <>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.2rem' }}>Blind spot</div>
                                  <div style={{ fontSize: '0.82rem', color: '#555', borderLeft: '4px solid #ef4444', paddingLeft: '0.8rem' }}>
                                    {result.left.blindSpot}
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          {result.right && (
                            <div className="dossier-persp-card right">
                              <span className="dossier-persp-chip right">Right Side Argument</span>
                              <p className="dossier-persp-card-copy">{result.right.summary}</p>
                              {result.right.keyPoints && result.right.keyPoints.length > 0 && (
                                <>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.2rem' }}>Key narrative points</div>
                                  <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: '#555' }}>
                                    {result.right.keyPoints.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                                  </ul>
                                </>
                              )}
                              {result.right.strongestPoint && (
                                <>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.2rem' }}>Strongest argument</div>
                                  <div style={{ fontSize: '0.82rem', color: '#333', borderLeft: '4px solid #dc2626', paddingLeft: '0.8rem', fontStyle: 'italic' }}>
                                    {result.right.strongestPoint}
                                  </div>
                                </>
                              )}
                              {result.right.blindSpot && (
                                <>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.2rem' }}>Blind spot</div>
                                  <div style={{ fontSize: '0.82rem', color: '#555', borderLeft: '4px solid #dc2626', paddingLeft: '0.8rem' }}>
                                    {result.right.blindSpot}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reality / deep dive section */}
                      {result.reality && (
                        isPolitical ? (
                          <div style={{ margin: '0 0 2.5rem 0' }}>
                            <div style={{ background: '#000000', color: '#ffffff', borderRadius: '24px', padding: '2.5rem' }}>
                              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.15rem', fontWeight: 900, color: 'var(--c-yellow)', marginBottom: '0.8rem', textAlign: 'center' }}>
                                ✦ The Brutal Reality ✦
                              </div>
                              <p style={{ fontSize: '1.05rem', lineHeight: '1.6', textAlign: 'justify', margin: 0 }}>
                                {result.reality}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="dossier-deep-dive">
                            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', fontWeight: 800, marginBottom: '0.8rem' }}>
                              The Full Story
                            </div>
                            <p style={{ fontSize: '1.05rem', lineHeight: '1.65', color: '#222', margin: 0, textAlign: 'justify' }}>
                              {result.reality}
                            </p>
                          </div>
                        )
                      )}

                      {/* Claims Ledger Table */}
                      <ClaimsTable tableData={result.table} articles={result.articles} />

                      {/* Sources Consulted */}
                      {result.articles && result.articles.length > 0 && (() => {
                        const displayedSources = showAllSources ? result.articles : result.articles.slice(0, 6);
                        return (
                          <div style={{ marginTop: '2.5rem' }}>
                            <h3 className="reader-sources-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Verified Sources</span>
                              {result.articles.length > 6 && (
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
                                  {showAllSources ? 'View Less' : `View More (${result.articles.length - 6} more)`}
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

                      {/* Copy-Paste Fact-Check Comments */}
                      <div className="reader-comments-section" style={{ marginTop: '2.5rem', borderTop: '2px solid var(--border-dark)', paddingTop: '2rem' }}>
                        <h3 className="reader-table-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span>Spread the Truth: Copy-Paste Comments</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#666', textTransform: 'none', fontFamily: 'var(--sans)' }}>
                            (Directly copy and paste to original post to combat misinformation)
                          </span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.2rem' }}>
                          {generateInstagramComments(result.table).map((comment, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                gap: '1rem',
                                background: '#f9f8f6', 
                                border: '1px solid var(--border-dark)', 
                                borderRadius: '8px', 
                                padding: '0.8rem 1rem' 
                              }}
                            >
                              <span style={{ fontSize: '0.82rem', color: '#333', fontStyle: 'italic', flex: 1, textAlign: 'left', lineHeight: '1.4' }}>
                                "{comment}"
                              </span>
                              <button 
                                onClick={() => handleCopy(comment, idx)}
                                style={{ 
                                  background: copiedIdx === idx ? 'var(--c-green)' : '#000', 
                                  color: '#fff', 
                                  border: 'none', 
                                  borderRadius: '6px', 
                                  padding: '0.4rem 0.8rem', 
                                  fontSize: '0.72rem', 
                                  fontWeight: 800, 
                                  cursor: 'pointer',
                                  transition: 'background 0.2s',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {copiedIdx === idx ? 'Copied! ✓' : 'Copy'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar: compact embed only */}
                    <aside className="dossier-sidebar">
                      <InstagramEmbed url={embedUrl} compact />
                    </aside>
                  </div>
                );
              })()}
            </section>
          ) : mainView === 'home' ? (
            <>
              {/* Hero Card */}
              <section className="hero-card">
                <h2 className="hero-title">{t.heroTitle}</h2>
                <p className="hero-subtext">{t.heroSubtext}</p>

                {/* Scanner Input — styled like units.gr "Book your Unit" pill */}
                <div className="hero-scanner-container" style={{
                  width: '100%', maxWidth: '600px',
                  background: 'rgba(0,0,0,0.65)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '0.5rem 0.5rem 0.5rem 1.25rem',
                  borderRadius: '50px',
                  backdropFilter: 'blur(16px)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={e => setInstagramUrl(e.target.value)}
                      placeholder={t.inputPlaceholder}
                      required
                      disabled={isSubmitting}
                      style={{
                        flex: 1, background: 'transparent',
                        border: 'none', padding: '0.75rem 0',
                        fontSize: '0.92rem', color: '#fff', outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !instagramUrl.trim()}
                      style={{
                        background: '#fff', color: '#000',
                        border: 'none', borderRadius: '50px',
                        padding: '0.85rem 1.8rem', fontWeight: 800,
                        fontSize: '0.82rem', cursor: 'pointer',
                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                      }}
                    >
                      {isSubmitting ? t.scanningBtn : t.factCheckBtn} <span style={{ fontSize: '1rem' }}>↗</span>
                    </button>
                  </form>
                </div>

                {/* Scans verified counter */}
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginTop: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  ✦ {totalScansCount} scans verified ✦
                </p>

                {isSubmitting && (
                  <div style={{
                    marginTop: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(8px)',
                    maxWidth: '500px',
                    width: '100%',
                    marginRight: 'auto',
                    marginLeft: 'auto'
                  }}>
                    {/* Spinning loader */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid rgba(255, 255, 255, 0.2)',
                      borderTop: '3px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 1.25rem'
                    }} />
                    
                    <h5 style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      marginBottom: '0.5rem'
                    }}>
                      While We Fact-Check... Did You Know?
                    </h5>
                    
                    <p style={{
                      color: '#fff',
                      fontSize: '0.98rem',
                      lineHeight: '1.45',
                      fontWeight: 500,
                      fontStyle: 'italic',
                      marginBottom: '0.75rem',
                      minHeight: '65px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 0.5rem'
                    }}>
                      "{WEIRD_FACTS[currentFactIdx]}"
                    </p>
                    
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em'
                    }}>
                      FACT {currentFactIdx + 1} OF 100
                    </div>
                  </div>
                )}
                {loadingError && (
                  <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: '0.5rem', fontWeight: 600 }}>
                    ✕ {loadingError}
                  </p>
                )}
              </section>

              {/* Newsfeed directly below hero — no grid wrapper, full width */}
              <section id="news-feed-card" style={{ marginTop: '1.5rem' }}>
                <NewspaperFeed />
              </section>

              {/* Trending Scans Section */}
              <section id="trending-scans-card" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Header Control Card */}
                <div className="trending-header-card">
                  <div className="trending-header-top">
                    <h2 className="trending-title">Trending Bias Audits</h2>
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
                      className={`cat-chip-btn ${selectedCategory === 'ALL' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('ALL')}
                    >
                      All
                    </button>
                    <button 
                      className={`cat-chip-btn ${selectedCategory === 'INDIAN_POLITICS' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('INDIAN_POLITICS')}
                    >
                      Indian Politics
                    </button>
                    <button 
                      className={`cat-chip-btn ${selectedCategory === 'WORLD_NEWS' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('WORLD_NEWS')}
                    >
                      World News
                    </button>
                    <button 
                      className={`cat-chip-btn ${selectedCategory === 'FINANCIAL_NEWS' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('FINANCIAL_NEWS')}
                    >
                      Financial News
                    </button>
                    <button 
                      className={`cat-chip-btn ${selectedCategory === 'SPORTS' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('SPORTS')}
                    >
                      Sports
                    </button>
                    <button 
                      className={`cat-chip-btn ${selectedCategory === 'ENTERTAINMENT' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('ENTERTAINMENT')}
                    >
                      Entertainment
                    </button>
                    <button 
                      className={`cat-chip-btn ${selectedCategory === 'OTHERS' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('OTHERS')}
                    >
                      Others
                    </button>
                  </div>
                </div>

                {/* Scans List Grid */}
                {loadingTrending ? (
                  <div style={{ textAlign: 'center', padding: '2rem', fontSize: '0.9rem', color: '#777' }}>Loading trending database...</div>
                ) : dbError ? (
                  <div style={{ textAlign: 'center', padding: '2rem', fontSize: '0.9rem', color: '#f87171' }}>
                    ⚠️ {dbError}
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', fontSize: '0.9rem', color: '#777' }}>No scans match your search or filter.</div>
                ) : (
                  <div className="trending-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {filtered.map((reel, idx) => {
                      const uploadDate = reel.data?.uploadedAt 
                        ? new Date(reel.data.uploadedAt) 
                        : new Date(reel.created_at);
                      const uploadDateStr = uploadDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                      const cycleClasses = ['blue', 'yellow', 'orange', 'green', 'purple'];
                      const selectedColorClass = cycleClasses[idx % cycleClasses.length];
                      const realityText = reel.data?.reality || reel.data?.fight || "Factual bias scan dossier...";
                      const shortText = realityText.length > 95 ? realityText.substring(0, 95) + "..." : realityText;
                      
                      return (
                        <div
                          key={reel.id}
                          onClick={() => {
                            setResult(reel.data);
                            setShowAllSources(false);
                            setScannedUrl(reel.url);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`news-capsule ${selectedColorClass}`}
                          style={{ textDecoration: 'none', cursor: 'pointer' }}
                        >
                          <div className="news-capsule-top">
                            <span>{reel.category || reel.data?.category || 'News'}</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 400 }}>↗</span>
                          </div>
                          <div className="news-capsule-title" style={{ marginBottom: '0.75rem' }}>
                            {reel.topic || reel.data?.headline || 'News Story Scan'}
                          </div>

                          {/* Brief explanation text (Reality shortened!) */}
                          <p style={{ 
                            fontSize: '0.85rem', 
                            margin: '0 0 1.25rem 0', 
                            lineHeight: 1.4, 
                            fontStyle: 'italic', 
                            opacity: 0.9,
                            borderLeft: (selectedColorClass === 'yellow') ? '3px solid rgba(0,0,0,0.15)' : '3px solid rgba(255,255,255,0.3)', 
                            paddingLeft: '0.65rem'
                          }}>
                            {shortText} {realityText.length > 95 && <span style={{ textDecoration: 'underline', fontWeight: 700 }}>see more</span>}
                          </p>

                          <div className="news-capsule-bottom">
                            <span>{reel.view_count || 1} scans</span>
                            <span>Posted: {uploadDateStr}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Marquee banner */}
              <div className="marquee-banner" style={{ marginTop: '1.5rem' }}>
                <div className="marquee-content">
                  <span>✦ Fast & Reliable Fact Checks ✦ Decoupling Opposition & Pro-Government Narratives ✦ 60+ Outlets Tracked ✦ 100% Crowd-Sourced Ledger ✦ ONLY THE TRUTH ✦ Fast & Reliable Fact Checks ✦ Decoupling Opposition & Pro-Government Narratives ✦ 60+ Outlets Tracked ✦ 100% Crowd-Sourced Ledger ✦ ONLY THE TRUTH ✦</span>
                </div>
              </div>
            </>
          ) : (
            /* Education Dashboard Card */
            <section className="hero-card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'stretch', 
              textAlign: 'left', 
              padding: '3rem', 
              background: '#ffffff', 
              color: '#000000', 
              border: '1px solid var(--border-dark)', 
              borderRadius: '32px',
              minHeight: 'calc(100vh - 3rem)',
              overflowY: 'auto',
              boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              backgroundImage: 'none'
            }}>
              <h2 className="hero-title" style={{ color: '#000', fontSize: '2.5rem', marginBottom: '0.5rem', textShadow: 'none', fontFamily: 'var(--serif)' }}>
                Critical Thinking Academy
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '2rem', fontWeight: 500, fontFamily: 'var(--sans)' }}>
                Equipping humans to spot logical fallacies, detect media polarization, and build cognitive resilience against propaganda.
              </p>

              {/* Video Lessons Grid */}
              <h3 style={{ 
                fontFamily: 'var(--serif)', 
                fontSize: '1.5rem', 
                fontWeight: 900, 
                borderLeft: '6px solid var(--c-blue)', 
                paddingLeft: '1rem', 
                marginBottom: '1.5rem',
                letterSpacing: '-0.01em'
              }}>
                Lesson 01: Core Media & Thinking Frameworks
              </h3>
              
              <div className="education-videos-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                {/* Video 1 */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.8rem',
                  border: '2px solid var(--c-blue)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  background: '#f4f8ff',
                  boxShadow: '0 4px 15px rgba(0, 102, 204, 0.05)'
                }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-dark)' }}>
                    <iframe 
                      src="https://www.youtube.com/embed/JlQ5fGECmsA" 
                      title="Critical Thinking Lesson"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#000' }}>Learning How to Think Critically</h4>
                  <p style={{ fontSize: '0.82rem', color: '#444', lineHeight: '1.4' }}>
                    Understand the foundational steps of cognitive filters, evidence vetting, and separating emotional appeals from objective logic.
                  </p>
                </div>

                {/* Video 2 */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.8rem',
                  border: '2px solid var(--c-orange)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  background: '#fff9f5',
                  boxShadow: '0 4px 15px rgba(255, 85, 0, 0.05)'
                }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-dark)' }}>
                    <iframe 
                      src="https://www.youtube.com/embed/9cz4ikFcwMY" 
                      title="Media Bias & Fallacies Lesson"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#000' }}>Recognizing Media Bias & Logical Fallacies</h4>
                  <p style={{ fontSize: '0.82rem', color: '#444', lineHeight: '1.4' }}>
                    A deep dive into common cognitive distortions, media manipulation techniques, framing biases, and logical traps in modern reporting.
                  </p>
                </div>
              </div>

              {/* Critical Thinking Test */}
              <h3 style={{ 
                fontFamily: 'var(--serif)', 
                fontSize: '1.5rem', 
                fontWeight: 900, 
                borderLeft: '6px solid var(--c-green)', 
                paddingLeft: '1rem', 
                marginBottom: '1.5rem',
                letterSpacing: '-0.01em'
              }}>
                Lesson 02: Test Your Thinking Resilience
              </h3>
              
              {!quizSubmitted ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                  <p style={{ fontSize: '0.88rem', color: '#555', fontFamily: 'var(--sans)', lineHeight: '1.4' }}>
                    Take this interactive evaluation to diagnose how well you detect common media manipulation and fallacious arguments.
                  </p>
                  
                  {/* Q1 */}
                  <div style={{ 
                    padding: '1.5rem', 
                    background: '#f4f8ff', 
                    border: '2.5px solid var(--c-blue)', 
                    borderRadius: '20px',
                    boxShadow: '0 4px 15px rgba(0, 102, 204, 0.05)'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#000', marginBottom: '0.6rem' }}>1. Identify the Fallacy:</h4>
                    <p style={{ fontSize: '0.85rem', color: '#333', fontStyle: 'italic', marginBottom: '1rem', paddingLeft: '0.8rem', borderLeft: '4px solid var(--c-blue)' }}>
                      "My opponent wants to reduce our defense budget by 3%. That means they want to leave our borders completely unguarded and invite foreign invasion!"
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {[
                        { val: 1, text: "A) Ad Hominem (Personal Attack)" },
                        { val: 2, text: "B) Straw Man (Misrepresenting argument to easily attack it)" },
                        { val: 3, text: "C) Slippery Slope (Unfounded chain reaction claim)" },
                        { val: 4, text: "D) Appeal to Authority" }
                      ].map(opt => (
                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.4rem 0', color: '#333', fontWeight: 600 }}>
                          <input 
                            type="radio" 
                            name="q1" 
                            checked={quizAnswers[1] === opt.val} 
                            onChange={() => setQuizAnswers(prev => ({ ...prev, 1: opt.val }))}
                            style={{ accentColor: 'var(--c-blue)', transform: 'scale(1.1)' }}
                          />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q2 */}
                  <div style={{ 
                    padding: '1.5rem', 
                    background: '#fffcf2', 
                    border: '2.5px solid var(--c-yellow)', 
                    borderRadius: '20px',
                    boxShadow: '0 4px 15px rgba(252, 185, 0, 0.05)'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#000', marginBottom: '0.6rem' }}>2. Identify the Selection Bias:</h4>
                    <p style={{ fontSize: '0.85rem', color: '#333', fontStyle: 'italic', marginBottom: '1rem', paddingLeft: '0.8rem', borderLeft: '4px solid var(--c-yellow)' }}>
                      A news anchor reports: "Unemployment is skyrocketing! I interviewed 10 people outside an employment exchange this morning and 8 of them were jobless."
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {[
                        { val: 1, text: "A) Confirmation Bias" },
                        { val: 2, text: "B) Hindsight Bias" },
                        { val: 3, text: "C) Selection Bias / Cherry-Picking (Non-representative sampling)" },
                        { val: 4, text: "D) Anchoring Effect" }
                      ].map(opt => (
                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.4rem 0', color: '#333', fontWeight: 600 }}>
                          <input 
                            type="radio" 
                            name="q2" 
                            checked={quizAnswers[2] === opt.val} 
                            onChange={() => setQuizAnswers(prev => ({ ...prev, 2: opt.val }))}
                            style={{ accentColor: 'var(--c-yellow)', transform: 'scale(1.1)' }}
                          />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q3 */}
                  <div style={{ 
                    padding: '1.5rem', 
                    background: '#fff9f5', 
                    border: '2.5px solid var(--c-orange)', 
                    borderRadius: '20px',
                    boxShadow: '0 4px 15px rgba(255, 85, 0, 0.05)'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#000', marginBottom: '0.6rem' }}>3. Correlation vs Causation:</h4>
                    <p style={{ fontSize: '0.85rem', color: '#333', fontStyle: 'italic', marginBottom: '1rem', paddingLeft: '0.8rem', borderLeft: '4px solid var(--c-orange)' }}>
                      "Ice cream sales rose 40% in June. Concurrently, sunburn incidents rose 40%. Therefore, eating ice cream causes sunburns."
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {[
                        { val: 1, text: "A) Confusing Correlation with Causation (Both share a common cause: hot weather)" },
                        { val: 2, text: "B) False Dichotomy" },
                        { val: 3, text: "C) Circular Reasoning" },
                        { val: 4, text: "D) Bandwagon Fallacy" }
                      ].map(opt => (
                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.4rem 0', color: '#333', fontWeight: 600 }}>
                          <input 
                            type="radio" 
                            name="q3" 
                            checked={quizAnswers[3] === opt.val} 
                            onChange={() => setQuizAnswers(prev => ({ ...prev, 3: opt.val }))}
                            style={{ accentColor: 'var(--c-orange)', transform: 'scale(1.1)' }}
                          />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q4 */}
                  <div style={{ 
                    padding: '1.5rem', 
                    background: '#f5fdf7', 
                    border: '2.5px solid var(--c-green)', 
                    borderRadius: '20px',
                    boxShadow: '0 4px 15px rgba(0, 179, 60, 0.05)'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#000', marginBottom: '0.6rem' }}>4. Loaded Questions:</h4>
                    <p style={{ fontSize: '0.85rem', color: '#333', fontStyle: 'italic', marginBottom: '1rem', paddingLeft: '0.8rem', borderLeft: '4px solid var(--c-green)' }}>
                      A debate host asks: "Have you finally decided to stop accepting massive bribes from corporate lobbying firms?"
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {[
                        { val: 1, text: "A) Straw Man Fallacy" },
                        { val: 2, text: "B) Loaded / Complex Question (Assuming a premise that has not been proven)" },
                        { val: 3, text: "C) Red Herring" },
                        { val: 4, text: "D) False Equivalence" }
                      ].map(opt => (
                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.4rem 0', color: '#333', fontWeight: 600 }}>
                          <input 
                            type="radio" 
                            name="q4" 
                            checked={quizAnswers[4] === opt.val} 
                            onChange={() => setQuizAnswers(prev => ({ ...prev, 4: opt.val }))}
                            style={{ accentColor: 'var(--c-green)', transform: 'scale(1.1)' }}
                          />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q5 */}
                  <div style={{ 
                    padding: '1.5rem', 
                    background: '#faf5ff', 
                    border: '2.5px solid var(--c-purple)', 
                    borderRadius: '20px',
                    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.05)'
                  }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#000', marginBottom: '0.6rem' }}>5. Rhetorical Framing:</h4>
                    <p style={{ fontSize: '0.85rem', color: '#333', fontStyle: 'italic', marginBottom: '1rem', paddingLeft: '0.8rem', borderLeft: '4px solid var(--c-purple)' }}>
                      During a policy debate, instead of presenting statistical data or cost analysis, one side presents only heartbreaking emotional personal anecdotes.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {[
                        { val: 1, text: "A) Appeal to Emotion (Using sympathy to distract from systemic data)" },
                        { val: 2, text: "B) Slippery Slope Fallacy" },
                        { val: 3, text: "C) Ad Hominem" },
                        { val: 4, text: "D) Appeal to Ignorance" }
                      ].map(opt => (
                        <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.4rem 0', color: '#333', fontWeight: 600 }}>
                          <input 
                            type="radio" 
                            name="q5" 
                            checked={quizAnswers[5] === opt.val} 
                            onChange={() => setQuizAnswers(prev => ({ ...prev, 5: opt.val }))}
                            style={{ accentColor: 'var(--c-purple)', transform: 'scale(1.1)' }}
                          />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      let correctCount = 0;
                      if (quizAnswers[1] === 2) correctCount++;
                      if (quizAnswers[2] === 3) correctCount++;
                      if (quizAnswers[3] === 1) correctCount++;
                      if (quizAnswers[4] === 2) correctCount++;
                      if (quizAnswers[5] === 1) correctCount++;
                      setQuizScore(correctCount);
                      setQuizSubmitted(true);
                    }}
                    disabled={Object.keys(quizAnswers).length < 5}
                    style={{
                      background: 'var(--c-purple)',
                      color: '#ffffff',
                      border: '1.5px solid var(--border-dark)',
                      borderRadius: '16px',
                      padding: '1.2rem',
                      fontSize: '1rem',
                      fontWeight: 900,
                      cursor: Object.keys(quizAnswers).length < 5 ? 'not-allowed' : 'pointer',
                      opacity: Object.keys(quizAnswers).length < 5 ? 0.5 : 1,
                      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.25)',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    Submit Test & Show Score
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Results box */}
                  <div style={{ 
                    padding: '2.5rem', 
                    background: quizScore >= 4 ? '#eafaf1' : quizScore >= 3 ? '#fffbeb' : '#fef2f2',
                    border: quizScore >= 4 ? '3px solid var(--c-green)' : quizScore >= 3 ? '3px solid var(--c-yellow)' : '3px solid #ef4444', 
                    borderRadius: '24px',
                    textAlign: 'center',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.05)'
                  }}>
                    <h4 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#000', marginBottom: '0.8rem' }}>
                      Your Score: {quizScore} / 5
                    </h4>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: '#222' }}>
                      {quizScore === 5 ? "🧠 Master Thinker - Highly Resilient to Narrative Spin!" :
                       quizScore >= 3 ? "🧐 Critical Practitioner - Fairly good, but stay vigilant!" :
                       "⚠️ Highly Susceptible - Watch the thinking videos and try again!"}
                    </p>
                  </div>

                  {/* Answers Explanation Review */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h4 style={{ 
                      fontFamily: 'var(--serif)', 
                      fontSize: '1.3rem', 
                      fontWeight: 900, 
                      borderLeft: '6px solid var(--c-green)', 
                      paddingLeft: '0.8rem',
                      marginBottom: '1rem'
                    }}>
                      Answer Key & Explanations:
                    </h4>
                    
                    {/* Ex 1 */}
                    <div style={{ 
                      padding: '1.2rem 1.5rem', 
                      border: '2px solid var(--c-blue)', 
                      background: '#f4f8ff', 
                      borderRadius: '16px' 
                    }}>
                      <p style={{ fontWeight: 900, fontSize: '0.9rem', color: '#000' }}>Q1 Correct Answer: B (Straw Man Fallacy)</p>
                      <p style={{ fontSize: '0.85rem', color: '#444', marginTop: '0.3rem', lineHeight: '1.4' }}>
                        Explanation: The opponent misrepresented a small 3% spend cut as a complete abandonment of defenses to make it trivial to attack.
                      </p>
                    </div>

                    {/* Ex 2 */}
                    <div style={{ 
                      padding: '1.2rem 1.5rem', 
                      border: '2px solid var(--c-yellow)', 
                      background: '#fffcf2', 
                      borderRadius: '16px' 
                    }}>
                      <p style={{ fontWeight: 900, fontSize: '0.9rem', color: '#000' }}>Q2 Correct Answer: C (Selection Bias / Cherry-Picking)</p>
                      <p style={{ fontSize: '0.85rem', color: '#444', marginTop: '0.3rem', lineHeight: '1.4' }}>
                        Explanation: Interviewing people right outside an unemployment center guarantees an unrepresentative, highly skewed sample.
                      </p>
                    </div>

                    {/* Ex 3 */}
                    <div style={{ 
                      padding: '1.2rem 1.5rem', 
                      border: '2px solid var(--c-orange)', 
                      background: '#fff9f5', 
                      borderRadius: '16px' 
                    }}>
                      <p style={{ fontWeight: 900, fontSize: '0.9rem', color: '#000' }}>Q3 Correct Answer: A (Confusing Correlation with Causation)</p>
                      <p style={{ fontSize: '0.85rem', color: '#444', marginTop: '0.3rem', lineHeight: '1.4' }}>
                        Explanation: Both rising ice cream sales and sunburns are correlated due to a third underlying factor (summer heat), not because one causes the other.
                      </p>
                    </div>

                    {/* Ex 4 */}
                    <div style={{ 
                      padding: '1.2rem 1.5rem', 
                      border: '2px solid var(--c-green)', 
                      background: '#f5fdf7', 
                      borderRadius: '16px' 
                    }}>
                      <p style={{ fontWeight: 900, fontSize: '0.9rem', color: '#000' }}>Q4 Correct Answer: B (Loaded / Complex Question)</p>
                      <p style={{ fontSize: '0.85rem', color: '#444', marginTop: '0.3rem', lineHeight: '1.4' }}>
                        Explanation: The question assumes they have accepted bribes in the past, boxing the responder into a trap no matter how they answer.
                      </p>
                    </div>

                    {/* Ex 5 */}
                    <div style={{ 
                      padding: '1.2rem 1.5rem', 
                      border: '2px solid var(--c-purple)', 
                      background: '#faf5ff', 
                      borderRadius: '16px' 
                    }}>
                      <p style={{ fontWeight: 900, fontSize: '0.9rem', color: '#000' }}>Q5 Correct Answer: A (Appeal to Emotion)</p>
                      <p style={{ fontSize: '0.85rem', color: '#444', marginTop: '0.3rem', lineHeight: '1.4' }}>
                        Explanation: Swapping cost-benefit numbers for raw emotional stories bypasses critical analysis in favor of feelings.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                      setQuizScore(0);
                    }}
                    style={{
                      background: 'var(--c-purple)',
                      color: '#ffffff',
                      border: '1.5px solid var(--border-dark)',
                      borderRadius: '16px',
                      padding: '1.2rem',
                      fontSize: '1rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.25)',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                      marginTop: '1.5rem'
                    }}
                  >
                    Retake Test
                  </button>
                </div>
              )}
            </section>
          )}

          {isMobileApp && activeMobileTab === 'profile' && (
            <section className="mobile-profile-section" style={{
              padding: '1.5rem 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              color: '#000',
              fontFamily: 'var(--sans)'
            }}>
              {userEmail ? (
                /* Logged In View */
                <div style={{
                  background: '#fff',
                  border: '1px solid #e5e0d8',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#000',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {userEmail.substring(0, 2)}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{userEmail}</div>
                    <div style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '0.25rem' }}>
                      {isPremium ? '★ Premium Member (Unlimited Scans)' : 'Active Free Member'}
                    </div>
                  </div>
                  {!isPremium && (
                    <button 
                      onClick={() => setShowPremiumModal(true)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.88rem'
                      }}
                    >
                      ⚡ Upgrade to Premium
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    style={{
                      marginTop: '0.5rem',
                      width: '100%',
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.88rem'
                    }}
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                /* Logged Out View - Inline Login Form */
                <div style={{
                  background: '#fff',
                  border: '1px solid #e5e0d8',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--serif)' }}>Sign in to Only The Truth</h3>
                    <p style={{ fontSize: '0.82rem', color: '#78716c', marginTop: '0.25rem' }}>Save scans, check histories, and track viral claims.</p>
                  </div>
                  <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#444' }}>Email Address</label>
                      <input 
                        type="email" 
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{
                          border: '1px solid #d6d3d1',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          fontSize: '0.88rem',
                          background: '#fcfaf7'
                        }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#444' }}>Password</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          border: '1px solid #d6d3d1',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          fontSize: '0.88rem',
                          background: '#fcfaf7'
                        }}
                        required
                      />
                    </div>
                    {authError && (
                      <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                        ✕ {authError}
                      </div>
                    )}
                    <button 
                      type="submit"
                      disabled={authLoading}
                      style={{
                        background: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        marginTop: '0.5rem'
                      }}
                    >
                      {authLoading ? 'Signing In...' : 'Sign In / Sign Up'}
                    </button>
                  </form>
                </div>
              )}
            </section>
          )}

          {/* page-footer */}
          <div className="page-footer">
            Only The Truth · Independent media bias analysis · Not affiliated with any political organization
          </div>
        </main>

        {isMobileApp && result && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
            zIndex: 9999,
            background: '#fcfaf7',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            <MobileDossier result={result} onBack={() => setResult(null)} />
          </div>
        )}
      </div>

      {/* ═══ MODAL 01: LOGIN DIALOG ═══ */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowLoginModal(false)}>
              <X size={20} />
            </button>
            <h3 className="modal-title">{isSignUp ? 'Create a Free Account' : 'Welcome Back to Only The Truth'}</h3>
            <p className="modal-body">
              {isSignUp 
                ? 'Sign up to build your critical thinking index, track polarized narratives, and learn media literacy skills.' 
                : 'Log in to your account to monitor narrative tracks, view bookmarked scans, and retake the thinking test.'}
            </p>
            {authSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', textAlign: 'center' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 900
                }}>
                  ✓
                </div>
                <h4 style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>Check Your Email</h4>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.45, color: '#444' }}>
                  {authSuccess}
                </p>
                <button 
                  className="side-cta-btn" 
                  onClick={() => { setShowLoginModal(false); setAuthSuccess(''); }}
                  style={{ border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.8rem 2rem', background: '#000', color: '#fff', marginTop: '0.5rem' }}
                >
                  Okay
                </button>
              </div>
            ) : userEmail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  You are currently logged in as: <br />
                  <span style={{ color: 'var(--c-blue)', fontSize: '1rem', fontWeight: 800 }}>{userEmail}</span>
                </p>
                <button 
                  className="side-cta-btn" 
                  onClick={handleLogout}
                  style={{ border: 'none', borderRadius: '8px', backgroundColor: '#ff4d4d', color: '#fff', cursor: 'pointer', aspectRatio: 'auto', width: '100%', height: 'auto' }}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={inputEmail}
                  onChange={e => setInputEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.9rem', border: '1px solid var(--border-dark)', borderRadius: '8px', fontSize: '0.85rem', color: '#000', backgroundColor: '#fff' }} 
                />
                <input 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '0.9rem', border: '1px solid var(--border-dark)', borderRadius: '8px', fontSize: '0.85rem', color: '#000', backgroundColor: '#fff' }} 
                />
                
                {authError && (
                  <p style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 700 }}>
                    ✕ {authError}
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="side-cta-btn" 
                  style={{ border: 'none', borderRadius: '8px', cursor: 'pointer', aspectRatio: 'auto', width: '100%', height: 'auto' }}
                >
                  {authLoading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
                </button>

                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--c-blue)', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', marginTop: '0.5rem', alignSelf: 'center' }}
                >
                  {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ═══ MODAL 03: PREMIUM PLANS ═══ */}
      {showPremiumModal && (
        <div className="modal-overlay" onClick={() => setShowPremiumModal(false)}>
          <div className="modal-box" style={{ maxWidth: '500px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowPremiumModal(false)}>
              <X size={20} />
            </button>
            <h3 className="modal-title" style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.5rem' }}>
              ⚡ Upgrade to Premium
            </h3>
            <p className="modal-body" style={{ textAlign: 'center', color: '#666', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Bypass basic restrictions and fact-check up to **20 videos a day**.
            </p>

            {/* Success state */}
            {paymentSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  ✓
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#10b981' }}>Payment Verified!</h4>
                <p style={{ fontSize: '0.85rem', color: '#555', textAlign: 'center' }}>
                  Your UroPay transaction has been validated. You are now a **Premium Member** with 20 scans a day.
                </p>
                <button
                  className="side-cta-btn"
                  onClick={() => {
                    setShowPremiumModal(false);
                    setPaymentSuccess(false);
                    setPaymentId('');
                  }}
                  style={{ border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '0.8rem 2rem', background: '#000', color: '#fff' }}
                >
                  Start Scanning
                </button>
              </div>
            ) : (
              <>
                {/* Plan options */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div 
                    onClick={() => { setSelectedPlan('monthly'); setPaymentError(''); }}
                    style={{
                      flex: 1,
                      border: selectedPlan === 'monthly' ? '2px solid #d97706' : '1px solid #e5e7eb',
                      background: selectedPlan === 'monthly' ? '#fef3c7' : '#fff',
                      borderRadius: '12px',
                      padding: '1rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#b45309', marginBottom: '0.25rem' }}>Monthly</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827' }}>₹100</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Per Month</div>
                  </div>

                  <div 
                    onClick={() => { setSelectedPlan('annual'); setPaymentError(''); }}
                    style={{
                      flex: 1,
                      border: selectedPlan === 'annual' ? '2px solid #d97706' : '1px solid #e5e7eb',
                      background: selectedPlan === 'annual' ? '#fef3c7' : '#fff',
                      borderRadius: '12px',
                      padding: '1rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      position: 'relative',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#d97706',
                      color: '#fff',
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '10px',
                      textTransform: 'uppercase'
                    }}>
                      Save 16%
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#b45309', marginBottom: '0.25rem', marginTop: '0.25rem' }}>Annual</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111827' }}>₹1000</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Per Year</div>
                  </div>
                </div>

                {/* UroPay billing section */}
                <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#374151' }}>Pay with UroPay</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#fff', background: '#3b82f6', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      URO PAY Gateway
                    </span>
                  </div>

                  {/* QR code and scan instruction */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=onlythetruth@upi&pn=OnlyTheTruth&am=${selectedPlan === 'monthly' ? '100' : '1000'}&cu=INR&tn=OnlyTheTruth%20Premium`)}`}
                      alt="UPI QR Code"
                      style={{
                        border: '4px solid #fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                      }}
                    />
                    <p style={{ fontSize: '0.78rem', color: '#555', fontWeight: 600 }}>
                      Scan QR with BHIM, GPay, Paytm or PhonePe to pay **₹{selectedPlan === 'monthly' ? '100' : '1000'}**
                    </p>
                    <a 
                      href={`upi://pay?pa=onlythetruth@upi&pn=OnlyTheTruth&am=${selectedPlan === 'monthly' ? '100' : '1000'}&cu=INR&tn=OnlyTheTruth%20Premium`}
                      style={{
                        fontSize: '0.75rem',
                        color: '#2563eb',
                        fontWeight: 700,
                        textDecoration: 'underline',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Or click to pay on mobile UPI App
                    </a>
                  </div>

                  <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#4b5563', marginBottom: '0.25rem' }}>
                        12-Digit UPI Transaction ID / UTR
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 618492048591" 
                        value={paymentId}
                        onChange={e => setPaymentId(e.target.value)}
                        required
                        maxLength={12}
                        style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', color: '#000', backgroundColor: '#fff' }}
                      />
                    </div>

                    {paymentError && (
                      <p style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 700, marginTop: '0.1rem' }}>
                        ✕ {paymentError}
                      </p>
                    )}

                    <button 
                      type="submit"
                      disabled={paymentLoading}
                      style={{
                        width: '100%',
                        background: '#111827',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.8rem',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: '0.25rem'
                      }}
                    >
                      {paymentLoading ? 'Verifying with UroPay Ledger...' : `Validate Payment & Activate`}
                    </button>
                  </form>
                </div>
              </>
            )}
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

      {/* ═══ MOBILE TOP HEADER ═══ */}
      {isMobileApp && !result && (
        <header className="mobile-header" style={{ justifyContent: 'center' }}>
          <div className="mobile-header-logo" onClick={() => handleMobileNav('verify')} style={{ margin: 0 }}>
            only the truth
          </div>
        </header>
      )}

      {/* ═══ NATIVE MOBILE BOTTOM TAB BAR ═══ */}
      {isMobileApp && (
        <nav className="mobile-tab-bar" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          background: 'rgba(252, 250, 247, 0.94)',
          borderTop: '1px solid #e5e0d8',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 'calc(56px + env(safe-area-inset-bottom, 0px))'
        }}>
          <button 
            onClick={() => handleMobileNav('verify')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: activeMobileTab === 'verify' ? '#000' : '#8c857b',
              cursor: 'pointer',
              flex: 1,
              height: '56px'
            }}
          >
            <Compass size={22} strokeWidth={activeMobileTab === 'verify' ? 2.5 : 1.8} />
            <span style={{ fontSize: '10px', fontWeight: activeMobileTab === 'verify' ? 700 : 500 }}>Fact Check</span>
          </button>
          
          <button 
            onClick={() => handleMobileNav('news')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: activeMobileTab === 'news' ? '#000' : '#8c857b',
              cursor: 'pointer',
              flex: 1,
              height: '56px'
            }}
          >
            <BookOpen size={22} strokeWidth={activeMobileTab === 'news' ? 2.5 : 1.8} />
            <span style={{ fontSize: '10px', fontWeight: activeMobileTab === 'news' ? 700 : 500 }}>Newsfeed</span>
          </button>
          
          <button 
            onClick={() => handleMobileNav('trending')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: activeMobileTab === 'trending' ? '#000' : '#8c857b',
              cursor: 'pointer',
              flex: 1,
              height: '56px'
            }}
          >
            <Flame size={22} strokeWidth={activeMobileTab === 'trending' ? 2.5 : 1.8} />
            <span style={{ fontSize: '10px', fontWeight: activeMobileTab === 'trending' ? 700 : 500 }}>Trending</span>
          </button>
          
          <button 
            onClick={() => handleMobileNav('profile')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: activeMobileTab === 'profile' ? '#000' : '#8c857b',
              cursor: 'pointer',
              flex: 1,
              height: '56px'
            }}
          >
            <User size={22} strokeWidth={activeMobileTab === 'profile' ? 2.5 : 1.8} />
            <span style={{ fontSize: '10px', fontWeight: activeMobileTab === 'profile' ? 700 : 500 }}>Profile</span>
          </button>
        </nav>
      )}

      {/* ═══ SCRIPTS ═══ */}
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
