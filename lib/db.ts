import fs from 'fs';
import path from 'path';

export interface Source {
  name: string;
  url?: string;
  headline?: string;
}

export interface Article {
  id: string;
  title: string;
  query: string;
  instagramUrl?: string;
  transcript?: string;
  leftSummary: string;
  leftSources: Source[];
  rightSummary: string;
  rightSources: Source[];
  centerSummary: string;
  biasScore: number; // -10 (far left) to 10 (far right), 0 is center
  searchCount: number;
  createdAt: string;
  featured?: boolean;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initial seed data to make the app look stunning on first load
const SEED_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Semafor-style 'Only The Truth' Launches in India to Decode Media Polarization",
    query: "only the truth launch media bias india",
    leftSummary: "Left-leaning publications like Scroll.in, The Caravan, and Newslaundry welcomed the platform, framing it as a crucial defense against unchecked government propaganda and corporate media consolidation. They emphasize the platform's potential to highlight issues of press freedom, independent journalism, and structural bias in mainstream TV channels.",
    leftSources: [
      { name: "Scroll.in", url: "https://scroll.in", headline: "New media aggregator aims to trace polarization in Indian news landscape" },
      { name: "Newslaundry", url: "https://newslaundry.com", headline: "Can a transparent bias-rating system save Indian news from corporate influence?" },
      { name: "The Caravan", url: "https://caravanmagazine.in", headline: "The politics of bias: A new tool maps left-right divide" }
    ],
    rightSummary: "Right-leaning outlets including Swarajya, Firstpost, and OpIndia expressed cautious optimism but warned against potential liberal bias in defining what constitutes 'the truth'. They emphasized that mainstream media has historically been dominated by a left-leaning ecosystem, and hoped the platform would fairly represent national interest narratives and economic reform benefits.",
    rightSources: [
      { name: "Swarajya", url: "https://swarajyamag.com", headline: "Aggregator promises to map news bias, but who rates the raters?" },
      { name: "Firstpost", url: "https://firstpost.com", headline: "Decoding bias: A new digital ledger tracks left-leaning and right-leaning news" }
    ],
    centerSummary: "Only the Truth launched as an open, crowd-sourced database analyzing media bias in India. The platform maps articles from 60 prominent Indian news outlets—divided into 30 left-leaning/opposition-leaning and 30 right-leaning/pro-government-leaning sources. By matching search queries and Instagram transcripts to coverage across this spectrum, the platform aims to provide readers a balanced view of highly contested national topics.",
    biasScore: 0,
    searchCount: 142,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    featured: true
  },
  {
    id: "2",
    title: "Debate Over Proposed Digital Media Regulatory Guidelines and Press Freedom",
    query: "digital media regulation india guidelines free speech",
    leftSummary: "Independent outlets such as The Wire, Article 14, and The News Minute raise alarm over the guidelines, calling them a 'censorship code' designed to suppress dissent. They argue that the vague definitions of 'national interest' could be weaponized to target investigative journalists, increase compliance costs for small digital platforms, and restrict online speech.",
    leftSources: [
      { name: "The Wire", url: "https://thewire.in", headline: "Draft regulatory bill is an existential threat to independent journalism" },
      { name: "Article 14", url: "https://article-14.com", headline: "How new digital policies could silence critics and local reporting networks" },
      { name: "The News Minute", url: "https://thenewsminute.com", headline: "Digital platforms rally against stringent compliance rules" }
    ],
    rightSummary: "Pro-government and national channels like Times Now, Republic TV, and DNA India argue that regulatory oversight is long overdue to combat foreign influence campaigns, digital piracy, and viral deepfakes. They claim the rules protect ordinary citizens from cyber defamation and ensure digital news platforms maintain the same level of accountability as traditional broadcast and print media.",
    rightSources: [
      { name: "Times Now", url: "https://timesnownews.com", headline: "Securing the digital space: Why regulation is key to national security" },
      { name: "DNA India", url: "https://dnaindia.com", headline: "Combatting fake news: New draft rules require digital portals to verify facts" },
      { name: "OpIndia", url: "https://opindia.com", headline: "Cracking down on digital lawlessness: Regulations to hold online media accountable" }
    ],
    centerSummary: "The Indian Ministry of Information and Broadcasting is debating new regulatory guidelines for digital media players. Critics claim these policies infringe on free speech and independent reporting, while proponents insist they are necessary to maintain national cybersecurity, curb disinformation, and create a level playing field between digital and legacy print/broadcast media.",
    biasScore: -1.5,
    searchCount: 98,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    featured: false
  },
  {
    id: "3",
    title: "Implementation of Unified Pension Scheme (UPS) and Fiscal Stability Concerns",
    query: "unified pension scheme ups fiscal impact state government",
    leftSummary: "The Indian Express and Deccan Herald highlight the concerns of state governments and economists regarding long-term fiscal sustainability. Critics from this side point out that reverting to guaranteed pension models (which guarantee 50% of the last drawn basic salary) places a heavy burden on future taxpayer resources and limits the state's budget for capital expenditure and social welfare schemes.",
    leftSources: [
      { name: "The Indian Express", url: "https://indianexpress.com", headline: "Explained: The long-term fiscal math behind the Unified Pension Scheme" },
      { name: "Deccan Herald", url: "https://deccanherald.com", headline: "Economists warn UPS could burden state finances by next decade" }
    ],
    rightSummary: "Economic analysts on the conservative side, including CNBC-TV18 and India Today, defend the UPS as a compromise. They argue that it addresses the anxieties of government employees who disliked the market-linked volatility of the NPS, while avoiding the fiscal ruin of reverting completely to the old non-contributory Old Pension Scheme (OPS).",
    rightSources: [
      { name: "CNBC-TV18", url: "https://cnbctv18.com", headline: "UPS vs NPS: Why the new scheme is a smart middle ground for government finances" },
      { name: "India Today", url: "https://indiatoday.in", headline: "UPS offers dignity to employees without risking India's economic growth path" },
      { name: "Swarajya", url: "https://swarajyamag.com", headline: "How the government neutralized the OPS threat with UPS" }
    ],
    centerSummary: "The Union Cabinet has introduced the Unified Pension Scheme (UPS) for central government employees. The scheme promises a assured pension equal to 50% of the average basic pay drawn in the last 12 months prior to retirement. The scheme has ignited a debate between fiscal conservatives warning of future budget deficits, and employee unions demanding social security guarantees.",
    biasScore: 2.1,
    searchCount: 76,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    featured: false
  }
];

