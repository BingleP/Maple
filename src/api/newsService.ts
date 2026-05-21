import { Article, NewsSource, FeedResult, SourceHealth } from '../types';

export const CANADIAN_SOURCES: NewsSource[] = [
  {
    name: 'CBC News',
    feedUrl: '/api/feed/cbc/webfeed/rss/rss-canada',
    homepage: 'https://www.cbc.ca/news',
    category: 'National',
  },
  {
    name: 'CBC Top Stories',
    feedUrl: '/api/feed/cbc/webfeed/rss/rss-topstories',
    homepage: 'https://www.cbc.ca/news',
    category: 'Top Stories',
  },
  {
    name: 'CTV News',
    feedUrl: '/api/feed/ctv/arc/outboundfeeds/rss/',
    homepage: 'https://www.ctvnews.ca',
    category: 'Top Stories',
  },
  {
    name: 'CBC World',
    feedUrl: '/api/feed/cbc/webfeed/rss/rss-world',
    homepage: 'https://www.cbc.ca/news/world',
    category: 'World',
  },
  {
    name: 'Global News',
    feedUrl: '/api/feed/globalnews/feed/',
    homepage: 'https://globalnews.ca',
    category: 'National',
  },
  {
    name: 'Toronto Star',
    feedUrl: '/api/feed/thestar/search/?f=rss&t=article&c=news/*',
    homepage: 'https://www.thestar.com',
    category: 'Regional',
  },
  {
    name: 'National Post',
    feedUrl: '/api/feed/nationalpost/feed',
    homepage: 'https://nationalpost.com',
    category: 'National',
  },
  {
    name: 'CBC Politics',
    feedUrl: '/api/feed/cbc/webfeed/rss/rss-politics',
    homepage: 'https://www.cbc.ca/news/politics',
    category: 'Politics',
  },
  {
    name: 'CBC Business',
    feedUrl: '/api/feed/cbc/webfeed/rss/rss-business',
    homepage: 'https://www.cbc.ca/news/business',
    category: 'Business',
  },
  {
    name: 'The Globe and Mail',
    feedUrl: '/api/feed/globeandmail/arc/outboundfeeds/rss/?outputType=xml',
    homepage: 'https://www.theglobeandmail.com',
    category: 'National',
  },
  {
    name: "Maclean's",
    feedUrl: '/api/feed/macleans/feed/',
    homepage: 'https://www.macleans.ca',
    category: 'National',
  },
  {
    name: 'iPolitics',
    feedUrl: '/api/feed/ipolitics/feed/',
    homepage: 'https://www.ipolitics.ca',
    category: 'Politics',
  },
  {
    name: 'The Canadian Press',
    feedUrl: '/api/feed/canadianpress/feed/',
    homepage: 'https://www.thecanadianpress.com',
    category: 'National',
  },
  {
    name: 'BNN Bloomberg',
    feedUrl: '/api/feed/bnnbloomberg/arc/outboundfeeds/rss/',
    homepage: 'https://www.bnnbloomberg.ca',
    category: 'Business',
  },
  {
    name: 'APTN News',
    feedUrl: '/api/feed/aptnnews/feed/',
    homepage: 'https://www.aptnnews.ca',
    category: 'Indigenous',
  },
  {
    name: 'The Narwhal',
    feedUrl: '/api/feed/thenarwhal/feed/',
    homepage: 'https://thenarwhal.ca',
    category: 'Environment',
  },
  {
    name: 'CityNews',
    feedUrl: '/api/feed/citynews/feed/',
    homepage: 'https://www.citynews.ca',
    category: 'National',
  },
];

async function fetchFeed(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }
  return response.text();
}

function extractImageFromContent(content: string): string | undefined {
  const imgMatch = content.match(/<img[^>]+src=["']([^"'>]+)["']/);
  return imgMatch ? imgMatch[1] : undefined;
}

function cleanDescription(html: string): string {
  const text = html.replace(/<[^>]*>/g, '');
  const decoded = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  return decoded.trim().substring(0, 300);
}

