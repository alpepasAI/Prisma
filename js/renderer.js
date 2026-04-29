/**
 * PRISMA — Renderer (js/renderer.js)
 * Handles all content rendering: hero, article list, article detail, related articles.
 */

import {
  loadArticles, getFeatured, getArticleId, getArticleById,
  getPdfUrl, getInfographicUrl, getShareData,
  formatDate, getTagVariant, translateTag,
} from './data.js';
import { initLightbox, initReadingProgress, updateSEO } from './ui.js';

// Re-export updateSEO so app.js can use it via renderer
export { updateSEO };

/** Fetch and parse markdown content file */
async function fetchMarkdown(contentFile, lang) {
  try {
    const response = await fetch(`/data/${lang}/${contentFile}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const md = await response.text();
    return marked.parse(md);
  } catch (err) {
    console.error('Failed to load markdown:', err);
    return `<p>${window.i18n.t('content_load_error') || 'Content could not be loaded.'}</p>`;
  }
}

/** Build tags HTML string */
function buildTagsHtml(tags, stopProp = false) {
  return tags.map((tag, i) => {
    const stop = stopProp ? ' onclick="event.stopPropagation();"' : '';
    return `<a href="topics.html?tags=${encodeURIComponent(tag)}" class="tag tag--${getTagVariant(i)}" style="text-decoration:none;"${stop}>${translateTag(tag)}</a>`;
  }).join('');
}

/** Build format indicator HTML (active link or inactive span) */
function buildIndicator(available, icon, i18nActive, i18nFallback, href, extraAttrs = '') {
  if (available) {
    return `<a href="${href}" ${extraAttrs} class="format-indicator format-indicator--active" style="text-decoration:none;"><span class="material-symbols-outlined">${icon}</span><span>${window.i18n.t(i18nActive)}</span></a>`;
  }
  return `<span class="format-indicator format-indicator--inactive"><span class="material-symbols-outlined">${icon}</span><span>${window.i18n.t('format_not_available')}</span></span>`;
}

// ─── HERO ────────────────────────────────────────────────────────────────────

export async function renderHero() {
  const heroEl = document.getElementById('hero-section');
  if (!heroEl) return;

  const article = await getFeatured();
  if (!article) return;

  const lang        = window.i18n.getLang();
  const i18nData    = article.i18n[lang];
  const formats     = article.formats;
  const tagsHtml    = buildTagsHtml(article.tags);
  const pdfUrl      = getPdfUrl(article.id, lang);
  const infographic = getInfographicUrl(article.id, lang);

  const disabled = (flag) => flag ? '' : ' format-card--disabled';

  heroEl.innerHTML = `
    <div class="hero-bg"></div>
    <div class="hero-content">
      <div class="tags">${tagsHtml}</div>
      <h1 class="hero-title">${i18nData.title}</h1>
      <p class="hero-summary">${i18nData.summary}</p>
      <div>
        <a href="article.html?id=${article.id}" class="btn-primary">
          <span class="material-symbols-outlined">article</span>
          <span data-i18n="hero_cta">${window.i18n.t('hero_cta')}</span>
        </a>
      </div>
      <div class="hero-formats">
        <a href="article.html?id=${article.id}#podcast" class="format-card${disabled(formats.podcast?.available)}">
          <div class="format-card__icon"><span class="material-symbols-outlined">podcasts</span></div>
          <div>
            <div class="format-card__title">${window.i18n.t('format_podcast')}</div>
            <div class="format-card__subtitle">${window.i18n.t('format_podcast_sub')}</div>
          </div>
          <span class="material-symbols-outlined format-card__arrow">arrow_forward</span>
        </a>
        <a href="${pdfUrl}" download class="format-card${disabled(formats.pdf?.available)}">
          <div class="format-card__icon"><span class="material-symbols-outlined">picture_as_pdf</span></div>
          <div>
            <div class="format-card__title">${window.i18n.t('format_pdf')}</div>
            <div class="format-card__subtitle">${window.i18n.t('format_pdf_sub')}</div>
          </div>
          <span class="material-symbols-outlined format-card__arrow">arrow_forward</span>
        </a>
        <a href="javascript:void(0)" data-infographic="${infographic}" class="format-card${disabled(formats.infographic?.available)}">
          <div class="format-card__icon"><span class="material-symbols-outlined">data_exploration</span></div>
          <div>
            <div class="format-card__title">${window.i18n.t('format_infographic')}</div>
            <div class="format-card__subtitle">${window.i18n.t('format_infographic_sub')}</div>
          </div>
          <span class="material-symbols-outlined format-card__arrow">arrow_forward</span>
        </a>
        <a href="${formats.interactive?.available ? `interactive.html?id=${article.id}` : '#'}" class="format-card${disabled(formats.interactive?.available)}">
          <div class="format-card__icon"><span class="material-symbols-outlined">touch_app</span></div>
          <div>
            <div class="format-card__title">${window.i18n.t('format_interactive')}</div>
            <div class="format-card__subtitle">${window.i18n.t('format_interactive_sub')}</div>
          </div>
          <span class="material-symbols-outlined format-card__arrow">arrow_forward</span>
        </a>
      </div>
    </div>
  `;
  initLightbox();
}

// ─── ARTICLE LIST ─────────────────────────────────────────────────────────────

export function renderArticleList(articles, containerEl) {
  if (!containerEl) return;
  const lang = window.i18n.getLang();

  if (articles.length === 0) {
    containerEl.innerHTML = `<p style="text-align:center;color:var(--on-surface-variant);padding:var(--space-xl) 0;">${window.i18n.t('no_results') || 'No se encontraron artículos.'}</p>`;
    return;
  }

  containerEl.innerHTML = articles.map(article => {
    const i18nData    = article.i18n[lang];
    const formats     = article.formats;
    const tagsHtml    = buildTagsHtml(article.tags, true);
    const featured    = article.featured ? ' article-entry--featured' : '';
    const pdfUrl      = getPdfUrl(article.id, lang);
    const infographic = getInfographicUrl(article.id, lang);

    const podcastInd    = buildIndicator(formats.podcast?.available,     'podcasts',       'format_podcast_available',     'format_not_available', `article.html?id=${article.id}#podcast`, 'onclick="event.stopPropagation();"');
    const pdfInd        = buildIndicator(formats.pdf?.available,         'picture_as_pdf', 'format_pdf_available',         'format_not_available', pdfUrl, 'download onclick="event.stopPropagation();"');
    const infographicInd= buildIndicator(formats.infographic?.available, 'data_exploration','format_infographic_available', 'format_not_available', 'javascript:void(0)', `data-infographic="${infographic}"`);
    const interactiveInd= buildIndicator(formats.interactive?.available, 'touch_app',      'format_interactive',           'format_not_available', `interactive.html?id=${article.id}`, 'onclick="event.stopPropagation();"');

    return `
      <article class="article-entry${featured}" onclick="location.href='article.html?id=${article.id}'">
        <div class="article-entry__meta">
          <div class="article-entry__date">${formatDate(article.date)}</div>
          <div class="article-entry__reading-time">
            <span class="material-symbols-outlined">schedule</span>
            ${article.readingTime} ${window.i18n.t('reading_time_suffix')}
          </div>
          <div class="tags" style="margin-top:var(--space-sm);">${tagsHtml}</div>
        </div>
        <div style="flex:1;">
          <h3 class="article-entry__title">${i18nData.title}</h3>
          <p class="article-entry__summary">${i18nData.summary}</p>
          <div class="format-indicators">
            ${podcastInd}${pdfInd}${infographicInd}${interactiveInd}
          </div>
        </div>
      </article>
    `;
  }).join('');

  initLightbox();
}

