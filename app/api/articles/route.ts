export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || "";
    
    const db = getDb();
    
    if (!search) {
      // Sort: featured first, then latest
      const sorted = [...db.articles].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return NextResponse.json({ articles: sorted });
    }
    
    // Filter articles matching search
    const filtered = db.articles.filter(a => 
      a.title.toLowerCase().includes(search) || 
      a.query.toLowerCase().includes(search) ||
      a.centerSummary.toLowerCase().includes(search) ||
      a.leftSummary.toLowerCase().includes(search) ||
      a.rightSummary.toLowerCase().includes(search)
    );
    
    return NextResponse.json({ articles: filtered });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}
