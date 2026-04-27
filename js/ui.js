/**
 * PRISMA — UI Utilities (js/ui.js)
 * Shared UI initialization: hamburger, search, lightbox, progress bar, SEO.
 */

let _lightboxCloseBound = false;

/**
 * Dynamically load header and footer components.
 */
export async function loadPartials() {
  const headerContainer = document.getElementById('app-header');
  const footerContainer = document.getElementById('app-footer');

  try {
    if (headerContainer) {
      const res = await fetch('components/header.html');
      headerContainer.outerHTML = await res.text();
    }
    if (footerContainer) {
      const res = await fetch('components/footer.html');
      footerContainer.outerHTML = await res.text();
    }
  } catch (e) {
    console.error('Failed to load partials', e);
  }
}

/**
 * Update SEO meta tags dynamically.
 * Falls back to assets/logo.png if no imageUrl provided.
 */
export function updateSEO(title, description, url = window.location.href, imageUrl = '') {
  const origin = window.location.origin;
  const defaultImage = `${origin}/assets/logo.png`;
  const finalImage = imageUrl.startsWith('http')
    ? imageUrl
    : imageUrl ? `${origin}/${imageUrl}` : defaultImage;

  const set = (id, attr, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    attr === 'text' ? (el.textContent = val) : el.setAttribute(attr, val);
  };

  set('page-title', 'text', title);
  set('meta-desc',  'content', description);
  set('og-title',   'content', title);
  set('og-desc',    'content', description);
  set('og-url',     'content', url);
  set('og-image',   'content', finalImage);
  set('tw-title',   'content', title);
  set('tw-desc',    'content', description);
  set('tw-image',   'content', finalImage);
}

/** Initialize hamburger menu for mobile nav */
export function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('nav-mobile');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/** Initialize search bar in header */
export function initSearch() {
  const searchContainer = document.getElementById('search-container');
  const searchBtn       = document.getElementById('search-btn');
  const searchInput     = document.getElementById('search-input');
  if (!searchContainer || !searchBtn || !searchInput) return;

  searchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchContainer.classList.toggle('active');
    if (searchContainer.classList.contains('active')) searchInput.focus();
  });

  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) searchContainer.classList.remove('active');
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (document.body.dataset.page !== 'topics') {
        window.location.href = `topics.html?q=${encodeURIComponent(query)}`;
      }
    }
  });
}

/** Bind lightbox open/close events for [data-infographic] elements */
export function initLightbox() {
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  if (!lightbox || !lightboxImg) return;

  document.querySelectorAll('[data-infographic]').forEach(el => {
    if (el._lightboxBound) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      lightboxImg.src = el.dataset.infographic;
      lightboxImg.alt = 'Infographic';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    el._lightboxBound = true;
  });

  if (!_lightboxCloseBound) {
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };
    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
    _lightboxCloseBound = true;
  }
}

/** Inject lightbox into DOM if missing, then bind events */
export function ensureLightbox() {
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
  initLightbox();
}

/** Bind reading progress bar to scroll events */
export function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent   = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(percent, 100)}%`;
  }, { passive: true });
}
