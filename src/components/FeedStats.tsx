import { SourceHealth } from '../types';

interface FeedStatsProps {
  sourceStats: { source: string; count: number }[];
  totalArticles: number;
  sourceHealth: SourceHealth[];
}

export function FeedStats({ sourceStats, totalArticles, sourceHealth }: FeedStatsProps) {
  if (sourceStats.length === 0) return null;

  const maxCount = sourceStats[0]?.count || 1;
  const healthySources = sourceHealth.filter(h => h.status === 'ok').length;
  const errorSources = sourceHealth.filter(h => h.status === 'error').length;
  const lastFetched = sourceHealth.find(h => h.lastFetched)?.lastFetched;

  return (
    <div className="feed-stats" role="region" aria-label="Feed statistics">
      <div className="feed-stats-header">
        <h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Feed Statistics
        </h3>
        <div className="feed-stats-summary">
          <span className="stat-badge">{totalArticles} articles</span>
          <span className={`stat-badge stat-ok`}>{healthySources} healthy</span>
          {errorSources > 0 && <span className="stat-badge stat-error">{errorSources} errors</span>}
          {lastFetched && (
            <span className="stat-badge stat-time">
              {lastFetched.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
      <div className="feed-stats-bars">
        {sourceStats.map(({ source, count }) => {
          const percentage = totalArticles > 0 ? (count / totalArticles) * 100 : 0;
          const barWidth = (count / maxCount) * 100;
          const health = sourceHealth.find(h => h.sourceName === source);
          return (
            <div key={source} className="feed-stat-row">
              <div className="feed-stat-label">
                <span className={`health-dot ${health?.status === 'ok' ? 'health-ok' : health?.status === 'error' ? 'health-error' : 'health-loading'}`}></span>
                <span className="feed-stat-name">{source}</span>
              </div>
              <div className="feed-stat-bar-container">
                <div
                  className="feed-stat-bar"
                  style={{ width: `${barWidth}%` }}
                  role="progressbar"
                  aria-valuenow={count}
                  aria-valuemin={0}
                  aria-valuemax={maxCount}
                  aria-label={`${source}: ${count} articles`}
                >
                  <span className="feed-stat-count">{count}</span>
                </div>
              </div>
              <span className="feed-stat-percent">{percentage.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
