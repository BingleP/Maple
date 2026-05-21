import { useEffect, useRef, useState, useCallback } from 'react';
import { Article, SourceError } from '../types';
import { NewsCard } from './NewsCard';
import { SkeletonCard } from './SkeletonCard';

const INFINITE_SCROLL_INCREMENT = 20;

interface NewsListProps {
  articles: Article[];
  loading: boolean;
  sourceErrors: SourceError[];
  bookmarkedUrls: Set<string>;
  readUrls: Set<string>;
  onToggleBookmark: (article: Article) => void;
  onMarkRead: (url: string) => void;
  onPreview: (article: Article) => void;
  onShare: (article: Article) => void;
  onSpeak?: (article: Article) => void;
  groupBySource: boolean;
  showBookmarkedOnly: boolean;
  viewMode: 'card' | 'compact';
}

export function NewsList({ articles, loading, sourceErrors, bookmarkedUrls, readUrls, onToggleBookmark, onMarkRead, onPreview, onShare, onSpeak, groupBySource, showBookmarkedOnly, viewMode }: NewsListProps) {
  const [visibleCount, setVisibleCount] = useState(INFINITE_SCROLL_INCREMENT);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const articlesLengthRef = useRef(articles.length);

  useEffect(() => {
    articlesLengthRef.current = articles.length;
    setVisibleCount(INFINITE_SCROLL_INCREMENT);
  }, [articles]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      setVisibleCount(prev => {
        const currentLength = articlesLengthRef.current;
        if (prev >= currentLength) return prev;
        return Math.min(prev + INFINITE_SCROLL_INCREMENT, currentLength);
      });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '400px',
      threshold: 0,
    });

    const current = sentinelRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, [handleObserver]);

  if (loading) {
    return (
      <div className="news-list">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (articles.length === 0 && sourceErrors.length > 0) {
    return (
      <div className="news-list-error" role="alert">
        <p>Failed to load news from selected sources:</p>
        <ul className="source-error-list">
          {sourceErrors.map(err => (
            <li key={err.sourceName}>
              <strong>{err.sourceName}</strong>: {err.error}
            </li>
          ))}
        </ul>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="news-list-empty" role="status">
        <p>{showBookmarkedOnly ? 'No bookmarked articles yet.' : 'No articles found. Try selecting different sources.'}</p>
      </div>
    );
  }

  const displayArticles = articles.slice(0, visibleCount);

  const renderCards = (items: Article[]) => (
    items.map((article, index) => (
      <NewsCard
        key={`${article.url}-${index}`}
        article={article}
        isBookmarked={bookmarkedUrls.has(article.url)}
        isRead={readUrls.has(article.url)}
        onToggleBookmark={onToggleBookmark}
        onMarkRead={onMarkRead}
        onPreview={onPreview}
        onShare={onShare}
        onSpeak={onSpeak}
        viewMode={viewMode}
      />
    ))
  );

  if (groupBySource) {
    const grouped = new Map<string, Article[]>();
    for (const article of displayArticles) {
      const existing = grouped.get(article.sourceName) || [];
      existing.push(article);
      grouped.set(article.sourceName, existing);
    }

    return (
      <div className="news-list news-list-grouped">
        {Array.from(grouped.entries()).map(([source, sourceArticles]) => (
          <div key={source} className="news-source-group">
            <h3 className="source-group-header">{source} <span className="source-count">({sourceArticles.length})</span></h3>
            <div className="source-group-articles">
              {renderCards(sourceArticles)}
            </div>
          </div>
        ))}
        <div className="scroll-sentinel" ref={sentinelRef} style={{ height: '1px', width: '100%' }}></div>
      </div>
    );
  }

  return (
    <div className={`news-list ${viewMode === 'compact' ? 'news-list-compact' : ''}`}>
      {renderCards(displayArticles)}
      <div className="scroll-sentinel" ref={sentinelRef} style={{ height: '1px', width: '100%' }}></div>
    </div>
  );
}
