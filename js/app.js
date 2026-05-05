/**
 * PRISMA — Main Application Orchestrator (js/app.js)
 *
 * Responsibilities: page routing, page-level init functions, shared setup.
 * Heavy logic lives in sibling modules:
 *   data.js        — data loading & utilities
 *   ui.js          — shared UI (hamburger, search, lightbox, SEO)
 *   renderer.js    — content rendering (hero, article list, article detail)
 *   interactive.js — dashboard, charts, tabs, accordions, calculators
 */

import { loadArticles } from './data.js';
import { initHamburger, initSearch, ensureLightbox, updateSEO, loadPartials } from './ui.js';
import { renderHero, renderChronolog, renderArticleDetail, renderRelatedArticles, renderArticleList } from './renderer.js';
import { initInteractive } from './interactive.js';

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

async function initHome() {
  const updateHomeSEO = () => {
    updateSEO(
      'PRISMA — Análisis Técnico en Programación e IA',
      window.i18n.t('hero_summary') || 'Biblioteca digital de análisis técnicos.'
    );
  };

  await renderHero();
  await renderChronolog();
  updateHomeSEO();

  window.addEventListener('langchange', async () => {
    await renderHero();
    await renderChronolog();
    updateHomeSEO();
  });
}

// ─── ARTICLE PAGE ─────────────────────────────────────────────────────────────

async function initArticle() {
  await renderArticleDetail();

  window.addEventListener('langchange', async () => {
    await renderArticleDetail();
  });
}

// ─── TOPICS PAGE ──────────────────────────────────────────────────────────────