function extractImage(item: Element, description: string, content: string): string | undefined {
  const enclosure = item.querySelector('enclosure');
  const enclosureUrl = enclosure?.getAttribute('url');
  if (enclosureUrl) return enclosureUrl;

  const mediaContent = item.querySelector('media\\:content[medium="image"], media\\:content');
  const mediaContentUrl = mediaContent?.getAttribute('url');
  if (mediaContentUrl) return mediaContentUrl;

  const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
  const mediaThumbnailUrl = mediaThumbnail?.getAttribute('url');
  if (mediaThumbnailUrl) return mediaThumbnailUrl;

  const imgFromContent = extractImageFromContent(content);
  if (imgFromContent) return imgFromContent;

  const imgFromDescription = extractImageFromContent(description);
  if (imgFromDescription) return imgFromDescription;

  const allImages = item.querySelectorAll('img');
  if (allImages.length > 0) {
    const firstImg = allImages[0].getAttribute('src');
    if (firstImg) return firstImg;
  }

  return undefined;
}

function parseRSS(xml: string, sourceName: string, sourceCategory: string): Article[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.warn(`Failed to parse RSS feed for ${sourceName}`);
    return [];
  }

  const articles: Article[] = [];
  const items = doc.querySelectorAll('item');

  items.forEach((item) => {
    const title = item.querySelector('title')?.textContent || 'No title';
    const link = item.querySelector('link')?.textContent || '#';
    const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
    const description = item.querySelector('description')?.textContent || '';
    const content = item.querySelector('content\\:encoded, encoded')?.textContent || description;
    const imageUrl = extractImage(item, description, content);

    const categoryEl = item.querySelector('category');
    const category = categoryEl?.textContent || sourceCategory;

    articles.push({
      title: title.trim(),
      description: cleanDescription(description),
      url: link,
      sourceName,
      publishedAt: new Date(pubDate).toISOString(),
      imageUrl,
      category,
    });
  });

  return articles;
}

function parseAtom(xml: string, sourceName: string, sourceCategory: string): Article[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.warn(`Failed to parse Atom feed for ${sourceName}`);
    return [];
  }

  const articles: Article[] = [];
  const entries = doc.querySelectorAll('entry');

  entries.forEach((entry) => {
    const title = entry.querySelector('title')?.textContent || 'No title';
    const linkEl = entry.querySelector('link[rel="alternate"], link');
    const link = linkEl?.getAttribute('href') || '#';
    const updated = entry.querySelector('updated, published')?.textContent || new Date().toISOString();
    const summary = entry.querySelector('summary')?.textContent || entry.querySelector('content')?.textContent || '';
    const contentEl = entry.querySelector('content');
    const imageUrl = extractImage(entry, summary, contentEl?.textContent || summary);

    const categoryEl = entry.querySelector('category');
    const category = categoryEl?.getAttribute('term') || sourceCategory;

    articles.push({
      title: title.trim(),
      description: cleanDescription(summary),
      url: link,
      sourceName,
      publishedAt: new Date(updated).toISOString(),
      imageUrl,
      category,
    });
  });

  return articles;
}

