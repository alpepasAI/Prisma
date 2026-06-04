# Developer & Agent Guidelines (AGENTS.md)

This file contains architectural context, design philosophy, and technical guidelines for any AI agent or developer contributing to the PRISMA codebase. **Read this before making modifications.**

---

## 0. Agentic Collaboration & Engineering Paradigm

PRISMA is designed as an **agent-first repository**. This means the codebase is engineered not only for human readability but specifically to act as a structured environment where AI agents (LLMs) can contribute with high autonomy, zero design regressions, and strict adherence to patterns.

### Why this is a Demonstration of Agentic Engineering
AI agents are highly capable but prone to specific failure modes: *circular imports, design drift, style inflation (e.g. leaking Tailwind styles in dark mode), and cache invalidation oversights*. To prevent this, the repository implements a system of **architectural constraints** and **executable markdown protocols**:

1. **Strict Dependency Layering:** By enforcing a strict one-way import hierarchy (`data.js` ➔ `ui.js` ➔ `renderer.js` ➔ `app.js`), agents are architecturally blocked from creating circular dependencies, which would crash the ES6 module execution.
2. **Workflows as Executive State Machines (.agent/workflows/):** Workflows are not just text files; they are strict protocols designed to be followed sequentially by LLMs. They define input validation, file positioning, and automatic script invocation (Python-based Pillow scripts) to bridge the gap between LLM text generation and deterministic image processing.
3. **Data-Isolated Dashboards:** By separating the dashboard UI components into declarative JSON schemas (`interactive.json`), the agent is restricted to safe, sandboxed structural edits, avoiding modifications to the critical rendering loop.
4. **Enforced Design Constraints:** Setting a hard rule against inline hex codes and framework-specific utility classes in favor of native CSS Custom Properties prevents LLMs from introducing visual drift.

---

## 1. Architectural Philosophy

PRISMA is a minimalist, **client-side only (Vanilla JS)** Multi-Page Application (MPA) structured across a few distinct HTML files.

- **No Build Tools:** There is no Webpack, Vite, Node.js, or npm dependency chain. All code runs directly in the browser via native ES6 modules.
- **Vanilla Everything:** Do not introduce external heavy frameworks (React, Vue, TailwindCSS). We use raw CSS variables and Vanilla ES6+ JavaScript with native `import`/`export`.
- **ES6 Module Architecture:** The JS layer is split into focused modules (`data.js`, `ui.js`, `renderer.js`, `interactive.js`) orchestrated by `app.js`. See `ARCHITECTURE.md` for the full dependency map and module contracts.
- **Design System:** All aesthetic decisions must align with `DESIGN.md`. It contains the core philosophy ("Neon Library"), spacing rules, typography, and color palette.
- **Branding Assets:** The master logo (`assets/sources/master-logo.png`) is the source of truth for the brand. Derived assets (`assets/favicon.png`, `assets/logo.png`) must be updated if the master design changes.
- **Data Layer:** The "database" is entirely static, residing in `data/articles.json`. All fetching happens client-side via the Fetch API with an in-memory cache.

> [!IMPORTANT]
> **ES6 modules require an HTTP server.** Never open HTML files directly via `file://` — imports will fail due to CORS. Always use `npx serve .`, `python3 -m http.server`, or any local server.

---

## 2. Core Components

### `js/app.js` — The Orchestrator
- Entry point loaded by all HTML pages as `<script type="module">`.
- Reads `document.body.dataset.page` and delegates to the correct page `init*` function.
- Contains `initHome()`, `initArticle()`, and `initTopics()` — page-specific logic that is too tightly coupled to individual DOM structures to live elsewhere.
- Imports from all sibling modules; does **not** perform any data fetching or direct DOM rendering itself.

