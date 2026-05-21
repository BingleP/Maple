import { useEffect, useRef, useCallback } from 'react';
import { Article } from '../types';
import { formatFullDate } from '../utils/format';

interface ArticlePreviewModalProps {
  article: Article | null;
  onClose: () => void;
  onOpenFull: (article: Article) => void;
}

export function ArticlePreviewModal({ article, onClose, onOpenFull }: ArticlePreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (article) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    }
  }, [article]);

  useEffect(() => {
    if (!article) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [article]);

  const handleClose = useCallback(() => {
    onClose();
    previousFocusRef.current?.focus();
  }, [onClose]);

  if (!article) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" ref={modalRef} tabIndex={-1}>
        <button className="modal-close" onClick={handleClose} title="Close preview" aria-label="Close preview">
          &times;
        </button>
        {article.imageUrl && (
          <div className="modal-image">
            <img src={article.imageUrl} alt="" />
          </div>
        )}
        <div className="modal-body">
          <div className="modal-meta">
            <span className="modal-source">{article.sourceName}</span>
            {article.category && <span className="modal-category">{article.category}</span>}
          </div>
          <h2 className="modal-title" id="modal-title">{article.title}</h2>
          <time className="modal-date" dateTime={article.publishedAt}>
            {formatFullDate(article.publishedAt)}
          </time>
          <p className="modal-description">{article.description}</p>
          <div className="modal-actions">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-read-btn"
              onClick={() => onOpenFull(article)}
            >
              Read full story
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