// Helper to ensure DB exists and get articles
export function getDb(): { articles: Article[] } {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(DB_FILE)) {
    const data = { articles: SEED_ARTICLES };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }
  
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse database file, returning seed data", error);
    return { articles: SEED_ARTICLES };
  }
}

// Helper to write to DB
export function writeDb(data: { articles: Article[] }): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Add an article to DB (or merge if it exists)
export function saveArticle(article: Omit<Article, 'id' | 'createdAt' | 'searchCount'> & { id?: string }): Article {
  const db = getDb();
  
  // Clean query for matching
  const targetQuery = article.query.toLowerCase().trim();
  
  // Check if article with similar query exists (within some word overlaps, or exact query)
  let existing = db.articles.find(a => 
    a.query.toLowerCase().trim() === targetQuery || 
    (article.instagramUrl && a.instagramUrl === article.instagramUrl)
  );
  
  if (existing) {
    // Update existing article details, increment search count
    existing.title = article.title || existing.title;
    existing.leftSummary = article.leftSummary || existing.leftSummary;
    existing.leftSources = article.leftSources.length ? article.leftSources : existing.leftSources;
    existing.rightSummary = article.rightSummary || existing.rightSummary;
    existing.rightSources = article.rightSources.length ? article.rightSources : existing.rightSources;
    existing.centerSummary = article.centerSummary || existing.centerSummary;
    existing.biasScore = article.biasScore !== undefined ? article.biasScore : existing.biasScore;
    existing.searchCount += 1;
    existing.createdAt = new Date().toISOString(); // refresh active time
    if (article.instagramUrl) existing.instagramUrl = article.instagramUrl;
    if (article.transcript) existing.transcript = article.transcript;
    
    writeDb(db);
    return existing;
  } else {
    // Create new
    const newArticle: Article = {
      ...article,
      id: article.id || Math.random().toString(36).substring(2, 11),
      searchCount: 1,
      createdAt: new Date().toISOString()
    };
    
    // Clear featured flag on others if this is featured (or let it just append)
    if (newArticle.featured) {
      db.articles.forEach(a => a.featured = false);
    }
    
    // Add to top of the list
    db.articles.unshift(newArticle);
    writeDb(db);
    return newArticle;
  }
}

// Get single article by ID
export function getArticleById(id: string): Article | undefined {
  const db = getDb();
  return db.articles.find(a => a.id === id);
}
