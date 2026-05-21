# Canada News Hub

A live Canadian news aggregator built with React, TypeScript, and Vite. Fetches, parses, and displays articles from major Canadian news sources via RSS/Atom feeds with a modern glassmorphism UI.

## Features

### Content
- **16 RSS/Atom feeds** from CBC News, CTV News, Global News, National Post, The Globe and Mail, and more
- **Dual format parsing** -- auto-detects and parses both RSS 2.0 and Atom 1.0
- **Image extraction** -- 5-tier fallback: enclosure → content `<img>` → description `<img>` → media:content → media:thumbnail → og:image from article pages
- **Reading time estimates** (200 wpm) and relative date formatting
- **Category filtering** extracted from feed metadata

### Navigation & Display
- **Infinite scroll** via IntersectionObserver (20 articles per batch)
- **Card view** and **Compact view** toggle
- **Group by source** with 2-column grid layout
- **Full-text search** across titles, sources, and descriptions
- **Sort** by Newest, Oldest, or Source name
- **Trending keywords** -- clickable tags extracted from article content
- **Feed statistics** -- bar chart showing article distribution per source

### Personalization
- **Bookmarking** with badge count, export/import as JSON
- **Read history** -- opened articles are dimmed
- **Dark mode** with system preference detection
- **Auto-refresh** every 10 minutes (toggleable)
- **Font size controls** (12px–24px)
- **Source filtering** sidebar with health indicators

### Interaction
- **Text-to-speech** -- reads articles aloud via Web Speech API
- **Share** -- Web Share API with clipboard fallback
- **Article preview modal** with in-app reading
- **Toast notifications** for all actions
- **Keyboard shortcuts** (`/`, `r`, `d`, `b`, `Esc`)

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | React 18 |
| Language | TypeScript 5.6 |
| Build Tool | Vite 6 |
| Styling | Plain CSS with custom properties |
| State | React hooks (`useState`, `useMemo`, `useCallback`, `useRef`) |

## Getting Started

Requires [Bun](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`).

```bash
# Install dependencies
bun install

# Start dev server (port 3000)
bun dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.css
    ├── types/
    │   └── index.ts
    ├── api/
    │   └── newsService.ts
    ├── utils/
    │   ├── keywords.ts
    │   └── format.ts
    └── components/
        ├── Header.tsx
        ├── NewsList.tsx
        ├── NewsCard.tsx
        ├── SourceFilter.tsx
        ├── ArticlePreviewModal.tsx
        ├── TopKeywords.tsx
        ├── FeedStats.tsx
        ├── SkeletonCard.tsx
        ├── Toast.tsx
        └── ErrorBoundary.tsx
```

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` or `Ctrl+K` | Focus search bar |
| `r` | Refresh news |
| `d` | Toggle dark mode |
| `b` | Toggle bookmarked-only view |
| `Esc` | Close modal / clear search / close sidebar |

## Deployment

### Nginx Configuration

The Vite dev proxy must be replicated in production. Add these blocks to your nginx config:

```nginx
# RSS feed proxies
location /api/feed/cbc/ {
    proxy_pass https://www.cbc.ca/;
    proxy_set_header Host www.cbc.ca;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/ctv/ {
    proxy_pass https://www.ctvnews.ca/;
    proxy_set_header Host www.ctvnews.ca;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/globalnews/ {
    proxy_pass https://globalnews.ca/;
    proxy_set_header Host globalnews.ca;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/nationalpost/ {
    proxy_pass https://nationalpost.com/;
    proxy_set_header Host nationalpost.com;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/globeandmail/ {
    proxy_pass https://www.theglobeandmail.com/;
    proxy_set_header Host www.theglobeandmail.com;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/macleans/ {
    proxy_pass https://www.macleans.ca/;
    proxy_set_header Host www.macleans.ca;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/ipolitics/ {
    proxy_pass https://www.ipolitics.ca/;
    proxy_set_header Host www.ipolitics.ca;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/canadianpress/ {
    proxy_pass https://www.thecanadianpress.com/;
    proxy_set_header Host www.thecanadianpress.com;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/bnnbloomberg/ {
    proxy_pass https://www.bnnbloomberg.ca/;
    proxy_set_header Host www.bnnbloomberg.ca;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/aptnnews/ {
    proxy_pass https://www.aptnnews.ca/;
    proxy_set_header Host www.aptnnews.ca;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/thenarwhal/ {
    proxy_pass https://thenarwhal.ca/;
    proxy_set_header Host thenarwhal.ca;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

location /api/feed/citynews/ {
    proxy_pass https://www.citynews.ca/;
    proxy_set_header Host www.citynews.ca;
    proxy_set_header User-Agent "Maple-News-Hub/1.0";
}

# Static SPA
location / {
    root /var/www/canada-news-hub;
    try_files $uri $uri/ /index.html;
}
```

### Security Headers

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://www.cbc.ca https://www.ctvnews.ca https://globalnews.ca https://nationalpost.com https://www.theglobeandmail.com https://www.macleans.ca https://www.ipolitics.ca https://www.thecanadianpress.com https://www.bnnbloomberg.ca https://www.aptnnews.ca https://thenarwhal.ca https://www.citynews.ca; font-src 'self';" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-XSS-Protection "0" always;

# Rate limit feed proxies
limit_req_zone $binary_remote_addr zone=feed:10m rate=10r/m;
location /api/feed/ {
    limit_req zone=feed burst=5 nodelay;
    # ... proxy config above
}
```

### Build & Deploy

```bash
bun run build
# Upload dist/ to your server
scp -r dist/* user@server:/var/www/canada-news-hub/
```

## RSS Sources

| Source | Category |
|---|---|
| CBC News | National |
| CBC Top Stories | Top Stories |
| CTV News | Top Stories |
| CBC World | World |
| Global News | National |
| National Post | National |
| The Globe and Mail | National |
| Maclean's | National |
| iPolitics | Politics |
| The Canadian Press | National |
| BNN Bloomberg | Business |
| APTN News | Indigenous |
| The Narwhal | Environment |
| CityNews | National |
| CBC Politics | Politics |
| CBC Business | Business |

## Architecture

- **CORS**: Handled via server-side proxy (Vite dev proxy in development, nginx in production)
- **Feed parsing**: Browser-native `DOMParser` with auto-detection of RSS vs Atom format
- **State**: React hooks with `useMemo` for expensive computations, `memo` for component optimization
- **Persistence**: `localStorage` for bookmarks, read history, preferences
- **Error handling**: `Promise.allSettled` for parallel feed fetching, React `ErrorBoundary` for crash recovery
- **Performance**: CSS `contain`, lazy image loading, IntersectionObserver, reduced `backdrop-filter` on mobile

## License

MIT
