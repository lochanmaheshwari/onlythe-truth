import React from 'react';
import ArticleReaderClient from '@/components/ArticleReaderClient';

type Article = {
  id: string; section: string;
  headline: string; subhead: string; byline: string;
  about: string[]; left: string[]; right: string[]; reality: string[];
  imageUrl: string; imageCredit: string;
  rank: number; isLead: boolean;
};

import indianPoliticsRaw from '@/data/indian-politics.json';
import worldNewsRaw from '@/data/world-news.json';
import financialNewsRaw from '@/data/financial-news.json';
import sportsRaw from '@/data/sports.json';
import entertainmentRaw from '@/data/entertainment.json';

const allData: Record<string, Article[]> = {
  'indian-politics': indianPoliticsRaw as Article[],
  'world-news': worldNewsRaw as Article[],
  'financial-news': financialNewsRaw as Article[],
  'sports': sportsRaw as Article[],
  'entertainment': entertainmentRaw as Article[],
};

export default async function ArticleReader({ params }: { params: Promise<{ section: string; id: string }> }) {
  const { section, id } = await params;
  return <ArticleReaderClient section={section} id={id} />;
}

export function generateStaticParams() {
  const paths: { section: string; id: string }[] = [];
  Object.keys(allData).forEach((section) => {
    allData[section].forEach((article) => {
      paths.push({ section, id: article.id });
    });
  });
  return paths;
}
