# PRISMA — Architecture Reference (ARCHITECTURE.md)

Technical reference for the JavaScript module system. Read this when:
- Adding a new JS feature or utility function
- Creating a new interactive dashboard section
- Debugging an import error or unexpected behavior
- Understanding why something is in a specific module

---

## Module Dependency Graph

```
i18n.js  (regular <script>, sets window.i18n)
    │
    ▼
data.js  ──────────────────────────────────┐
    │                                       │
    ▼                                       ▼
ui.js                               interactive.js
    │                                       │
    ▼                                       │
renderer.js                                 │
    │                                       │
    └─────────────┬─────────────────────────┘
                  ▼
              app.js  (entry point, <script type="module">)
```

**Rules enforced by this graph:**
- `data.js` has **no imports** from the project (only built-in browser APIs)
- `ui.js` imports only from `data.js` — **not** from `renderer.js` or `interactive.js`
- `renderer.js` imports from `data.js` and `ui.js` — **not** from `app.js` or `interactive.js`
- `interactive.js` imports from `data.js` and `ui.js`
- `app.js` imports from all modules — **nothing** imports from `app.js`
- **Never create circular dependencies.** Browser ES6 modules do not handle them gracefully.

---

## Module Contracts

### `js/data.js`

**Purpose:** Pure data layer. Zero DOM access.

| Export | Signature | Description |
|--------|-----------|-------------|
| `loadArticles()` | `async () → Article[]` | Fetches `articles.json` once; returns cached result on subsequent calls |
| `getFeatured()` | `async () → Article` | Returns the article with `featured: true`, or the first article |
| `getArticleId()` | `() → string \| null` | Reads `?id=` from the current URL |
| `getArticleById(id)` | `async (string) → Article \| undefined` | Finds an article by its `id` field |
| `getPdfUrl(id, lang)` | `(string, string) → string` | Resolves the PDF asset path for an article |
| `getInfographicUrl(id, lang)` | `(string, string) → string` | Resolves the infographic asset path |
| `getShareData(article, lang)` | `(Article, string) → {url, title}` | Returns share-ready title + URL |
| `formatDate(dateStr)` | `(string) → string` | Localizes a `YYYY-MM-DD` date string |
| `getTagVariant(index)` | `(number) → 'primary' \| 'secondary' \| 'tertiary'` | Cycles tag color classes |
| `translateTag(tag)` | `(string) → string` | Looks up `tag_{tag}` in the i18n dictionary |

**The in-memory cache:**
```js
// Internal — not exported
let articlesData = null;

// loadArticles() sets articlesData on first call and returns the cached
// value on all subsequent calls within the same page session.
```

---

### `js/ui.js`

**Purpose:** Shared DOM utilities. Stateless except for the lightbox close-bound guard.

| Export | Signature | Description |
|--------|-----------|-------------|
| `updateSEO(title, desc, url?, img?)` | `(string, string, string?, string?) → void` | Updates all `og:*`, `twitter:*` and `<title>` tags. Falls back to `assets/logo.png` if `img` is empty |
| `initHamburger()` | `() → void` | Binds hamburger toggle and mobile nav close-on-link |
| `initSearch()` | `() → void` | Binds search icon expand/collapse and Enter-to-navigate |
| `initLightbox()` | `() → void` | Scans for `[data-infographic]` and binds open events. Safe to call multiple times (guards with `el._lightboxBound`) |
| `ensureLightbox()` | `() → void` | Creates the lightbox DOM if absent, then calls `initLightbox()` |
| `initReadingProgress()` | `() → void` | Binds scroll → width on `#reading-progress` bar |

**SEO fallback logic in `updateSEO()`:**
```js
const defaultImage = `${window.location.origin}/assets/logo.png`;
const finalImage   = imageUrl.startsWith('http')
  ? imageUrl
  : imageUrl ? `${origin}/${imageUrl}` : defaultImage;
```

---

### `js/renderer.js`

**Purpose:** All `innerHTML` writes. Imports from `data.js` and `ui.js`.

