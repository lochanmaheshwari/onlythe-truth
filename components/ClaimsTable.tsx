import React from 'react';

interface ClaimsTableProps {
  tableData?: { said: string; truth: string; verdict: string; source: string; link?: string }[];
  articles?: { title: string; source: string; link?: string }[];
}

const getSourceLink = (row: any, articles: any[] = []) => {
  if (row.link && row.link.trim()) return row.link;
  
  // Find matching article by source name
  const match = articles.find(art => 
    art.source && row.source && 
    art.source.toLowerCase().trim() === row.source.toLowerCase().trim()
  );
  if (match && match.link) return match.link;
  
  // Fuzzy match (e.g. "The Hindu" vs "Hindu")
  const fuzzyMatch = articles.find(art => 
    art.source && row.source && 
    (art.source.toLowerCase().includes(row.source.toLowerCase()) || 
     row.source.toLowerCase().includes(art.source.toLowerCase()))
  );
  if (fuzzyMatch && fuzzyMatch.link) return fuzzyMatch.link;

  // Fallback to Google Search for the claim + source
  const query = `${row.source || ''} ${row.said || ''}`.trim();
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
              const vClass = (row.verdict || '').toLowerCase();
              const resolvedLink = getSourceLink(row, articles);
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#111' }}>"{row.said}"</td>
                  <td>
                    <span className={`verdict-badge ${vClass}`}>
                      {row.verdict}
                    </span>
                  </td>
                  <td>{row.truth}</td>
                  <td>
                    {resolvedLink ? (
                      <a href={resolvedLink} target="_blank" rel="noopener noreferrer" className="source-link" style={{ textDecoration: 'underline', color: 'var(--c-blue)', fontWeight: 600 }}>
                        {row.source}
                      </a>
                    ) : (
                      <span style={{ fontWeight: 600, color: '#666' }}>{row.source}</span>
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
