export function SkeletonCard() {
  return (
    <article className="news-card skeleton-card">
      <div className="skeleton-image"></div>
      <div className="news-card-content">
        <div className="skeleton-meta">
          <div className="skeleton-text skeleton-sm"></div>
          <div className="skeleton-text skeleton-sm"></div>
        </div>
        <div className="skeleton-text skeleton-md"></div>
        <div className="skeleton-text skeleton-md"></div>
        <div className="skeleton-text skeleton-lg"></div>
        <div className="skeleton-text skeleton-sm"></div>
      </div>
    </article>
  );
}
