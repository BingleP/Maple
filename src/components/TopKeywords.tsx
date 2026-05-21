import { memo } from 'react';
import type { KeywordInfo } from '../utils/keywords';

interface TopKeywordsProps {
  keywords: KeywordInfo[];
  onKeywordClick?: (keyword: string) => void;
}

export const TopKeywords = memo(function TopKeywords({ keywords, onKeywordClick }: TopKeywordsProps) {
  if (keywords.length === 0) return null;

  return (
    <div className="top-keywords" role="region" aria-label="Trending keywords">
      <h3>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
        Trending Keywords
      </h3>
      <div className="keywords-cloud">
        {keywords.map((kw) => (
          <button
            key={kw.word}
            className={`keyword-tag ${onKeywordClick ? 'clickable' : ''}`}
            onClick={() => onKeywordClick?.(kw.word)}
            title={`${kw.count} article${kw.count !== 1 ? 's' : ''}`}
            aria-label={`Search for "${kw.word}", appears in ${kw.count} articles`}
          >
            {kw.word}
            <span className="keyword-count">{kw.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
