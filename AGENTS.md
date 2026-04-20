# Developer & Agent Guidelines (AGENTS.md)

This file contains architectural context, design philosophy, and technical guidelines for any AI agent or developer contributing to the PRISMA codebase. **Read this before making modifications.**

## 1. Architectural Philosophy
PRISMA is a minimalist, **client-side only (Vanilla JS)** Single Page Application (SPA) structured across a few distinct HTML files. 
- **No Build Tools:** There is no Webpack, Vite, Node.js, or npm dependency chain. All code is meant to run directly in the browser. 
- **Vanilla Everything:** Do not introduce external heavy frameworks (like React, Vue, or TailwindCSS). We use raw CSS variables and Vanilla ES6+ JavaScript.
- **Design System:** All aesthetic decisions must align with the `DESIGN.md` guidelines. It contains the core philosophy ("Neon Library"), spacing rules, typography, and color palette.
- **Data Layer:** The "database" is entirely static, residing in `data/articles.json`. All fetching happens client-side via the Fetch API.

## 2. Core Components

### `js/app.js` (The Brain)
- Handles routing based on the `data-page` attribute on the `<body>` of the current HTML file.
- Responsible for fetching `articles.json`, filtering, and dynamic rendering via template literals.
- Controls DOM manipulation for search logic, topics filtering, and mobile menus.
- Responsible for SEO tag updates (`updateSEO`).

### `js/i18n.js` (Localization)
- Dictionary-based translation.
- Automatically scans the DOM for elements with `data-i18n` and replaces their `innerHTML` with the translated text.
- Provides `window.i18n.t(key)` for dynamic string translations inside JS template literals.
- Triggers a `langchange` event on the `window` object when the language switches, prompting `app.js` to re-render dynamic content (like chronological logs or article details).

### `css/styles.css` (The Design System)
- Uses an extensive set of CSS Custom Properties (Variables) at the `:root` level for colors, spacing, typography, and border radii.
- **Do not hardcode colors.** Always use the CSS variables (e.g., `var(--primary)`, `var(--surface-container)`).
- Media queries follow a mobile-first approach. Be careful with CSS specificity; always place larger breakpoint media queries (`min-width`) at the bottom of the file.

## 3. Important Mechanisms & State Management

- **Article Resolution:** In `article.html`, the system reads the `?id=` query parameter to determine which article to fetch from `articles.json`.
- **Search & Topics:** 
  - The search bar in the header redirects to `topics.html?q={query}`. 
  - `topics.html` reads `?q=` and `?tags=` to filter articles locally. 
  - Filters update the URL using the `History API` (`pushState`) without reloading the page, allowing users to share specific search states.
- **Cache Busting:** Browsers tend to aggressively cache static `.js` and `.css` files. If making logic or style modifications, increment the `?v=X` parameter in the HTML `<script>` and `<link>` tags to force cache invalidation. Dynamic data fetches (like `fetch('data/articles.json')`) already use `{ cache: 'no-store' }`.

## 4. Limitations & Future Considerations

- **SEO Limitations:** Because content and meta-tags (`og:title`, `og:image`) are generated client-side via JavaScript, some legacy social media crawlers (which do not execute JS) might only see the fallback static meta-tags in the HTML. **If true zero-JS SEO becomes a strict requirement**, the project should be migrated to a Static Site Generator (SSG) like Astro, Next.js, or Eleventy. Do not attempt to add server-side logic in the current architecture.
- **Performance:** For massive scalability (e.g., thousands of articles), loading the entire `articles.json` into memory on every page load might become a bottleneck. Pagination or a search index (like Lunr.js) should be considered if the dataset grows significantly.

## 5. Workflows
Standardized procedures for content integration and maintenance are located in `.agent/workflows/`. Always refer to these files when performing complex operations.

## 6. Development Rules
1. **Consistency:** If adding a new page, reuse the existing Header and Footer templates.
2. **Translation First:** Do not hardcode user-facing strings in HTML or JS. Always add a key to `i18n.js` and reference it.
3. **Accessibility:** Preserve `aria-label` attributes and focus states. Ensure interactive elements are keyboard accessible.
