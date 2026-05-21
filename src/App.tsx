import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Article, SortOption, SourceError, Toast, SourceHealth } from './types';
import { CANADIAN_SOURCES, fetchAllFeeds } from './api/newsService';
import { Header } from './components/Header';
import { NewsList } from './components/NewsList';
import { SourceFilter } from './components/SourceFilter';
import { ToastContainer } from './components/Toast';
import { ArticlePreviewModal } from './components/ArticlePreviewModal';
import { TopKeywords } from './components/TopKeywords';
import { FeedStats } from './components/FeedStats';
import { extractKeywords, KeywordInfo } from './utils/keywords';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

const STORAGE_KEY_SOURCES = 'canada-news-sources';
const STORAGE_KEY_DARK_MODE = 'canada-news-dark-mode';
const STORAGE_KEY_AUTO_REFRESH = 'canada-news-auto-refresh';
const STORAGE_KEY_BOOKMARKS = 'canada-news-bookmarks';
const STORAGE_KEY_READ = 'canada-news-read';
const STORAGE_KEY_VIEW_MODE = 'canada-news-view-mode';
const STORAGE_KEY_FONT_SIZE = 'canada-news-font-size';
const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000;
const CACHE_TTL = 5 * 60 * 1000;

interface CacheEntry {
  articles: Article[];
  errors: SourceError[];
  sourceHealth: SourceHealth[];
  timestamp: number;
}

function getInitialSources(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SOURCES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return CANADIAN_SOURCES.map(s => s.name);
}

function getInitialDarkMode(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DARK_MODE);
    if (stored !== null) return JSON.parse(stored);
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function getInitialBookmarks(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set();
}

function getInitialRead(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_READ);
    if (stored) return new Set(JSON.parse(stored));
  } catch {}
  return new Set();
}

function getInitialViewMode(): 'card' | 'compact' {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VIEW_MODE);
    if (stored === 'card') return 'card';
    if (stored === 'compact') return 'compact';
  } catch {}
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? 'compact' : 'card';
}

