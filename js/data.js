/**
 * PRISMA — Data Layer (js/data.js)
 * Handles article loading, caching, and data utilities.
 */

let articlesData = null;

/**
 * Load articles catalog from JSON (cached after first load)
 */
export async function loadArticles() {
  if (articlesData) return articlesData;
  try {
    const response = await fetch('/data/articles.json', { cache: 'no-store' });
    const data = await response.json();
    articlesData = data.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    return articlesData;
  } catch (err) {
    console.error('Failed to load articles:', err);
    return [];
  }
}

/** Get featured article (marked as featured, or first) */
export async function getFeatured() {
  const articles = await loadArticles();
  return articles.find(a => a.featured) || articles[0];
}

/** Get article ID from URL query params */
export function getArticleId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/** Get article by ID */
export async function getArticleById(id) {
  const articles = await loadArticles();
  return articles.find(a => a.id === id);
}

/** Get PDF URL based on article ID and language */
export function getPdfUrl(articleId, lang) {
  return `/assets/pdfs/${articleId}-${lang}.pdf`;
}

/** Get infographic URL based on article ID and language */
export function getInfographicUrl(articleId, lang) {
  return `/assets/infographics/${articleId}-infographic-${lang}.png`;
}

/** Build the share URL data */
export function getShareData(article, lang) {
  const i18nData = article.i18n[lang];
  const url = window.location.href;
  const title = i18nData.title;
  return { url, title };
}

/** Format date based on current language */
export function formatDate(dateStr) {
  const lang = window.i18n.getLang();
  const date = new Date(dateStr + 'T00:00:00');
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Get tag color variant (cycles primary/secondary/tertiary) */
export function getTagVariant(index) {
  return ['primary', 'secondary', 'tertiary'][index % 3];
}

/** Translate a tag key via i18n */
export function translateTag(tag) {
  return window.i18n.t(`tag_${tag}`) || tag;
}
