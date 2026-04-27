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

  // Populate search input if arriving from another page
  const searchInput = document.getElementById('search-input');
  if (searchInput && currentQuery) {
    searchInput.value = currentQuery;
    document.getElementById('search-container')?.classList.add('active');
  }

  const allArticles = await loadArticles();

  // Extract unique tags from live data
  const allTags = [...new Set(allArticles.flatMap(a => a.tags))];

  const renderPage = () => {
    const lang = window.i18n.getLang();

    // Render tag filter buttons
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
            currentQuery = '';
            if (searchInput) searchInput.value = '';
          }
          updateUrlAndRender();
        });
      });
    }

    // Logic toggle (AND/OR)
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

    // Filter articles
    let filtered = allArticles;
    if (selectedTags.length > 0) {
      filtered = filterMode === 'and'
        ? filtered.filter(a => selectedTags.every(t => a.tags.includes(t)))
        : filtered.filter(a => selectedTags.some(t => a.tags.includes(t)));
    } else if (currentQuery) {
      filtered = filtered.filter(a => {
        const d = a.i18n[lang];
        return `${d.title} ${d.summary}`.toLowerCase().includes(currentQuery);
      });
    }

    // Update count
    const countEl = document.getElementById('topics-results-count');
    if (countEl) {
      countEl.innerHTML = `${filtered.length} <span data-i18n="topics_articles_count">${window.i18n.t('topics_articles_count')}</span>`;
    }

    // Render list (from renderer module)
    const listContainer = document.getElementById('topics-results-list');
    renderArticleList(filtered, listContainer);

    // SEO
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
    const newUrl = newParams.toString()
      ? `${window.location.pathname}?${newParams.toString()}`
      : window.location.pathname;
    window.history.pushState({}, '', newUrl);
    renderPage();
  };

  // Live search on topics page (no redirect)
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentQuery = e.target.value.trim().toLowerCase();
      selectedTags = [];
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