async function initTopics() {
  const params       = new URLSearchParams(window.location.search);
  let currentQuery   = (params.get('q') || '').trim().toLowerCase();
  const tagsParam    = params.get('tags');
  let selectedTags   = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
  let filterMode     = params.get('mode') === 'and' ? 'and' : 'or';
  let selectedFrom   = params.get('from') || '';
  let selectedTo     = params.get('to')   || '';

  // Populate search input if arriving from another page with a query
  const searchInput = document.getElementById('search-input');
  if (searchInput && currentQuery) {
    searchInput.value = currentQuery;
    document.getElementById('search-container')?.classList.add('active');
  }

  const allArticles = await loadArticles();

  // Extract unique tags from live data
  const allTags = [...new Set(allArticles.flatMap(a => a.tags))];

  // Determine min/max article dates for date input bounds (YYYY-MM)
  const articleMonths = allArticles
    .map(a => a.date?.slice(0, 7))
    .filter(Boolean)
    .sort();
  const minMonth = articleMonths[0] || '';
  const maxMonth = articleMonths[articleMonths.length - 1] || '';

  const renderPage = () => {
    const lang = window.i18n.getLang();

    // ── Tag filter buttons ──────────────────────────────────────────────────
    const tagsContainer = document.getElementById('topics-filter-tags');
    if (tagsContainer) {
      tagsContainer.innerHTML = allTags.map((tag, i) => {
        const active   = selectedTags.includes(tag) ? ' active' : '';
        const variant  = ['primary', 'secondary', 'tertiary'][i % 3];
        return `<button class="filter-tag${active} tag--${variant}" data-tag="${tag}">${window.i18n.t(`tag_${tag}`) || tag}</button>`;
      }).join('');

      tagsContainer.querySelectorAll('.filter-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tag = e.target.dataset.tag;
          if (selectedTags.includes(tag)) {
            selectedTags = selectedTags.filter(t => t !== tag);
          } else {
            selectedTags.push(tag);
            // ✅ NO longer resets currentQuery — filters are additive
          }
          updateUrlAndRender();
        });
      });
    }

    // ── Logic toggle (AND/OR) ───────────────────────────────────────────────
    const logicCheckbox = document.getElementById('logic-checkbox');
    const logicOrLabel  = document.getElementById('logic-or');
    const logicAndLabel = document.getElementById('logic-and');
    if (logicCheckbox && logicOrLabel && logicAndLabel) {
      logicCheckbox.checked = filterMode === 'and';
      logicOrLabel.classList.toggle('active',  filterMode === 'or');
      logicAndLabel.classList.toggle('active', filterMode === 'and');
      logicCheckbox.onchange = (e) => {
        filterMode = e.target.checked ? 'and' : 'or';
        updateUrlAndRender();
      };
    }

    // ── Date range picker (hidden inputs + custom buttons) ──────────────────
    const dateFromInput = document.getElementById('date-from');
    const dateToInput   = document.getElementById('date-to');
    const dateFromBtn   = document.getElementById('date-from-btn');
    const dateToBtn     = document.getElementById('date-to-btn');
    const dateFromLabel = document.getElementById('date-from-label');
    const dateToLabel   = document.getElementById('date-to-label');
    const dateClearBtn  = document.getElementById('date-range-clear');

    // Format YYYY-MM → "abr 2026" / "Apr 2026"
    const formatMonth = (yyyyMM) => {
      if (!yyyyMM) return null;
      const [y, m] = yyyyMM.split('-');
      return new Date(Number(y), Number(m) - 1).toLocaleString(
        lang === 'es' ? 'es-ES' : 'en-US',
        { month: 'short', year: 'numeric' }
      );
    };

    if (dateFromInput && dateToInput) {
      // Set calendar bounds to match article date range
      if (minMonth) { dateFromInput.min = minMonth; dateToInput.min = minMonth; }
      if (maxMonth) { dateFromInput.max = maxMonth; dateToInput.max = maxMonth; }

      // Restore state into hidden inputs
      dateFromInput.value = selectedFrom;
      dateToInput.value   = selectedTo;

      // Update visible button labels
      if (dateFromLabel) {
        dateFromLabel.textContent = formatMonth(selectedFrom) || window.i18n.t('date_from_placeholder');
        dateFromBtn?.classList.toggle('has-value', !!selectedFrom);
      }
      if (dateToLabel) {
        dateToLabel.textContent = formatMonth(selectedTo) || window.i18n.t('date_to_placeholder');
        dateToBtn?.classList.toggle('has-value', !!selectedTo);
      }

      // Open native calendar popup on button click (no manual text entry)
      if (dateFromBtn) dateFromBtn.onclick = () => {
        try { dateFromInput.showPicker(); } catch (e) { dateFromInput.click(); }
      };
      if (dateToBtn) dateToBtn.onclick = () => {
        try { dateToInput.showPicker(); } catch (e) { dateToInput.click(); }
      };

      // React to calendar selection
      dateFromInput.onchange = () => { selectedFrom = dateFromInput.value; updateUrlAndRender(); };
      dateToInput.onchange   = () => { selectedTo   = dateToInput.value;   updateUrlAndRender(); };

      // Clear button: only visible when a range is active
      if (dateClearBtn) {
        dateClearBtn.style.display = (selectedFrom || selectedTo) ? '' : 'none';
        dateClearBtn.onclick = () => {
          selectedFrom = '';
          selectedTo   = '';
          dateFromInput.value = '';
          dateToInput.value   = '';
          updateUrlAndRender();
        };
      }
    }

    // ── Filter articles (all filters are cumulative) ────────────────────────
    let filtered = allArticles;

    // 1. Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filterMode === 'and'
        ? filtered.filter(a => selectedTags.every(t => a.tags.includes(t)))
        : filtered.filter(a => selectedTags.some(t => a.tags.includes(t)));
    }

    // 2. Apply date range filter
    if (selectedFrom || selectedTo) {
      filtered = filtered.filter(a => {
        const articleMonth = a.date?.slice(0, 7) || '';
        const afterFrom  = !selectedFrom || articleMonth >= selectedFrom;
        const beforeTo   = !selectedTo   || articleMonth <= selectedTo;
        return afterFrom && beforeTo;
      });
    }

    // 3. Apply text search on top of tag+year filters
    if (currentQuery) {
      filtered = filtered.filter(a => {
        const d = a.i18n[lang];
        return `${d.title} ${d.summary}`.toLowerCase().includes(currentQuery);
      });
    }

    // ── Update count ────────────────────────────────────────────────────────
    const countEl = document.getElementById('topics-results-count');
    if (countEl) {
      countEl.innerHTML = `${filtered.length} <span data-i18n="topics_articles_count">${window.i18n.t('topics_articles_count')}</span>`;
    }

    // ── Render list ─────────────────────────────────────────────────────────
    const listContainer = document.getElementById('topics-results-list');
    renderArticleList(filtered, listContainer);

    // ── SEO ─────────────────────────────────────────────────────────────────
    updateSEO(
      `PRISMA — ${window.i18n.t('topics_title')}`,
      window.i18n.t('topics_subtitle')
    );
  };

  const updateUrlAndRender = () => {
    const newParams = new URLSearchParams();
    if (currentQuery) newParams.set('q', currentQuery);
    if (selectedTags.length > 0) {
      newParams.set('tags', selectedTags.join(','));
      if (filterMode === 'and') newParams.set('mode', 'and');
    }
    if (selectedFrom) newParams.set('from', selectedFrom);
    if (selectedTo)   newParams.set('to',   selectedTo);
    const newUrl = newParams.toString()
      ? `${window.location.pathname}?${newParams.toString()}`
      : window.location.pathname;
    window.history.pushState({}, '', newUrl);
    renderPage();
  };

  // ── Live search on topics page (no redirect, additive with tags) ──────────
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentQuery = e.target.value.trim().toLowerCase();
      // ✅ NO longer resets selectedTags — search is additive
      updateUrlAndRender();
    });
  }

  renderPage();

  window.addEventListener('langchange', () => renderPage());
}


// ─── GLOBAL INIT ─────────────────────────────────────────────────────────────

async function init() {
  await loadPartials();
  window.i18n.initI18n();
  initHamburger();
  initSearch();
  ensureLightbox();

  const page = document.body.dataset.page;
  if      (page === 'home')        initHome();
  else if (page === 'article')     initArticle();
  else if (page === 'topics')      initTopics();
  else if (page === 'interactive') initInteractive();

  document.body.classList.add('page-fade-in');
}

document.addEventListener('DOMContentLoaded', init);