| Export | Signature | Description |
|--------|-----------|-------------|
| `renderHero()` | `async () → void` | Renders the featured article hero in `#hero-section` |
| `renderChronolog()` | `async () → void` | Renders full article list in `#chrono-log-list` |
| `renderArticleList(articles, el)` | `(Article[], HTMLElement) → void` | Renders a filtered/sorted list into any container |
| `renderArticleDetail()` | `async () → void` | Full article page render: header, prose, share bar, sidebar. Replaces skeleton automatically |
| `renderRelatedArticles(article)` | `async (Article) → void` | Renders the related articles grid in `#related-articles` |
| `updateSEO` | re-exported from `ui.js` | Available via `renderer.js` so `app.js` has a single import |

**Internal helpers (not exported):**
- `fetchMarkdown(file, lang)` — fetches and parses a `.md` file via `marked.parse()`
- `buildTagsHtml(tags, stopProp?)` — generates tag anchor HTML
- `buildIndicator(available, icon, ...)` — generates a format indicator (active link or inactive span)

**Skeleton replacement:**  
`renderArticleDetail()` writes to `#article-detail` with `container.innerHTML = ...`.  
The skeleton markup pre-loaded in `article.html` is inside `#article-detail`, so it is replaced automatically. No explicit skeleton cleanup code is needed.

---

### `js/interactive.js`

**Purpose:** Interactive dashboard: data-driven rendering, Chart.js, UI interactions.

| Export | Signature | Description |
|--------|-----------|-------------|
| `initInteractive()` | `async () → void` | Entry point for `interactive.html`. Loads article data and calls `renderInteractive()` |
| `renderInteractive(data)` | `(DashboardData) → void` | Renders nav, sections, applies theme, binds all interactions |
| `initInteractiveCharts(chartData)` | `(ChartData) → void` | Initialises/re-initialises Chart.js instances. Safe to call on every section switch |
| `initInteractiveChecklist(data)` | `(ChecklistItem[]) → void` | Renders and binds interactive checklist |
| `initKVCacheCalculator()` | `() → void` | Binds slider inputs to the KV Cache chart |
| `initTabs()` | `() → void` | Binds `[data-tab-btn]` generic tabs + article-specific tab groups |
| `initAccordions()` | `() → void` | Binds `.risk-toggle` and `.risk-header` accordions |

**Adding a new chart type:**
```js
// In initInteractiveCharts(), add a new block:
if (chartData.myNewChart) {
  safeInit('myChartCanvasId', {
    type: 'bar',
    data: { ... },
    options: { responsive: true, maintainAspectRatio: false, ... }
  });
}
```
Then add `"myNewChart": { ... }` to the article's interactive JSON file under `chartData`.

**Module-level state:**
```js
// kvChartInst is shared between initInteractiveCharts() and initKVCacheCalculator()
// without needing `this` binding.
let kvChartInst = null;
```

---

### `js/app.js`

**Purpose:** Entry point and orchestrator. ~150 lines.

**Routing pattern:**
```js
const page = document.body.dataset.page;
if      (page === 'home')        initHome();
else if (page === 'article')     initArticle();
else if (page === 'topics')      initTopics();
else if (page === 'interactive') initInteractive();
```

Each HTML page sets `<body data-page="...">`. Adding a new page:
1. Create the HTML file with `<body data-page="mypage">`.
2. Add a `async function initMyPage() { ... }` in `app.js`.
3. Add the `else if (page === 'mypage')` branch.
4. Import any needed functions from the relevant modules.

**`initTopics()` stays in `app.js`** because it is tightly coupled to the topics page DOM (tag filter buttons, logic toggle, results list) and has no reusable parts worth extracting.

---

## HTML Page Template

