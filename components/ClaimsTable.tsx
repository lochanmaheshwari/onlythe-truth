import React from 'react';

interface ClaimsTableProps {
  tableData?: { said: string; truth: string; verdict: string; source: string; link?: string }[];
  articles?: { title: string; source: string; link?: string }[];
}

const getSourceLink = (row: any, articles: any[] = []) => {
  if (row.link && row.link.trim() && !row.link.includes('None')) return row.link;
  
  const rowSource = (row.source || '').toLowerCase().trim();
  
  // Find matching article by source name
  const match = articles.find(art => 
    art.source && rowSource && 
    art.source.toLowerCase().trim() === rowSource
  );
  if (match && match.link) return match.link;
  
  // Fuzzy match
  const fuzzyMatch = articles.find(art => 
    art.source && rowSource && 
    (art.source.toLowerCase().includes(rowSource) || 
     rowSource.includes(art.source.toLowerCase()))
  );
  if (fuzzyMatch && fuzzyMatch.link) return fuzzyMatch.link;

  if (articles[0] && articles[0].link) {
    return articles[0].link;
  }

  // Fallback to news search for claim
  const query = `${row.said || ''} news`.trim();
  if (query) {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  return null;
};

export default function ClaimsTable({ tableData, articles = [] }: ClaimsTableProps) {
  if (!tableData || tableData.length === 0) return null;

  return (
    <div className="reader-table-section">
      <h3 className="reader-table-title">Claims Verdict Ledger</h3>
      <div className="reader-table-wrap">
        <table className="reader-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Claim Analyzed</th>
              <th style={{ width: '15%' }}>Verdict</th>
              <th style={{ width: '45%' }}>Factual Reality</th>
              <th style={{ width: '15%' }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row: any, i: number) => {
              const rawVerdict = (row.verdict || 'HARD TO VERIFY').toUpperCase();
              const displayVerdict = rawVerdict === 'UNVERIFIED' ? 'HARD TO VERIFY' : rawVerdict;
              const vClass = displayVerdict.toLowerCase().replace(/\s+/g, '-');
              
              let sourceText = row.source || '';
              if (!sourceText || /none|null|undefined/i.test(sourceText)) {
                sourceText = articles[i % Math.max(articles.length, 1)]?.source || articles[0]?.source || 'Indian Express';
              }

              const resolvedLink = getSourceLink({ ...row, source: sourceText }, articles);
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#111' }}>"{row.said}"</td>
                  <td>
                    <span className={`verdict-badge ${vClass}`}>
                      {displayVerdict}
                    </span>
                  </td>
                  <td>{row.truth}</td>
                  <td>
                    {resolvedLink ? (
                      <a href={resolvedLink} target="_blank" rel="noopener noreferrer" className="source-link" style={{ textDecoration: 'underline', color: 'var(--c-blue)', fontWeight: 600 }}>
                        {sourceText}
                      </a>
                    ) : (
                      <span style={{ fontWeight: 600, color: '#666' }}>{sourceText}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