### `js/data.js` — The Data Layer
- Single source of truth for all article data access.
- Maintains an in-memory cache (`articlesData`) so `articles.json` is only fetched once per session.
- **Key exports:** `loadArticles()`, `getFeatured()`, `getArticleById(id)`, `getArticleId()`, `getPdfUrl()`, `getInfographicUrl()`, `formatDate()`, `getTagVariant()`, `translateTag()`.
- Has **zero DOM dependencies** — pure data functions only.

### `js/ui.js` — UI Utilities
- Shared UI behaviour used across all pages.
- **Key exports:** `updateSEO()`, `initHamburger()`, `initSearch()`, `initLightbox()`, `ensureLightbox()`, `initReadingProgress()`.
- `updateSEO()` uses `assets/logo.png` as the fallback `og:image` for crawlers that do not execute JS.
- Has a module-level `_lightboxCloseBound` flag to prevent duplicate event listeners on re-renders.

### `js/renderer.js` — Content Rendering
- Responsible for all dynamic `innerHTML` rendering.
- **Key exports:** `renderHero()`, `renderChronolog()`, `renderArticleList()`, `renderArticleDetail()`, `renderRelatedArticles()`.
- On `renderArticleDetail()`, writing to `container.innerHTML` automatically replaces the skeleton placeholder HTML.
- Imports from `data.js` and `ui.js`; never import `renderer.js` from `data.js` or `ui.js` (no circular deps).

### `js/interactive.js` — Dashboard Engine
- All Chart.js configuration, tab switching, accordion logic, checklist interaction, and the KV Cache calculator.
- **Key exports:** `initInteractive()`, `renderInteractive()`, `initInteractiveCharts()`, `initInteractiveChecklist()`, `initKVCacheCalculator()`, `initTabs()`, `initAccordions()`.
- Maintains module-level `kvChartInst` to share the chart instance between rendering and the calculator, avoiding `this`-binding issues.
- New article-specific chart types should be added to `initInteractiveCharts()` as additional `if (chartData.myNewKey)` blocks.

### `js/i18n.js` — Localization
- Dictionary-based translation. Loaded as a **regular `<script>`** (not a module) so it sets `window.i18n` before ES6 modules execute.
- Automatically scans the DOM for `[data-i18n]` attributes and replaces content.
- Provides `window.i18n.t(key)` for use inside JS template literals.
- Dispatches a `langchange` event on `window` to trigger re-renders in page init functions.

### `css/styles.css` — The Design System
- Extensive CSS Custom Properties at `:root` level for colors, spacing, typography, and border radii.
- **Do not hardcode colors.** Always use variables (`var(--primary)`, `var(--surface-container)`, etc.).
- Media queries follow a **mobile-first** approach (`min-width`). Always place larger-breakpoint rules at the bottom.
- Includes the **Skeleton Screen** system (`@keyframes skeleton-shimmer`, `.skeleton`, and page-specific skeleton utility classes).

---

## 3. Important Mechanisms & Patterns

### Script Loading Order
All HTML pages follow this exact pattern at the bottom of `<body>`:
```html
<script src="js/i18n.js?v=35"></script>
<script type="module" src="js/app.js?v=35"></script>
```
`i18n.js` **must** be a regular script (not a module) and **must** come first. It sets `window.i18n` synchronously, which modules depend on at import time.

### Cache Busting
Increment the `?v=X` parameter in `<script>` and `<link>` tags in all four HTML files whenever you make logic or style changes. Additionally, you **must** increment the `CACHE_VERSION` constant in `sw.js` (Service Worker) to invalidate client-side caching of native ES6 modules. Current versions:
- `css/styles.css?v=35` (HTML files: `v=35`)
- `js/i18n.js?v=35` (HTML files: `v=35`)
- `js/app.js?v=35` (HTML files: `v=35`)
- `sw.js` `CACHE_VERSION`: `v35`

Data fetches (`articles.json`, markdown files) already use `{ cache: 'no-store' }` and do not need versioning.

