import { NewsSource, SourceError, SourceHealth } from '../types';

interface SourceFilterProps {
  sources: NewsSource[];
  selectedSources: string[];
  onToggleSource: (sourceName: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  sourceErrors: SourceError[];
  sourceHealth: SourceHealth[];
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours}h ago`;
}

export function SourceFilter({ sources, selectedSources, onToggleSource, onSelectAll, onDeselectAll, sourceErrors, sourceHealth }: SourceFilterProps) {
  const categories = [...new Set(sources.map(s => s.category))];

  const getHealthForSource = (sourceName: string) => {
    return sourceHealth.find(h => h.sourceName === sourceName);
  };

  const getErrorForSource = (sourceName: string) => {
    return sourceErrors.find(e => e.sourceName === sourceName);
  };

  return (
    <div className="source-filter">
      <div className="source-filter-header">
        <h3>News Sources</h3>
        <div className="source-filter-actions">
          <button onClick={onSelectAll} disabled={selectedSources.length === sources.length}>
            Select All
          </button>
          <button onClick={onDeselectAll} disabled={selectedSources.length === 0}>
            Deselect All
          </button>
        </div>
      </div>
      {categories.map(category => (
        <div key={category} className="source-filter-category">
          <h4>{category}</h4>
          <div className="source-filter-list">
            {sources
              .filter(source => source.category === category)
              .map(source => {
                const health = getHealthForSource(source.name);
                const error = getErrorForSource(source.name);
                return (
                  <label key={source.name} className={`source-filter-item ${error ? 'has-error' : ''} ${health?.status === 'loading' ? 'is-loading' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.name)}
                      onChange={() => onToggleSource(source.name)}
                    />
                    <span className="source-filter-checkbox"></span>
                    <span className="source-filter-info">
                      <span className="source-filter-name">{source.name}</span>
                      {health && (
                        <span className="source-health-meta">
                          {health.status === 'ok' && <span className="health-dot health-ok"></span>}
                          {health.status === 'error' && <span className="health-dot health-error"></span>}
                          {health.status === 'loading' && <span className="health-dot health-loading"></span>}
                          {health.lastFetched && <span className="health-time">{formatTimeAgo(health.lastFetched)}</span>}
                          {health.articleCount > 0 && <span className="health-count">{health.articleCount}</span>}
                        </span>
                      )}
                    </span>
                    {error && (
                      <span className="source-error-badge" title={error.error}>
                        !
                      </span>
                    )}
                  </label>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
