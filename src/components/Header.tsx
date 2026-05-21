interface HeaderProps {
  articleCount: number;
  bookmarkCount: number;
  lastUpdated: Date | null;
  onRefresh: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
  showBookmarkedOnly: boolean;
  onToggleBookmarks: () => void;
  onClearHistory: () => void;
  onExportBookmarks: () => void;
  onImportBookmarks: () => void;
}

export function Header({ articleCount, bookmarkCount, lastUpdated, onRefresh, darkMode, onToggleDarkMode, autoRefreshEnabled, onToggleAutoRefresh, showBookmarkedOnly, onToggleBookmarks, onClearHistory, onExportBookmarks, onImportBookmarks }: HeaderProps) {
  return (
    <header className="app-header" role="banner">
      <div className="header-content">
        <div className="header-brand">
          <h1>
            <img src="/favicon.png" alt="Maple" className="header-logo" />
            Maple
          </h1>
          <p className="header-subtitle">Latest news from Canadian sources</p>
        </div>
        <div className="header-actions">
          {lastUpdated && (
            <span className="last-updated">
              Updated: {lastUpdated.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            className={`icon-btn ${showBookmarkedOnly ? 'active' : ''}`}
            onClick={onToggleBookmarks}
            title={showBookmarkedOnly ? 'Show all articles' : `Show bookmarked (${bookmarkCount})`}
            aria-label="Toggle bookmarked articles"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={showBookmarkedOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            {bookmarkCount > 0 && <span className="bookmark-count-badge">{bookmarkCount}</span>}
          </button>
          <div className="header-dropdown">
            <button
              className="icon-btn"
              title="Import/Export bookmarks"
              aria-label="Import or export bookmarks"
              aria-haspopup="true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <div className="dropdown-menu">
              <button onClick={onExportBookmarks} title="Export bookmarks as JSON">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Export
              </button>
              <button onClick={onImportBookmarks} title="Import bookmarks from JSON">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Import
              </button>
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={onClearHistory}
            title="Clear read history and bookmarks"
            aria-label="Clear read history and bookmarks"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <button
            className={`icon-btn ${autoRefreshEnabled ? 'active' : ''}`}
            onClick={onToggleAutoRefresh}
            title={autoRefreshEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh (10 min)'}
            aria-label="Toggle auto-refresh"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>
          <button
            className="icon-btn"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          <button className="refresh-btn" onClick={onRefresh} title="Refresh news" aria-label="Refresh news">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>
      <div className="header-stats">
        <span>{articleCount} articles loaded</span>
      </div>
    </header>
  );
}
