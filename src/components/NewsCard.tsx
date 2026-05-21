import { memo } from 'react';
import { Article } from '../types';
import { formatDate } from '../utils/format';

interface NewsCardProps {
  article: Article;
  isBookmarked: boolean;
  isRead: boolean;
  onToggleBookmark: (article: Article) => void;
  onMarkRead: (url: string) => void;
  onPreview: (article: Article) => void;
  onShare: (article: Article) => void;
  onSpeak?: (article: Article) => void;
  viewMode?: 'card' | 'compact';
}

const SOURCE_COLORS: Record<string, string> = {
  'CBC News': '#e60012',
  'CBC Top Stories': '#e60012',
  'CBC World': '#e60012',
  'CBC Politics': '#e60012',
  'CBC Business': '#e60012',
  'CTV News': '#2563eb',
  'Global News': '#dc2626',
  'Toronto Star': '#1d4ed8',
  'National Post': '#1a1a1a',
};

export const NewsCard = memo(function NewsCard({ article, isBookmarked, isRead, onToggleBookmark, onMarkRead, onPreview, onShare, onSpeak, viewMode = 'card' }: NewsCardProps) {
  const bgColor = SOURCE_COLORS[article.sourceName] || '#6b7280';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onMarkRead(article.url);
    onPreview(article);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare(article);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleBookmark(article);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSpeak?.(article);
  };

  if (viewMode === 'compact') {
    return (
      <article className={`news-card news-card-compact ${isRead ? 'is-read' : ''}`} role="article">
        <div className="compact-left">
          {article.imageUrl ? (
            <div className="compact-image">
              <img src={article.imageUrl} alt="" loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 80px" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          ) : (
            <div className="compact-image compact-image-fallback" style={{ background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)` }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
          )}
        </div>
        <div className="compact-content">
          <div className="compact-meta">
            <span className="news-card-source">{article.sourceName}</span>
            <time className="news-card-date" dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </div>
          <h3 className="compact-title">
            <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
              {article.title}
            </a>
          </h3>
          <div className="compact-actions">
            <button className="action-btn" onClick={handleShare} title="Share article" aria-label="Share article">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
            {onSpeak && (
              <button className="action-btn" onClick={handleSpeak} title="Read aloud" aria-label="Read article aloud">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </button>
            )}
            <button className={`action-btn ${isBookmarked ? 'active' : ''}`} onClick={handleBookmark} title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'} aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`news-card ${isRead ? 'is-read' : ''}`} role="article">
      {article.imageUrl ? (
        <div className="news-card-image">
          <div className="image-placeholder" style={{ background: `linear-gradient(135deg, ${bgColor}22, ${bgColor}11)` }}></div>
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="news-card-img"
            onLoad={(e) => { (e.target as HTMLImageElement).classList.add('loaded'); }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement?.classList.add('image-fallback'); }}
          />
        </div>
      ) : (
        <div className="news-card-image image-fallback" style={{ background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)` }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
      )}
      <div className="news-card-content">
        <div className="news-card-meta">
          <span className="news-card-source">{article.sourceName}</span>
          <span className="news-card-meta-right">
            {article.category && <span className="article-category">{article.category}</span>}
            <time className="news-card-date" dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
          </span>
        </div>
        <h3 className="news-card-title">
          <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
            {article.title}
          </a>
        </h3>
        {article.description && (
          <p className="news-card-description">{article.description}</p>
        )}
        <div className="news-card-footer">
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-card-link" onClick={handleClick}>
            Read full story
          </a>
          <div className="news-card-actions">
            {onSpeak && (
              <button className="action-btn" onClick={handleSpeak} title="Read aloud" aria-label="Read article aloud">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </button>
            )}
            <button className="action-btn" onClick={handleShare} title="Share article" aria-label="Share article">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
            <button className={`action-btn ${isBookmarked ? 'active' : ''}`} onClick={handleBookmark} title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'} aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});
