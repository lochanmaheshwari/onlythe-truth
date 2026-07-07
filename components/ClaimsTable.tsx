import React from 'react';

interface ClaimsTableProps {
  tableData?: { said: string; truth: string; verdict: string; source: string; link?: string }[];
}

export default function ClaimsTable({ tableData }: ClaimsTableProps) {
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
                    {row.link ? (
                      <a href={row.link} target="_blank" rel="noopener noreferrer" className="source-link">
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