Every HTML page in PRISMA follows this structure:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title id="page-title">PRISMA — [Page Title]</title>
  <meta name="description" content="[Static description]" id="meta-desc" />

  <!-- Open Graph — MUST have real static values, not empty strings -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="PRISMA — [Page Title]" id="og-title" />
  <meta property="og:description" content="[Static description]" id="og-desc" />
  <meta property="og:url" content="https://prisma.alpepaslabs.com/[page].html" id="og-url" />
  <meta property="og:image" content="https://prisma.alpepaslabs.com/assets/logo.png" id="og-image" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <link rel="canonical" href="https://prisma.alpepaslabs.com/[page].html" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="PRISMA — [Page Title]" id="tw-title" />
  <meta name="twitter:description" content="[Static description]" id="tw-desc" />
  <meta name="twitter:image" content="https://prisma.alpepaslabs.com/assets/logo.png" id="tw-image" />

  <!-- Fonts & Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

  <!-- Favicons -->
  <link rel="icon" type="image/png" href="assets/favicon.png?v=1" />
  <link rel="apple-touch-icon" href="assets/logo.png?v=1" />

  <!-- Styles -->
  <link rel="stylesheet" href="css/styles.css?v=24" />
</head>
<body data-page="[page-identifier]">

  <!-- [Header, Nav, Content, Footer — see existing pages] -->

  <!-- Scripts: i18n FIRST as regular script, then app as module -->
  <script src="js/i18n.js?v=24"></script>
  <script type="module" src="js/app.js?v=24"></script>
</body>
</html>
```

> [!CAUTION]
> Do not swap the order of the two `<script>` tags. `i18n.js` must execute synchronously before any ES6 module code runs, because modules depend on `window.i18n` being available at import time.

---

## Adding New i18n Keys

Whenever you add a new user-facing string:
1. Add the key to **both** language objects in `js/i18n.js`:
```js
es: {
  my_new_key: 'Mi nuevo texto',
},
en: {
  my_new_key: 'My new text',
}
```
2. Use it in JS with `window.i18n.t('my_new_key')`.
3. Use it in static HTML with `data-i18n="my_new_key"` (the i18n engine will replace `innerHTML` on load and on language switch).

---

## Cache Busting Reference

| File | Current version | When to bump |
|------|----------------|--------------|
| `css/styles.css` | `?v=24` | Any CSS change |
| `js/i18n.js` | `?v=24` | Any translation change |
| `js/app.js` | `?v=24` | Any JS change in any module |

When bumping, update the version in **all 4 HTML files** simultaneously. The module files themselves (`data.js`, `ui.js`, etc.) do not need individual versioning — they are imported by `app.js` and will bust with it.

---

## Skeleton Screen Pattern

Pre-populate dynamic containers in HTML with shimmer placeholders:

```html
<!-- In the HTML file, inside the target container: -->
<div id="my-container">
  <div class="skeleton-entry">
    <div class="skeleton skeleton-h3"></div>
    <div class="skeleton skeleton-line"></div>
    <div class="skeleton skeleton-line-2"></div>
  </div>
</div>
```

In JS, when the async data is ready:
```js
document.getElementById('my-container').innerHTML = renderedHtml;
// ↑ This automatically removes the skeleton — no extra code needed.
```

Available skeleton utility classes (defined in `styles.css`):

| Class | Use for |
|-------|---------|
| `.skeleton` | Base shimmer class (apply to every skeleton element) |
| `.skeleton-tag` | Tag pill placeholder |
| `.skeleton-title` / `.skeleton-title-2` | Large heading placeholders |
| `.skeleton-h3` | Section heading placeholder |
| `.skeleton-summary` / `.skeleton-summary-2` | Body text paragraph |
| `.skeleton-button` | CTA button placeholder |
| `.skeleton-line` / `.skeleton-line-2` | Generic text line |
| `.skeleton-meta` | Metadata item (date, reading time) |
| `.skeleton-format-card` | Format card in hero |
| `.skeleton-article-title` / `.skeleton-article-title-2` | Article H1 |
| `.skeleton-prose-h2` | Prose section heading |
| `.skeleton-prose-line` | Prose body line |
| `.skeleton-sidebar-card` | Sidebar card placeholder |