function getInitialFontSize(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (parsed >= 12 && parsed <= 24) return parsed;
    }
  } catch {}
  return 16;
}

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceErrors, setSourceErrors] = useState<SourceError[]>([]);
  const [sourceHealth, setSourceHealth] = useState<SourceHealth[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>(getInitialSources);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTO_REFRESH);
      return stored !== null ? JSON.parse(stored) : true;
    } catch { return true; }
  });
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Set<string>>(getInitialBookmarks);
  const [readUrls, setReadUrls] = useState<Set<string>>(getInitialRead);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [groupBySource, setGroupBySource] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'compact'>(getInitialViewMode);
  const [fontSize, setFontSize] = useState(getInitialFontSize);
  const [showStats, setShowStats] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstLoadRef = useRef(true);
  const feedCacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const selectedSourcesRef = useRef(selectedSources);
  const articlesRef = useRef(articles);
  const loadingRef = useRef(loading);
  const requestIdRef = useRef(0);

  useEffect(() => { selectedSourcesRef.current = selectedSources; }, [selectedSources]);
  useEffect(() => { articlesRef.current = articles; }, [articles]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(STORAGE_KEY_DARK_MODE, JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(selectedSources));
  }, [selectedSources]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTO_REFRESH, JSON.stringify(autoRefreshEnabled));
  }, [autoRefreshEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify([...bookmarkedUrls]));
  }, [bookmarkedUrls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify([...readUrls]));
  }, [readUrls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        document.querySelector('.search-bar input')?.focus();
      } else if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        loadNews(true);
      } else if (e.key === 'd' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setDarkMode(prev => !prev);
      } else if (e.key === 'b' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowBookmarkedOnly(prev => !prev);
      } else if (e.key === 'Escape') {
        if (previewArticle) setPreviewArticle(null);
        else { setSearchQuery(''); setShowBookmarkedOnly(false); setSidebarOpen(false); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewArticle]);

  const loadNews = useCallback(async (forceRefresh = false) => {
    const requestId = ++requestIdRef.current;
    const sourcesToUse = selectedSourcesRef.current;
    const activeSources = CANADIAN_SOURCES.filter(s => sourcesToUse.includes(s.name));

    if (activeSources.length === 0) {
      if (requestIdRef.current === requestId) {
        setArticles([]);
        setLoading(false);
      }
      return;
    }

    const cacheKey = activeSources.map(s => s.name).sort().join(',');
    const cached = feedCacheRef.current.get(cacheKey);
    const now = Date.now();

    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_TTL) {
      if (requestIdRef.current === requestId) {
        setArticles(cached.articles);
        setSourceErrors(cached.errors);
        setSourceHealth(cached.sourceHealth);
        setLastUpdated(new Date(cached.timestamp));
        setLoading(false);
      }
      return;
    }

    const hasArticles = articlesRef.current.length > 0;
    if (!hasArticles || isFirstLoadRef.current) {
      setLoading(true);
    }

    try {
      const result = await fetchAllFeeds(activeSources, (updatedArticles) => {
        if (requestIdRef.current === requestId) {
          setArticles(updatedArticles);
        }
      });

      if (requestIdRef.current !== requestId) return;

      feedCacheRef.current.set(cacheKey, {
        articles: result.articles,
        errors: result.errors,
        sourceHealth: result.sourceHealth,
        timestamp: now,
      });

      setArticles(result.articles);
      setSourceErrors(result.errors);
      setSourceHealth(result.sourceHealth);
      setLastUpdated(new Date());

      if (isFirstLoadRef.current) isFirstLoadRef.current = false;
      else if (!hasArticles) addToast('News refreshed', 'success');
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setSourceErrors([{ sourceName: 'All', error: 'Failed to load news. Please check your connection.' }]);
      addToast('Failed to refresh news', 'error');
      console.error(err);
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [addToast]);

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    const activeSources = CANADIAN_SOURCES.filter(s => selectedSources.includes(s.name));
    if (activeSources.length === 0) {
      setArticles([]);
      setLoading(false);
      return;
    }

    const cacheKey = activeSources.map(s => s.name).sort().join(',');
    const cached = feedCacheRef.current.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      setArticles(cached.articles);
      setSourceErrors(cached.errors);
      setSourceHealth(cached.sourceHealth);
      setLastUpdated(new Date(cached.timestamp));
      setLoading(false);
    } else {
      requestIdRef.current++;
      loadNews();
    }
  }, [selectedSources]);

  useEffect(() => {
    if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    if (autoRefreshEnabled) {
      autoRefreshRef.current = setInterval(() => loadNews(true), AUTO_REFRESH_INTERVAL);
    }
    return () => { if (autoRefreshRef.current) clearInterval(autoRefreshRef.current); };
  }, [autoRefreshEnabled, loadNews]);

  const handleToggleSource = (sourceName: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceName) ? prev.filter(s => s !== sourceName) : [...prev, sourceName]
    );
  };

  const handleSelectAll = () => setSelectedSources(CANADIAN_SOURCES.map(s => s.name));
  const handleDeselectAll = () => setSelectedSources([]);
  const handleRefresh = () => loadNews(true);
  const handleToggleDarkMode = () => setDarkMode(prev => !prev);
  const handleToggleAutoRefresh = () => {
    setAutoRefreshEnabled(prev => !prev);
    addToast(autoRefreshEnabled ? 'Auto-refresh disabled' : 'Auto-refresh enabled (10 min)', 'info');
  };
  const handleToggleBookmarks = () => setShowBookmarkedOnly(prev => !prev);

  const handleClearHistory = () => {
    setBookmarkedUrls(new Set());
    setReadUrls(new Set());
    addToast('History cleared', 'success');
  };

  const handleExportBookmarks = () => {
    const bookmarks = articles.filter(a => bookmarkedUrls.has(a.url));
    const data = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `news-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Bookmarks exported', 'success');
  };

  const handleImportBookmarks = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string) as Article[];
          if (!Array.isArray(imported)) throw new Error('Invalid format');
          const urls = imported.map(a => a.url).filter(Boolean);
          setBookmarkedUrls(prev => {
            const next = new Set(prev);
            urls.forEach(url => next.add(url));
            return next;
          });
          addToast(`Imported ${urls.length} bookmarks`, 'success');
        } catch {
          addToast('Failed to import bookmarks', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleToggleBookmark = (article: Article) => {
    setBookmarkedUrls(prev => {
      const next = new Set(prev);
      if (next.has(article.url)) {
        next.delete(article.url);
        addToast('Bookmark removed', 'info');
      } else {
        next.add(article.url);
        addToast('Article bookmarked', 'success');
      }
      return next;
    });
  };

  const handleMarkRead = (url: string) => {
    setReadUrls(prev => { const next = new Set(prev); next.add(url); return next; });
  };

  const handlePreview = (article: Article) => setPreviewArticle(article);

  const handleShare = async (article: Article) => {
    if (navigator.share) {
      try { await navigator.share({ title: article.title, url: article.url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(article.url);
      addToast('Link copied to clipboard', 'success');
    } catch { addToast('Failed to copy link', 'error'); }
  };

  const handleSpeakArticle = (article: Article) => {
    if (!('speechSynthesis' in window)) { addToast('Text-to-speech not supported', 'error'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${article.title}. ${article.description}`);
    utterance.lang = 'en-CA';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
    addToast('Reading article aloud', 'info');
  };

  const allCategories = useMemo(() =>
    [...new Set(articles.map(a => a.category || 'Uncategorized'))].sort(), [articles]
  );

  const sortedArticles = useMemo(() => {
    if (sortBy === 'newest') return articles;
    const sorted = [...articles];
    if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    else sorted.sort((a, b) => a.sourceName.localeCompare(b.sourceName));
    return sorted;
  }, [articles, sortBy]);

  const filteredArticles = useMemo(() => {
    let result = sortedArticles;
    if (selectedCategory !== 'all') result = result.filter(a => (a.category || 'Uncategorized') === selectedCategory);
    if (showBookmarkedOnly) result = result.filter(a => bookmarkedUrls.has(a.url));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(q) || a.sourceName.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    return result;
  }, [sortedArticles, selectedCategory, showBookmarkedOnly, bookmarkedUrls, searchQuery]);

  const topKeywords = useMemo(() => extractKeywords(filteredArticles, 25), [filteredArticles]);

  const sourceStats = useMemo(() => {
    const stats = new Map<string, number>();
    for (const article of articles) stats.set(article.sourceName, (stats.get(article.sourceName) || 0) + 1);
    return [...stats.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
  }, [articles]);

  const handleKeywordClick = (keyword: string) => setSearchQuery(keyword);
  const handleToggleViewMode = () => setViewMode(prev => prev === 'card' ? 'compact' : 'card');
  const handleIncreaseFont = () => setFontSize(prev => Math.min(24, prev + 1));
  const handleDecreaseFont = () => setFontSize(prev => Math.max(12, prev - 1));

  return (
    <ErrorBoundary>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="app">
        <Header
          articleCount={sortedArticles.length}
          bookmarkCount={bookmarkedUrls.size}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          autoRefreshEnabled={autoRefreshEnabled}
          onToggleAutoRefresh={handleToggleAutoRefresh}
          showBookmarkedOnly={showBookmarkedOnly}
          onToggleBookmarks={handleToggleBookmarks}
          onClearHistory={handleClearHistory}
          onExportBookmarks={handleExportBookmarks}
          onImportBookmarks={handleImportBookmarks}
        />

        <div className="app-layout">
          {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true"></div>}
          <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} aria-label="Source filter sidebar">
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">&times;</button>
            <SourceFilter
              sources={CANADIAN_SOURCES}
              selectedSources={selectedSources}
              onToggleSource={handleToggleSource}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              sourceErrors={sourceErrors}
              sourceHealth={sourceHealth}
            />
          </aside>

          <main className="main-content" id="main-content">
            <div className="toolbar">
              <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle source sidebar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
                Sources
              </button>

              <div className="search-bar" role="search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" placeholder="Search articles... (/)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} aria-label="Search articles" />
                {searchQuery && <button className="search-clear" onClick={() => setSearchQuery('')} title="Clear search" aria-label="Clear search">&times;</button>}
              </div>

              <div className="toolbar-right">
                <div className="category-filter">
                  <label htmlFor="category">Category:</label>
                  <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="all">All</option>
                    {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <button className={`toolbar-toggle ${viewMode === 'compact' ? 'active' : ''}`} onClick={handleToggleViewMode} title={viewMode === 'card' ? 'Switch to compact view' : 'Switch to card view'}>
                  {viewMode === 'card' ? 'Compact' : 'Cards'}
                </button>
                <button className={`toolbar-toggle ${groupBySource ? 'active' : ''}`} onClick={() => setGroupBySource(prev => !prev)} title="Group by source">Group by source</button>
                <button className={`toolbar-toggle ${showStats ? 'active' : ''}`} onClick={() => setShowStats(prev => !prev)} title="Show feed statistics">Stats</button>
                <div className="font-size-controls">
                  <button className="font-btn" onClick={handleDecreaseFont} title="Decrease font size" aria-label="Decrease font size">A-</button>
                  <button className="font-btn" onClick={handleIncreaseFont} title="Increase font size" aria-label="Increase font size">A+</button>
                </div>
                <div className="sort-controls">
                  <label htmlFor="sort">Sort:</label>
                  <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="source">Source</option>
                  </select>
                </div>
              </div>
            </div>

            {searchQuery && <div className="search-results-info">{filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''} for "{searchQuery}"</div>}
            {showStats && <FeedStats sourceStats={sourceStats} totalArticles={articles.length} sourceHealth={sourceHealth} />}
            <TopKeywords keywords={topKeywords} onKeywordClick={handleKeywordClick} />

            <NewsList
              articles={filteredArticles}
              loading={loading}
              sourceErrors={sourceErrors}
              bookmarkedUrls={bookmarkedUrls}
              readUrls={readUrls}
              onToggleBookmark={handleToggleBookmark}
              onMarkRead={handleMarkRead}
              onPreview={handlePreview}
              onShare={handleShare}
              onSpeak={handleSpeakArticle}
              groupBySource={groupBySource}
              showBookmarkedOnly={showBookmarkedOnly}
              viewMode={viewMode}
            />
          </main>
        </div>

        <ArticlePreviewModal
          article={previewArticle}
          onClose={() => setPreviewArticle(null)}
          onOpenFull={(article) => { handleMarkRead(article.url); setPreviewArticle(null); }}
        />

        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
