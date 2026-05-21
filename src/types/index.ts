export interface Article {
  title: string;
  description: string;
  url: string;
  sourceName: string;
  publishedAt: string;
  imageUrl?: string;
  category?: string;
}

export interface NewsSource {
  name: string;
  feedUrl: string;
  homepage: string;
  category: string;
}

export interface SourceError {
  sourceName: string;
  error: string;
}

export interface SourceHealth {
  sourceName: string;
  status: 'ok' | 'error' | 'loading';
  lastFetched: Date | null;
  articleCount: number;
  error?: string;
}

export interface FeedResult {
  articles: Article[];
  errors: SourceError[];
  sourceHealth: SourceHealth[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export type SortOption = 'newest' | 'oldest' | 'source';