// ─── CHRONOLOG ────────────────────────────────────────────────────────────────

export async function renderChronolog() {
  const logEl = document.getElementById('chrono-log-list');
  if (!logEl) return;
  const articles = await loadArticles();
  renderArticleList(articles, logEl);
}

// ─── ARTICLE DETAIL ───────────────────────────────────────────────────────────

export async function renderArticleDetail() {
  const container = document.getElementById('article-detail');
  if (!container) return;

  const articleId = getArticleId();
  if (!articleId) { window.location.href = './'; return; }

  const article = await getArticleById(articleId);
  if (!article) {
    container.innerHTML = `<p style="text-align:center;padding:4rem 0;color:var(--on-surface-variant);">${window.i18n.t('article_not_found') || 'Article not found.'}</p>`;
    return;
  }

  const lang     = window.i18n.getLang();
  const i18nData = article.i18n[lang];
  const formats  = article.formats;

  const articleImage = formats.infographic?.available ? `data/${lang}/${formats.infographic.image}` : '';
  updateSEO(`PRISMA — ${i18nData.title}`, i18nData.summary, window.location.href, articleImage);

  let contentHtml = await fetchMarkdown(i18nData.contentFile, lang);
  contentHtml = contentHtml.replace(/<h1[^>]*>.*?<\/h1>/i, '');

  const tagsHtml = buildTagsHtml(article.tags);
  const { url, title } = getShareData(article, lang);
  const twitterUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const mastodonUrl = `https://mastodonshare.com/?text=${encodeURIComponent(title + ' ' + url)}`;

  // ── Sidebar ──
  let sidebarHtml = '';

  if (formats.podcast?.available) {
    const pd = i18nData.podcasts;
    let embeds = '';
    if (pd?.short) embeds += `
      <div class="sidebar-card__subtitle" style="margin-top:var(--space-sm);margin-bottom:var(--space-xs);color:var(--primary);font-weight:600;">${window.i18n.t('detail_podcast_short')}</div>
      <iframe style="border-radius:12px;margin-bottom:var(--space-md);" src="https://open.spotify.com/embed/episode/${pd.short}?utm_source=generator&theme=0" width="100%" height="152" frameBorder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    if (pd?.normal) embeds += `
      <div class="sidebar-card__subtitle" style="margin-bottom:var(--space-xs);color:var(--primary);font-weight:600;">${window.i18n.t('detail_podcast_normal')}</div>
      <iframe style="border-radius:12px" src="https://open.spotify.com/embed/episode/${pd.normal}?utm_source=generator&theme=0" width="100%" height="152" frameBorder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    sidebarHtml += `
      <div class="sidebar-card" id="podcast">
        <div class="sidebar-card__header">
          <span class="sidebar-card__label">${window.i18n.t('format_podcast_sub')}</span>
          <span class="sidebar-card__icon material-symbols-outlined">headphones</span>
        </div>
        <div class="sidebar-card__body"><div class="sidebar-card__title">${window.i18n.t('detail_listen')}</div></div>
        <div class="spotify-embed">${embeds}</div>
      </div>`;
  }

  if (formats.infographic?.available) {
    const infSrc = getInfographicUrl(article.id, lang);
    sidebarHtml += `
      <div class="sidebar-card" id="infographic">
        <div class="sidebar-card__header"><span class="sidebar-card__label sidebar-card__label--tertiary">${window.i18n.t('format_infographic_sub')}</span></div>
        <div class="sidebar-card__body"><div class="sidebar-card__title">${window.i18n.t('detail_visual_data')}</div></div>
        <div class="infographic-preview" data-infographic="${infSrc}"><img src="${infSrc}" alt="Infographic" /></div>
        <button class="infographic-expand-btn" data-infographic="${infSrc}"><span class="material-symbols-outlined">zoom_in</span>${window.i18n.t('detail_expand')}</button>
      </div>`;
  }

  if (formats.pdf?.available) {
    const pdfUrl = getPdfUrl(articleId, lang);
    sidebarHtml += `
      <div class="sidebar-card" id="pdf">
        <div class="pdf-card__icon-large"><span class="material-symbols-outlined">description</span></div>
        <div class="sidebar-card__body" style="text-align:center;">
          <div class="pdf-card__title">${window.i18n.t('detail_full_study')}</div>
          <p class="sidebar-card__description">${window.i18n.t('detail_full_study_desc')}</p>
          <a href="${pdfUrl}" download class="btn-download"><span class="material-symbols-outlined">download</span>${window.i18n.t('detail_download_pdf')}</a>
        </div>
      </div>`;
  }

  if (formats.interactive?.available) {
    sidebarHtml += `
      <div class="sidebar-card" id="interactive" style="background:var(--surface-container-high);border-color:var(--primary);">
        <div class="pdf-card__icon-large" style="color:var(--primary);"><span class="material-symbols-outlined">touch_app</span></div>
        <div class="sidebar-card__body" style="text-align:center;">
          <div class="pdf-card__title">${window.i18n.t('format_interactive')}</div>
          <p class="sidebar-card__description">${window.i18n.t('format_interactive_sub')}</p>
          <a href="interactive.html?id=${articleId}" class="btn-download" style="background:var(--primary);color:var(--on-primary);border:none;">
            <span class="material-symbols-outlined">open_in_new</span>${window.i18n.t('detail_explore') || 'Explorar'}
          </a>
        </div>
      </div>`;
  }

  // ── Full render (replaces skeleton) ──
  container.innerHTML = `
    <div class="article-detail__main">
      <div class="article-header">
        <div class="tags" style="margin-bottom:var(--space-md);">${tagsHtml}</div>
        <div class="article-header__meta">
          <span class="article-header__meta-item"><span class="material-symbols-outlined">calendar_today</span>${formatDate(article.date)}</span>
          <span class="article-header__meta-item"><span class="material-symbols-outlined">schedule</span>${article.readingTime} ${window.i18n.t('reading_time_suffix')}</span>
        </div>
        <h1 class="article-header__title">${i18nData.title}</h1>
      </div>
      <div class="prose" id="article-prose">${contentHtml}</div>
      <div class="share-bar">
        <span class="share-bar__label">${window.i18n.t('detail_share')}</span>
        <a href="${twitterUrl}" target="_blank" rel="noopener" class="share-btn" title="Twitter / X">𝕏</a>
        <a href="${linkedinUrl}" target="_blank" rel="noopener" class="share-btn" title="LinkedIn">in</a>
        <a href="${mastodonUrl}" target="_blank" rel="noopener" class="share-btn" title="Mastodon">🐘</a>
      </div>
      <div class="related-articles" id="related-articles"></div>
    </div>
    <aside class="article-detail__sidebar">${sidebarHtml}</aside>
  `;

  initLightbox();
  initReadingProgress();
  renderRelatedArticles(article);

  if (window.Prism) window.Prism.highlightAll();

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }
}

// ─── RELATED ARTICLES ─────────────────────────────────────────────────────────

export async function renderRelatedArticles(currentArticle) {
  const container = document.getElementById('related-articles');
  if (!container) return;

  const articles = await loadArticles();
  const lang     = window.i18n.getLang();

  const related = articles
    .filter(a => a.id !== currentArticle.id)
    .map(a => ({ ...a, sharedTags: a.tags.filter(t => currentArticle.tags.includes(t)).length }))
    .filter(a => a.sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags)
    .slice(0, 3);

  if (related.length === 0) { container.style.display = 'none'; return; }

  container.innerHTML = `
    <h3 class="related-articles__title">${window.i18n.t('detail_related')}</h3>
    <div class="related-articles__grid">
      ${related.map(a => {
        const i18n = a.i18n[lang];
        return `<a href="article.html?id=${a.id}" class="related-card">
          <div class="related-card__title">${i18n.title}</div>
          <p class="related-card__summary">${i18n.summary}</p>
        </a>`;
      }).join('')}
    </div>
  `;
}
