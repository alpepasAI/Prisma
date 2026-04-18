/**
 * PRISMA — Main Application Module
 * Handles initialization, article loading, and shared functionality
 */

const PRISMA = {
  articlesData: null,

  /**
   * Load articles catalog from JSON
   */
  async loadArticles() {
    if (this.articlesData) return this.articlesData;
    try {
      const response = await fetch('/data/articles.json', { cache: 'no-store' });
      const data = await response.json();
      this.articlesData = data.articles;
      return this.articlesData;
    } catch (err) {
      console.error('Failed to load articles:', err);
      return [];
    }
  },

  /**
   * Get featured article
   */
  async getFeatured() {
    const articles = await this.loadArticles();
    return articles.find(a => a.featured) || articles[0];
  },

  /**
   * Format date based on current language
   */
  formatDate(dateStr) {
    const lang = window.i18n.getLang();
    const date = new Date(dateStr + 'T00:00:00');
    const locale = lang === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Get tag color variant (cycles through primary, secondary, tertiary)
   */
  getTagVariant(index) {
    const variants = ['primary', 'secondary', 'tertiary'];
    return variants[index % variants.length];
  },

  /**
   * Translate a tag key
   */
  translateTag(tag) {
    return window.i18n.t(`tag_${tag}`) || tag;
  },

  /**
   * Initialize hamburger menu
   */
  initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('nav-mobile');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    // Close on nav link click
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  },

  /**
   * Initialize search overlay (Phase 4)
   */
  initSearch() {
    const searchContainer = document.getElementById('search-container');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    if (!searchContainer || !searchBtn || !searchInput) return;

    // Toggle expansion on click
    searchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      searchContainer.classList.toggle('active');
      if (searchContainer.classList.contains('active')) {
        searchInput.focus();
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) {
        searchContainer.classList.remove('active');
      }
    });

    // Handle enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        // If we are already on topics page, the input event listener in initTopics will handle it
        if (document.body.dataset.page !== 'topics') {
          window.location.href = `topics.html?q=${encodeURIComponent(query)}`;
        }
      }
    });
  },

  /**
   * Update SEO meta tags dynamically
   */
  updateSEO(title, description, url = window.location.href, imageUrl = '') {
    // Determine base URL dynamically
    const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const defaultImage = baseUrl + '/images/default-social.jpg'; // Placeholder
    const finalImage = imageUrl.startsWith('http') ? imageUrl : (imageUrl ? baseUrl + '/' + imageUrl : defaultImage);

    const els = {
      title: document.getElementById('page-title'),
      desc: document.getElementById('meta-desc'),
      ogTitle: document.getElementById('og-title'),
      ogDesc: document.getElementById('og-desc'),
      ogUrl: document.getElementById('og-url'),
      ogImage: document.getElementById('og-image'),
      twTitle: document.getElementById('tw-title'),
      twDesc: document.getElementById('tw-desc'),
      twImage: document.getElementById('tw-image')
    };

    if (els.title) els.title.textContent = title;
    if (els.desc) els.desc.setAttribute('content', description);
    
    if (els.ogTitle) els.ogTitle.setAttribute('content', title);
    if (els.ogDesc) els.ogDesc.setAttribute('content', description);
    if (els.ogUrl) els.ogUrl.setAttribute('content', url);
    if (els.ogImage) els.ogImage.setAttribute('content', finalImage);
    
    if (els.twTitle) els.twTitle.setAttribute('content', title);
    if (els.twDesc) els.twDesc.setAttribute('content', description);
    if (els.twImage) els.twImage.setAttribute('content', finalImage);
  },

  /**
   * Render the hero section for the home page
   */
  async renderHero() {
    const heroEl = document.getElementById('hero-section');
    if (!heroEl) return;

    const article = await this.getFeatured();
    if (!article) return;

    const lang = window.i18n.getLang();
    const i18nData = article.i18n[lang];
    const formats = article.formats;

    // Tags
    const tagsHtml = article.tags.map((tag, i) =>
      `<a href="topics.html?tags=${encodeURIComponent(tag)}" class="tag tag--${this.getTagVariant(i)}" style="text-decoration:none;">${this.translateTag(tag)}</a>`
    ).join('');

    // Format cards
    const podcastDisabled = !formats.podcast?.available ? ' format-card--disabled' : '';
    const pdfDisabled = !formats.pdf?.available ? ' format-card--disabled' : '';
    const infographicDisabled = !formats.infographic?.available ? ' format-card--disabled' : '';
    const interactiveDisabled = !formats.interactive?.available ? ' format-card--disabled' : '';

    const pdfUrl = this.getPdfUrl(article.id, lang);
    const infographicSrc = this.getInfographicUrl(lang);

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
          <a href="article.html?id=${article.id}#podcast" class="format-card${podcastDisabled}">
            <div class="format-card__icon">
              <span class="material-symbols-outlined">podcasts</span>
            </div>
            <div>
              <div class="format-card__title" data-i18n="format_podcast">${window.i18n.t('format_podcast')}</div>
              <div class="format-card__subtitle" data-i18n="format_podcast_sub">${window.i18n.t('format_podcast_sub')}</div>
            </div>
            <span class="material-symbols-outlined format-card__arrow">arrow_forward</span>
          </a>
          <a href="${pdfUrl}" download class="format-card${pdfDisabled}">
            <div class="format-card__icon">
              <span class="material-symbols-outlined">picture_as_pdf</span>
            </div>
            <div>
              <div class="format-card__title" data-i18n="format_pdf">${window.i18n.t('format_pdf')}</div>
              <div class="format-card__subtitle" data-i18n="format_pdf_sub">${window.i18n.t('format_pdf_sub')}</div>
            </div>
            <span class="material-symbols-outlined format-card__arrow">arrow_forward</span>
          </a>
          <a href="javascript:void(0)" data-infographic="${infographicSrc}" class="format-card${infographicDisabled}">
            <div class="format-card__icon">
              <span class="material-symbols-outlined">data_exploration</span>
            </div>
            <div>
              <div class="format-card__title" data-i18n="format_infographic">${window.i18n.t('format_infographic')}</div>
              <div class="format-card__subtitle" data-i18n="format_infographic_sub">${window.i18n.t('format_infographic_sub')}</div>
            </div>
            <span class="material-symbols-outlined format-card__arrow">arrow_forward</span>
          </a>
          <a href="${formats.interactive?.available ? `interactive.html?id=${article.id}` : '#'}" class="format-card${interactiveDisabled}">
            <div class="format-card__icon">
              <span class="material-symbols-outlined">touch_app</span>
            </div>
            <div>
              <div class="format-card__title" data-i18n="format_interactive">${window.i18n.t('format_interactive')}</div>
              <div class="format-card__subtitle" data-i18n="format_interactive_sub">${window.i18n.t('format_interactive_sub')}</div>
            </div>
            <span class="material-symbols-outlined format-card__arrow">arrow_forward</span>
          </a>
        </div>
      </div>
    `;

    // Re-init lightbox in case it's hero
    this.initLightbox();
  },

  /**
   * Reusable method to render a list of articles
   */
  renderArticleList(articles, containerEl) {
    if (!containerEl) return;
    const lang = window.i18n.getLang();

    if (articles.length === 0) {
      containerEl.innerHTML = `<p style="text-align: center; color: var(--on-surface-variant); padding: var(--space-xl) 0;">No se encontraron artículos.</p>`;
      return;
    }

    const entriesHtml = articles.map(article => {
      const i18nData = article.i18n[lang];
      const formats = article.formats;
      const featuredClass = article.featured ? ' article-entry--featured' : '';

      const tagsHtml = article.tags.map((tag, i) =>
        `<a href="topics.html?tags=${encodeURIComponent(tag)}" class="tag tag--${this.getTagVariant(i)}" style="text-decoration:none;" onclick="event.stopPropagation();">${this.translateTag(tag)}</a>`
      ).join('');

      const podcastIndicator = formats.podcast?.available
        ? `<a href="article.html?id=${article.id}#podcast" onclick="event.stopPropagation();" class="format-indicator format-indicator--active" style="text-decoration:none;"><span class="material-symbols-outlined">podcasts</span><span data-i18n="format_podcast_available">${window.i18n.t('format_podcast_available')}</span></a>`
        : `<span class="format-indicator format-indicator--inactive"><span class="material-symbols-outlined">podcasts</span><span data-i18n="format_not_available">${window.i18n.t('format_not_available')}</span></span>`;

      const pdfIndicator = formats.pdf?.available
        ? `<a href="${this.getPdfUrl(article.id, lang)}" download onclick="event.stopPropagation();" class="format-indicator format-indicator--active" style="text-decoration:none;"><span class="material-symbols-outlined">picture_as_pdf</span><span data-i18n="format_pdf_available">${window.i18n.t('format_pdf_available')}</span></a>`
        : `<span class="format-indicator format-indicator--inactive"><span class="material-symbols-outlined">picture_as_pdf</span><span data-i18n="format_not_available">${window.i18n.t('format_not_available')}</span></span>`;

      const infographicIndicator = formats.infographic?.available
        ? `<a href="javascript:void(0)" data-infographic="${this.getInfographicUrl(lang)}" class="format-indicator format-indicator--active" style="text-decoration:none;"><span class="material-symbols-outlined">data_exploration</span><span data-i18n="format_infographic_available">${window.i18n.t('format_infographic_available')}</span></a>`
        : `<span class="format-indicator format-indicator--inactive"><span class="material-symbols-outlined">data_exploration</span><span data-i18n="format_not_available">${window.i18n.t('format_not_available')}</span></span>`;

      const interactiveIndicator = formats.interactive?.available
        ? `<a href="interactive.html?id=${article.id}" onclick="event.stopPropagation();" class="format-indicator format-indicator--active" style="text-decoration:none;"><span class="material-symbols-outlined">touch_app</span><span data-i18n="format_interactive">${window.i18n.t('format_interactive')}</span></a>`
        : `<span class="format-indicator format-indicator--inactive"><span class="material-symbols-outlined">touch_app</span><span data-i18n="format_not_available">${window.i18n.t('format_not_available')}</span></span>`;

      return `
        <article class="article-entry${featuredClass}" onclick="location.href='article.html?id=${article.id}'">
          <div class="article-entry__meta">
            <div class="article-entry__date">${this.formatDate(article.date)}</div>
            <div class="article-entry__reading-time">
              <span class="material-symbols-outlined">schedule</span>
              ${article.readingTime} ${window.i18n.t('reading_time_suffix')}
            </div>
            <div class="tags" style="margin-top: var(--space-sm);">${tagsHtml}</div>
          </div>
          <div style="flex: 1;">
            <h3 class="article-entry__title">${i18nData.title}</h3>
            <p class="article-entry__summary">${i18nData.summary}</p>
            <div class="format-indicators">
              ${podcastIndicator}
              ${pdfIndicator}
              ${infographicIndicator}
              ${interactiveIndicator}
            </div>
          </div>
        </article>
      `;
    }).join('');

    containerEl.innerHTML = entriesHtml;

    // Re-init lightbox triggers for the new content
    this.initLightbox();
  },

  /**
   * Render the chronological log on the home page
   */
  async renderChronolog() {
    const logEl = document.getElementById('chrono-log-list');
    if (!logEl) return;

    const articles = await this.loadArticles();
    this.renderArticleList(articles, logEl);
  },

  /**
   * Initialize the home page
   */
  async initHome() {
    const updateHomeSEO = () => {
      this.updateSEO(
        'PRISMA — Análisis Técnico en Programación e IA',
        window.i18n.t('hero_summary') || 'Biblioteca digital de análisis técnicos.'
      );
    };

    await this.renderHero();
    await this.renderChronolog();
    updateHomeSEO();

    // Re-render on language change
    window.addEventListener('langchange', async () => {
      await this.renderHero();
      await this.renderChronolog();
      updateHomeSEO();
    });
  },

  // ==========================================
  // ARTICLE DETAIL PAGE
  // ==========================================

  /**
   * Get article ID from URL query params
   */
  getArticleId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  },

  /**
   * Get article by ID
   */
  async getArticleById(id) {
    const articles = await this.loadArticles();
    return articles.find(a => a.id === id);
  },

  /**
   * Fetch and render markdown content
   */
  async fetchMarkdown(contentFile, lang) {
    try {
      const response = await fetch(`/data/${lang}/${contentFile}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const md = await response.text();
      return marked.parse(md);
    } catch (err) {
      console.error('Failed to load markdown:', err);
      return '<p>Content could not be loaded.</p>';
    }
  },

  /**
   * Get PDF URL based on language
   */
  getPdfUrl(articleId, lang) {
    const baseName = articleId;
    // Map article IDs to PDF filenames
    return `/assets/pdfs/seguridad-codigo-abierto-nodejs-vs-php-${lang}.pdf`;
  },

  /**
   * Get infographic URL based on language
   */
  getInfographicUrl(lang) {
    return `/assets/infographics/open-source-security-${lang}.png`;
  },

  /**
   * Build the share URL data
   */
  getShareData(article, lang) {
    const i18nData = article.i18n[lang];
    const url = window.location.href;
    const title = i18nData.title;
    return { url, title };
  },

  /**
   * Render article detail page
   */
  async renderArticleDetail() {
    const container = document.getElementById('article-detail');
    if (!container) return;

    const articleId = this.getArticleId();
    if (!articleId) {
      window.location.href = 'index.html';
      return;
    }

    const article = await this.getArticleById(articleId);
    if (!article) {
      container.innerHTML = '<p style="text-align:center; padding:4rem 0; color: var(--on-surface-variant);">Article not found.</p>';
      return;
    }

    const lang = window.i18n.getLang();
    const i18nData = article.i18n[lang];
    const formats = article.formats;

    // Update page title and SEO tags
    const articleImage = formats.infographic?.available ? `data/${lang}/${formats.infographic.image}` : '';
    this.updateSEO(
      `PRISMA — ${i18nData.title}`, 
      i18nData.summary,
      window.location.href,
      articleImage
    );

    // Fetch markdown content
    const contentHtml = await this.fetchMarkdown(i18nData.contentFile, lang);

    // Tags
    const tagsHtml = article.tags.map((tag, i) =>
      `<a href="topics.html?tags=${encodeURIComponent(tag)}" class="tag tag--${this.getTagVariant(i)}" style="text-decoration:none;">${this.translateTag(tag)}</a>`
    ).join('');

    // Share data
    const { url, title } = this.getShareData(article, lang);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    const mastodonUrl = `https://mastodonshare.com/?text=${encodeURIComponent(title + ' ' + url)}`;

    // Build sidebar
    let sidebarHtml = '';

    // Podcast card
    if (formats.podcast?.available) {
      const podcastData = i18nData.podcasts;
      let podcastEmbeds = '';
      
      if (podcastData) {
        if (podcastData.short) {
          podcastEmbeds += `
            <div class="sidebar-card__subtitle" style="margin-top: var(--space-sm); margin-bottom: var(--space-xs); color: var(--primary); font-weight: 600;">
              ${window.i18n.t('detail_podcast_short')}
            </div>
            <iframe
              style="border-radius:12px; margin-bottom: var(--space-md);"
              src="https://open.spotify.com/embed/episode/${podcastData.short}?utm_source=generator&theme=0"
              width="100%"
              height="152"
              frameBorder="0"
              allowfullscreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy">
            </iframe>
          `;
        }
        if (podcastData.normal) {
          podcastEmbeds += `
            <div class="sidebar-card__subtitle" style="margin-bottom: var(--space-xs); color: var(--primary); font-weight: 600;">
              ${window.i18n.t('detail_podcast_normal')}
            </div>
            <iframe
              style="border-radius:12px"
              src="https://open.spotify.com/embed/episode/${podcastData.normal}?utm_source=generator&theme=0"
              width="100%"
              height="152"
              frameBorder="0"
              allowfullscreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy">
            </iframe>
          `;
        }
      }

      sidebarHtml += `
        <div class="sidebar-card" id="podcast">
          <div class="sidebar-card__header">
            <span class="sidebar-card__label">${window.i18n.t('format_podcast_sub')}</span>
            <span class="sidebar-card__icon material-symbols-outlined">headphones</span>
          </div>
          <div class="sidebar-card__body">
            <div class="sidebar-card__title">${window.i18n.t('detail_listen')}</div>
          </div>
          <div class="spotify-embed">
            ${podcastEmbeds}
          </div>
        </div>`;
    }

    // Infographic card
    if (formats.infographic?.available) {
      const infographicSrc = this.getInfographicUrl(lang);
      sidebarHtml += `
        <div class="sidebar-card" id="infographic">
          <div class="sidebar-card__header">
            <span class="sidebar-card__label sidebar-card__label--tertiary">${window.i18n.t('format_infographic_sub')}</span>
          </div>
          <div class="sidebar-card__body">
            <div class="sidebar-card__title">${window.i18n.t('detail_visual_data')}</div>
          </div>
          <div class="infographic-preview" data-infographic="${infographicSrc}">
            <img src="${infographicSrc}" alt="Infographic" />
          </div>
          <button class="infographic-expand-btn" data-infographic="${infographicSrc}">
            <span class="material-symbols-outlined">zoom_in</span>
            ${window.i18n.t('detail_expand')}
          </button>
        </div>`;
    }

    // PDF card
    if (formats.pdf?.available) {
      const pdfUrl = this.getPdfUrl(articleId, lang);
      sidebarHtml += `
        <div class="sidebar-card" id="pdf">
          <div class="pdf-card__icon-large">
            <span class="material-symbols-outlined">description</span>
          </div>
          <div class="sidebar-card__body" style="text-align:center;">
            <div class="pdf-card__title">${window.i18n.t('detail_full_study')}</div>
            <p class="sidebar-card__description">${window.i18n.t('detail_full_study_desc')}</p>
            <a href="${pdfUrl}" download class="btn-download">
              <span class="material-symbols-outlined">download</span>
              ${window.i18n.t('detail_download_pdf')}
            </a>
          </div>
        </div>`;
    }

    // Interactive card
    if (formats.interactive?.available) {
      sidebarHtml += `
        <div class="sidebar-card" id="interactive" style="background: var(--surface-container-high); border-color: var(--primary);">
          <div class="pdf-card__icon-large" style="color: var(--primary);">
            <span class="material-symbols-outlined">touch_app</span>
          </div>
          <div class="sidebar-card__body" style="text-align:center;">
            <div class="pdf-card__title">${window.i18n.t('format_interactive')}</div>
            <p class="sidebar-card__description">${window.i18n.t('format_interactive_sub')}</p>
            <a href="interactive.html?id=${articleId}" class="btn-download" style="background: var(--primary); color: var(--on-primary); border: none;">
              <span class="material-symbols-outlined">open_in_new</span>
              Explorar
            </a>
          </div>
        </div>`;
    }

    // Full render
    container.innerHTML = `
      <div class="article-detail__main">
        <div class="article-header">
          <div class="tags" style="margin-bottom: var(--space-md);">${tagsHtml}</div>
          <div class="article-header__meta">
            <span class="article-header__meta-item">
              <span class="material-symbols-outlined">calendar_today</span>
              ${this.formatDate(article.date)}
            </span>
            <span class="article-header__meta-item">
              <span class="material-symbols-outlined">schedule</span>
              ${article.readingTime} ${window.i18n.t('reading_time_suffix')}
            </span>
          </div>
          <h1 class="article-header__title">${i18nData.title}</h1>
        </div>
        <div class="prose" id="article-prose">
          ${contentHtml}
        </div>
        <div class="share-bar">
          <span class="share-bar__label">${window.i18n.t('detail_share')}</span>
          <a href="${twitterUrl}" target="_blank" rel="noopener" class="share-btn" title="Twitter / X">𝕏</a>
          <a href="${linkedinUrl}" target="_blank" rel="noopener" class="share-btn" title="LinkedIn">in</a>
          <a href="${mastodonUrl}" target="_blank" rel="noopener" class="share-btn" title="Mastodon">🐘</a>
        </div>
        <div class="related-articles" id="related-articles"></div>
      </div>
      <aside class="article-detail__sidebar">
        ${sidebarHtml}
      </aside>
    `;

    // Init interactive features after render
    this.initLightbox();
    this.initReadingProgress();
    this.renderRelatedArticles(article);

    // Apply syntax highlighting
    if (window.Prism) {
      window.Prism.highlightAll();
    }

    // Scroll to hash if present (e.g., #podcast, #pdf, #infographic)
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
      }
    }
  },

  /**
   * Initialize lightbox for infographic
   */
  initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    if (!lightbox || !lightboxImg) return;

    // Direct binding for opening lightbox
    document.querySelectorAll('[data-infographic]').forEach(el => {
      if (el._lightboxBound) return;
      
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Crucial to prevent article card navigation
        
        lightboxImg.src = el.dataset.infographic;
        lightboxImg.alt = 'Infographic';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
      el._lightboxBound = true;
    });

    // Close logic (only bind once)
    if (!this._lightboxCloseBound) {
      const closeLightbox = () => {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
      };

      lightboxClose?.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
      });
      this._lightboxCloseBound = true;
    }
  },

  /**
   * Reading progress bar
   */
  initReadingProgress() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const percent = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(percent, 100)}%`;
    }, { passive: true });
  },

  /**
   * Render related articles (by shared tags)
   */
  async renderRelatedArticles(currentArticle) {
    const container = document.getElementById('related-articles');
    if (!container) return;

    const articles = await this.loadArticles();
    const lang = window.i18n.getLang();

    // Find articles sharing at least one tag (exclude current)
    const related = articles
      .filter(a => a.id !== currentArticle.id)
      .map(a => ({
        ...a,
        sharedTags: a.tags.filter(t => currentArticle.tags.includes(t)).length
      }))
      .filter(a => a.sharedTags > 0)
      .sort((a, b) => b.sharedTags - a.sharedTags)
      .slice(0, 3);

    if (related.length === 0) {
      container.style.display = 'none';
      return;
    }

    const cardsHtml = related.map(a => {
      const i18n = a.i18n[lang];
      return `
        <a href="article.html?id=${a.id}" class="related-card">
          <div class="related-card__title">${i18n.title}</div>
          <p class="related-card__summary">${i18n.summary}</p>
        </a>
      `;
    }).join('');

    container.innerHTML = `
      <h3 class="related-articles__title">${window.i18n.t('detail_related')}</h3>
      <div class="related-articles__grid">${cardsHtml}</div>
    `;
  },

  /**
   * Initialize the article detail page
   */
  async initArticle() {
    await this.renderArticleDetail();

    // Re-render on language change
    window.addEventListener('langchange', async () => {
      await this.renderArticleDetail();
    });
  },

  // ==========================================
  // TOPICS PAGE
  // ==========================================

  async initTopics() {
    const params = new URLSearchParams(window.location.search);
    let currentQuery = (params.get('q') || '').trim().toLowerCase();
    
    // Parse tags from URL (comma separated)
    const tagsParam = params.get('tags');
    let selectedTags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
    
    let filterMode = params.get('mode') === 'and' ? 'and' : 'or';
    
    // Set search input if returning from another page
    const searchInput = document.getElementById('search-input');
    if (searchInput && currentQuery) {
      searchInput.value = currentQuery;
      document.getElementById('search-container')?.classList.add('active');
    }

    const allArticles = await this.loadArticles();
    
    // Extract unique tags automatically from existing articles
    const allTagsSet = new Set();
    allArticles.forEach(a => a.tags.forEach(tag => allTagsSet.add(tag)));
    
    const allTags = Array.from(allTagsSet);

    const renderPage = () => {
      const lang = window.i18n.getLang();
      
      // Render Tags
      const tagsContainer = document.getElementById('topics-filter-tags');
      if (tagsContainer) {
        tagsContainer.innerHTML = allTags.map(tag => {
          const isActive = selectedTags.includes(tag) ? ' active' : '';
          return `<button class="filter-tag${isActive}" data-tag="${tag}">${this.translateTag(tag)}</button>`;
        }).join('');

        // Attach tag click events
        tagsContainer.querySelectorAll('.filter-tag').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const tag = e.target.dataset.tag;
            
            if (selectedTags.includes(tag)) {
              // Deselect
              selectedTags = selectedTags.filter(t => t !== tag);
            } else {
              // Select
              selectedTags.push(tag);
              currentQuery = ''; // Clear text search when selecting a tag
              if (searchInput) searchInput.value = '';
            }
            updateUrlAndRender();
          });
        });
      }

      // Logic Toggle UI
      const logicCheckbox = document.getElementById('logic-checkbox');
      const logicOrLabel = document.getElementById('logic-or');
      const logicAndLabel = document.getElementById('logic-and');
      
      if (logicCheckbox && logicOrLabel && logicAndLabel) {
        // Init state
        logicCheckbox.checked = filterMode === 'and';
        logicOrLabel.classList.toggle('active', filterMode === 'or');
        logicAndLabel.classList.toggle('active', filterMode === 'and');

        // Handle change
        logicCheckbox.onchange = (e) => {
          filterMode = e.target.checked ? 'and' : 'or';
          updateUrlAndRender();
        };
      }

      // Filter articles
      let filteredArticles = allArticles;
      
      if (selectedTags.length > 0) {
        if (filterMode === 'and') {
          // Filter by ALL selected tags (AND logic)
          filteredArticles = filteredArticles.filter(a => 
            selectedTags.every(t => a.tags.includes(t))
          );
        } else {
          // Filter by ANY selected tag (OR logic)
          filteredArticles = filteredArticles.filter(a => 
            selectedTags.some(t => a.tags.includes(t))
          );
        }
      } else if (currentQuery) {
        filteredArticles = filteredArticles.filter(a => {
          const i18nData = a.i18n[lang];
          const textToSearch = `${i18nData.title} ${i18nData.summary}`.toLowerCase();
          return textToSearch.includes(currentQuery);
        });
      }

      // Update count
      const countEl = document.getElementById('topics-results-count');
      if (countEl) {
        countEl.innerHTML = `${filteredArticles.length} <span data-i18n="topics_articles_count">${window.i18n.t('topics_articles_count')}</span>`;
      }

      // Render list
      const listContainer = document.getElementById('topics-results-list');
      this.renderArticleList(filteredArticles, listContainer);

      // Update SEO
      this.updateSEO(
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
      
      const newUrl = newParams.toString() ? `${window.location.pathname}?${newParams.toString()}` : window.location.pathname;
      window.history.pushState({}, '', newUrl);
      
      renderPage();
    };

    // Listen to the global search input specifically for topics.html to avoid reload
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentQuery = e.target.value.trim().toLowerCase();
        selectedTags = []; // Clear tags when typing
        updateUrlAndRender();
      });
    }

    // Initial render
    renderPage();

    // Re-render on language change
    window.addEventListener('langchange', () => {
      renderPage();
    });
  },

  // ==========================================
  // INTERACTIVE PAGE
  // ==========================================

  async initInteractive() {
    const articleId = this.getArticleId();
    if (!articleId) {
      window.location.href = 'index.html';
      return;
    }

    const article = await this.getArticleById(articleId);
    if (!article || !article.formats?.interactive?.available) {
      window.location.href = `article.html?id=${articleId || ''}`;
      return;
    }

    const lang = window.i18n.getLang();
    const dataFile = article.formats.interactive.dataFile;

    // Fetch the specific interactive JSON
    try {
      const response = await fetch(`data/${lang}/${dataFile}?v=4`, { cache: 'no-store' });
      const data = await response.json();
      this.renderInteractive(data);

      window.addEventListener('langchange', async () => {
        const newLang = window.i18n.getLang();
        const res = await fetch(`data/${newLang}/${dataFile}?v=4`, { cache: 'no-store' });
        const newData = await res.json();
        this.renderInteractive(newData);
      });
    } catch (e) {
      console.error('Error loading interactive data:', e);
    }
  },

  renderInteractive(data) {
    document.title = `PRISMA — ${data.title}`;
    this.updateSEO(`PRISMA — ${data.title}`, data.subtitle);

    const subtitleEl = document.getElementById('interactive-subtitle');
    const desktopNav = document.getElementById('desktop-nav');
    const mobileNav = document.getElementById('mobile-nav');
    const contentArea = document.getElementById('interactive-content');
    
    if (subtitleEl) subtitleEl.textContent = data.subtitle;

    // Generate Nav
    let desktopNavHtml = '';
    let mobileNavHtml = '';
    
    data.nav.forEach((item, index) => {
      const activeClass = index === 0 ? ' active' : '';
      desktopNavHtml += `<a data-target="${item.id}" class="interactive-nav-item${activeClass}">${item.label}</a>`;
      mobileNavHtml += `<option value="${item.id}">${item.label}</option>`;
    });

    if (desktopNav) desktopNav.innerHTML = desktopNavHtml;
    if (mobileNav) mobileNav.innerHTML = mobileNavHtml;

    // Generate Sections
    let sectionsHtml = '';
    data.nav.forEach((item, index) => {
      const activeClass = index === 0 ? ' active' : '';
      sectionsHtml += `<section id="${item.id}" class="content-section${activeClass}">${data.sections[item.id]}</section>`;
    });
    if (contentArea) contentArea.innerHTML = sectionsHtml;

    // Post-render logic: Navigation
    const navItems = document.querySelectorAll('.interactive-nav-item');
    const sections = document.querySelectorAll('.content-section');

    const switchSection = (targetId) => {
      navItems.forEach(item => {
        if (item.getAttribute('data-target') === targetId) item.classList.add('active');
        else item.classList.remove('active');
      });
      if (mobileNav) mobileNav.value = targetId;
      sections.forEach(section => {
        if (section.id === targetId) section.classList.add('active');
        else section.classList.remove('active');
      });
      if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    };

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        switchSection(e.target.getAttribute('data-target'));
      });
    });

    if (mobileNav) {
      mobileNav.addEventListener('change', (e) => {
        switchSection(e.target.value);
      });
    }

    // Post-render logic: Charts
    this.initInteractiveCharts(data.chartData);

    // Post-render logic: Checklist
    this.initInteractiveChecklist(data.checklistData);
  },

  initInteractiveCharts(chartData) {
    if (!chartData || typeof Chart === 'undefined') return;
    
    // Radar
    const radarCanvas = document.getElementById('threatRadarChart');
    if (radarCanvas && chartData.radar) {
      new Chart(radarCanvas, {
        type: 'radar',
        data: {
          labels: chartData.radar.labels,
          datasets: [
            {
              label: 'Node.js',
              data: chartData.radar.node,
              backgroundColor: 'rgba(76, 215, 246, 0.2)',
              borderColor: '#4cd7f6',
              pointBackgroundColor: '#4cd7f6'
            },
            {
              label: 'PHP',
              data: chartData.radar.php,
              backgroundColor: 'rgba(208, 188, 255, 0.2)',
              borderColor: '#d0bcff',
              pointBackgroundColor: '#d0bcff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { r: { min: 0, max: 10, grid: { color: 'rgba(255,255,255,0.1)' }, angleLines: { color: 'rgba(255,255,255,0.1)' } } }
        }
      });
    }

    // Bar
    const barCanvas = document.getElementById('dependencyScaleChart');
    if (barCanvas && chartData.bar) {
      new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: chartData.bar.labels,
          datasets: [{
            label: 'NPM Packages',
            data: chartData.bar.data,
            backgroundColor: ['#4edea3', '#4cd7f6', '#d0bcff']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // Doughnut
    const doughnutCanvas = document.getElementById('attackVectorsChart');
    if (doughnutCanvas && chartData.doughnut) {
      new Chart(doughnutCanvas, {
        type: 'doughnut',
        data: {
          labels: chartData.doughnut.labels,
          datasets: [{
            data: chartData.doughnut.data,
            backgroundColor: ['#4cd7f6', '#4edea3', '#d0bcff', '#ffb4ab']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  },

  initInteractiveChecklist(checklistData) {
    if (!checklistData) return;
    const container = document.getElementById('mitigationChecklist');
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (!container || !scoreDisplay) return;

    let checkedCount = 0;
    const total = checklistData.length;
    
    const updateScore = () => {
      scoreDisplay.textContent = `${checkedCount} / ${total} ${window.i18n.t('implemented') || 'Implemented'}`;
    };

    container.innerHTML = checklistData.map(item => `
      <li id="li-${item.id}">
        <div style="margin-top:4px;">
          <input type="checkbox" id="${item.id}" style="pointer-events:none;">
        </div>
        <div>
          <label class="font-bold text-on-surface" style="pointer-events:none;">${item.label}</label>
          <p class="text-sm text-on-surface-variant" style="pointer-events:none; margin-top:4px;">${item.desc}</p>
        </div>
      </li>
    `).join('');

    checklistData.forEach(item => {
      const li = document.getElementById(`li-${item.id}`);
      li.addEventListener('click', () => {
        const checkbox = document.getElementById(item.id);
        checkbox.checked = !checkbox.checked;
        if (checkbox.checked) {
          li.classList.add('checked');
          checkedCount++;
        } else {
          li.classList.remove('checked');
          checkedCount--;
        }
        updateScore();
      });
    });

    updateScore();
  },

  ensureLightbox() {
    if (!document.getElementById('lightbox')) {
      const lightbox = document.createElement('div');
      lightbox.id = 'lightbox';
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <button class="lightbox__close" id="lightbox-close">
          <span class="material-symbols-outlined">close</span>
        </button>
        <img id="lightbox-img" src="" alt="" />
      `;
      document.body.appendChild(lightbox);
    }
    this.initLightbox();
  },

  /**
   * Global initialization
   */
  init() {
    // Init shared features
    window.i18n.initI18n();
    this.initHamburger();
    this.initSearch();
    this.ensureLightbox();

    // Page-specific init
    const page = document.body.dataset.page;
    if (page === 'home') {
      this.initHome();
    } else if (page === 'article') {
      this.initArticle();
    } else if (page === 'topics') {
      this.initTopics();
    } else if (page === 'interactive') {
      this.initInteractive();
    }

    // Fade in
    document.body.classList.add('page-fade-in');
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => PRISMA.init());