async function fetchSourceFeed(source: NewsSource): Promise<{ articles: Article[]; error: string | null }> {
  try {
    const xml = await fetchFeed(source.feedUrl);

    if (xml.includes('<feed') || xml.includes('xmlns="http://www.w3.org/2005/Atom')) {
      return { articles: parseAtom(xml, source.name, source.category), error: null };
    }

    return { articles: parseRSS(xml, source.name, source.category), error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching feed for ${source.name}:`, message);
    return { articles: [], error: message };
  }
}

function getSourceProxyPrefix(url: string): string | null {
  const source = CANADIAN_SOURCES.find(s => url.startsWith(s.homepage));
  if (!source) return null;
  return source.feedUrl.replace(/\/[^/]+$/, '');
}

function extractImageFromPage(html: string): string | undefined {
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/);
  if (ogImage) return ogImage[1];

  const ogImageAlt = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/);
  if (ogImageAlt) return ogImageAlt[1];

  const twitterImage = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/);
  if (twitterImage) return twitterImage[1];

  const twitterImageAlt = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/);
  if (twitterImageAlt) return twitterImageAlt[1];

  const postmediaCdn = html.match(/https:\/\/smartcdn\.gprod\.postmedia\.digital\/nationalpost\/wp-content\/uploads\/[^"'\s]+/);
  if (postmediaCdn) return postmediaCdn[0];

  const ctvResizer = html.match(/https:\/\/www\.ctvnews\.ca\/resizer\/v2\/[^"'\s]+/);
  if (ctvResizer) return ctvResizer[0];

  const firstLargeImg = html.match(/<img[^>]+src=["']([^"'>]+\.(?:jpg|jpeg|png|webp))["'][^>]*(?:width=["']\d{3,}["']|class=["'][^"']*large[^"']*["'])/i);
  if (firstLargeImg) return firstLargeImg[1];

  return undefined;
}

async function fetchArticleImage(articleUrl: string): Promise<string | undefined> {
  if (articleUrl === '#' || !articleUrl.startsWith('http')) {
    return undefined;
  }

  try {
    const proxyPrefix = getSourceProxyPrefix(articleUrl);
    if (!proxyPrefix) return undefined;

    const path = articleUrl.replace(/^https?:\/\/[^/]+/, '');
    const proxyUrl = `${proxyPrefix}${path}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) return undefined;

    const html = await response.text();
    return extractImageFromPage(html);
  } catch {
    return undefined;
  }
}

export async function fetchAllFeeds(sources: NewsSource[], onImagesUpdated?: (articles: Article[]) => void): Promise<FeedResult> {
  const results = await Promise.allSettled(sources.map(async (source, index) => {
    const result = await fetchSourceFeed(source);
    return { ...result, index };
  }));

  const allArticles: Article[] = [];
  const errors: { sourceName: string; error: string }[] = [];
  const sourceHealth: SourceHealth[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value.articles);
      if (result.value.error) {
        errors.push({ sourceName: sources[result.value.index].name, error: result.value.error });
        sourceHealth.push({
          sourceName: sources[result.value.index].name,
          status: 'error',
          lastFetched: new Date(),
          articleCount: 0,
          error: result.value.error,
        });
      } else {
        sourceHealth.push({
          sourceName: sources[result.value.index].name,
          status: 'ok',
          lastFetched: new Date(),
          articleCount: result.value.articles.length,
        });
      }
    } else {
      const source = sources[result.reason?.index ?? 0];
      errors.push({ sourceName: source?.name || 'Unknown', error: 'Failed to fetch' });
      sourceHealth.push({
        sourceName: source?.name || 'Unknown',
        status: 'error',
        lastFetched: new Date(),
        articleCount: 0,
        error: 'Failed to fetch',
      });
    }
  });

  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Fetch images in background without blocking
  fetchMissingImages(allArticles, onImagesUpdated);

  return { articles: allArticles, errors, sourceHealth };
}

async function fetchMissingImages(articles: Article[], onImagesUpdated?: (articles: Article[]) => void): Promise<void> {
  const articlesWithoutImages = articles.filter(a => !a.imageUrl && a.url !== '#');
  if (articlesWithoutImages.length === 0) return;

  const batchSize = 3;
  let hasUpdates = false;

  for (let i = 0; i < articlesWithoutImages.length; i += batchSize) {
    const batch = articlesWithoutImages.slice(i, i + batchSize);
    const imageResults = await Promise.allSettled(batch.map(a => fetchArticleImage(a.url)));

    imageResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const article = articles.find(a => a.url === batch[index].url);
        if (article) {
          article.imageUrl = result.value;
          hasUpdates = true;
        }
      }
    });

    if (hasUpdates && onImagesUpdated) {
      onImagesUpdated([...articles]);
    }

    if (i + batchSize < articlesWithoutImages.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}