### Skeleton Screens
HTML containers for dynamically-rendered content are **pre-populated with skeleton placeholder markup** in the HTML file. When a `render*()` function runs and sets `container.innerHTML = ...`, the skeleton is automatically replaced. To add skeletons to a new page:
1. Add skeleton HTML inside the target container in the `.html` file.
2. Use `.skeleton` + the existing utility classes (`skeleton-title`, `skeleton-line`, etc.) from `styles.css`.
3. No JS changes are needed — `innerHTML` replacement handles it automatically.

### SEO & Meta Tags
Each HTML page has **static fallback values** in all `og:*` and `twitter:*` meta tags so that crawlers without JS see real content:
- `og:image` / `twitter:image` → `https://prisma.alpepaslabs.com/assets/logo.png`
- `og:url` → absolute URL for that page
- `<link rel="canonical">` → absolute URL for that page

`updateSEO()` from `ui.js` overrides these at runtime with article-specific data. Never leave `og:image` empty.

### Article Resolution
`article.html` and `interactive.html` read `?id=` from the URL to resolve which article to load. Both pages redirect to `index.html` if no valid ID is found.

### Search & Topics
The search bar in the header redirects to `topics.html?q={query}` from other pages. On `topics.html` itself, `initTopics()` intercepts the input event to filter in-place (no page reload). Filters update the URL via the History API (`pushState`) for shareable states.

---

## 4. Limitations & Future Considerations

- **Performance at Scale:** `articles.json` is loaded entirely into memory. For datasets beyond ~100 articles, consider splitting by year or implementing a client-side index (Lunr.js).
- **Native CSS Dashboard Architecture:** The `interactive.html` dashboard now strictly uses native PRISMA CSS utilities (`css/styles.css`). **Do not use Tailwind classes** (`bg-red-50`, `text-amber-900`, etc.) when creating new interactive JSONs or JS logic, as they will cause contrast and layout regressions in dark mode. Always use PRISMA semantic classes (`interactive-box`, `text-on-surface-variant`, `box-warning`).
- **SEO for Social Crawlers:** Static fallback `og:*` tags are now in place. For true per-article social cards, the `og:image` would need to be a static per-article OG image asset. Add to `articles.json` and `renderer.js` if this becomes a requirement.
- **Sitemap:** `sitemap.xml` must be manually updated each time a new article is added. The article integration workflow (`.agent/workflows/article_integration.md`) should handle this step.

---

## 5. Workflows
Standardized procedures for content integration and maintenance are located in `.agent/workflows/`. Always refer to these files when performing complex operations.

---

## 6. Development Rules

1. **Module Boundaries:** New utility functions go in the appropriate module (`data.js` for data, `ui.js` for DOM utilities, `renderer.js` for rendering). Do not add rendering logic back into `app.js`.
2. **No Circular Imports:** The dependency order is `data.js` → `ui.js` → `renderer.js` → `app.js`. `interactive.js` imports from `data.js` and `ui.js`. Never create cycles.
3. **Consistency:** If adding a new page, replicate the Header/Footer HTML, the `data-page` attribute on `<body>`, and the standard script loading pattern. Register a new `initMyPage()` function in `app.js`.
4. **Translation First:** Do not hardcode user-facing strings in HTML or JS. Always add a key to both language dictionaries in `i18n.js` and reference it via `window.i18n.t('key')`.
5. **Skeleton First:** New pages or sections with async content should include skeleton placeholder HTML so users never see a blank flash.
6. **SEO Always:** New HTML pages must have populated static `og:*`, `twitter:*`, `<link rel="canonical">`, and a `<title>` with the PRISMA brand prefix.
7. **Cache Busting:** Bump `?v=X` on any modified `.js` or `.css` file across all four HTML files (using the same version number for simplicity), AND increment the `CACHE_VERSION` variable in `sw.js` to ensure the Service Worker refreshes all client-side cached ES6 modules.
8. **Accessibility:** Preserve `aria-label` attributes and focus states. Ensure interactive elements are keyboard accessible.
9. **No Hardcoded Colors:** Always use CSS variables. Never write hex values directly in component styles.
