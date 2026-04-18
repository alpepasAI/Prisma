/**
 * PRISMA — Internationalization (i18n) Module
 * Lightweight language switching for ES/EN
 */

const translations = {
  es: {
    // Navigation
    nav_home: 'Inicio',
    nav_topics: 'Temas',
    nav_archive: 'Archivo',

    // Hero
    hero_cta: 'Leer Análisis Completo',

    // Formats
    format_podcast: 'Podcast',
    format_podcast_sub: 'Análisis en Audio',
    format_pdf: 'PDF',
    format_pdf_sub: 'Documento de Investigación',
    format_infographic: 'Infografía',
    format_infographic_sub: 'Mapa Visual',
    format_podcast_available: 'Podcast',
    format_pdf_available: 'PDF',
    format_infographic_available: 'Infografía',
    format_not_available: 'No disponible',

    // Chronological Log
    section_chronolog: 'Registro Cronológico',
    reading_time_suffix: 'min de lectura',

    // Footer
    footer_privacy: 'Política de Privacidad',
    footer_terms: 'Términos de Servicio',
    footer_github: 'Github',
    footer_contact: 'Contacto',
    footer_copyright: `© ${new Date().getFullYear()} PRISMA. Todos los derechos reservados.`,

    // Search
    search_placeholder: 'Buscar artículos...',

    // Article Detail
    format_interactive: 'Interactivo',
    format_interactive_sub: 'Exploración de datos',
    back_to_article: 'Volver al Artículo',
    
    detail_listen: 'Escucha el Análisis',
    detail_episode: 'Episodio',
    detail_podcast_short: 'Versión Resumida (5 min)',
    detail_podcast_normal: 'Versión Completa',
    detail_visual_data: 'Datos Visuales',
    detail_expand: 'Ampliar',
    detail_full_study: 'Estudio Completo',
    detail_full_study_desc: 'Accede al documento técnico detallado con referencias académicas y benchmarks.',
    detail_download_pdf: 'Descargar PDF',
    detail_web_version: 'Leer versión web',
    detail_related: 'Artículos Relacionados',
    detail_share: 'Compartir',

    // Topics
    topics_title: 'Explorador de Temas',
    topics_subtitle: 'Selecciona uno o más temas para filtrar la biblioteca de conocimiento.',
    topics_filtered: 'Artículos filtrados',
    topics_articles_count: 'artículos',
    logic_or: 'Cualquiera',
    logic_and: 'Todos',

    // Tags
    'tag_ciberseguridad': 'Ciberseguridad',
    'tag_open-source': 'Open Source',
    'tag_npm': 'npm',
    'tag_supply-chain': 'Cadena de Suministro',
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_topics: 'Topics',
    nav_archive: 'Archive',

    // Hero
    hero_cta: 'Read Full Analysis',

    // Formats
    format_podcast: 'Podcast',
    format_podcast_sub: 'Audio Analysis',
    format_pdf: 'PDF',
    format_pdf_sub: 'Research Paper',
    format_infographic: 'Infographic',
    format_infographic_sub: 'Visual Roadmap',
    format_podcast_available: 'Podcast',
    format_pdf_available: 'PDF',
    format_infographic_available: 'Infographic',
    format_not_available: 'Not available',

    // Chronological Log
    section_chronolog: 'Chronological Log',
    reading_time_suffix: 'min read',

    // Footer
    footer_privacy: 'Privacy Policy',
    footer_terms: 'Terms of Service',
    footer_github: 'Github',
    footer_contact: 'Contact',
    footer_copyright: `© ${new Date().getFullYear()} PRISMA. All rights reserved.`,

    // Search
    search_placeholder: 'Search articles...',

    // Article Detail
    format_interactive: 'Interactive',
    format_interactive_sub: 'Data exploration',
    back_to_article: 'Back to Article',

    detail_listen: 'Listen to the Analysis',
    detail_episode: 'Episode',
    detail_podcast_short: 'Short Version (5 min)',
    detail_podcast_normal: 'Full Version',
    detail_visual_data: 'Visual Data',
    detail_expand: 'Expand',
    detail_full_study: 'Full Study',
    detail_full_study_desc: 'Access the detailed technical document with academic references and benchmarks.',
    detail_download_pdf: 'Download PDF',
    detail_web_version: 'Read web version',
    detail_related: 'Related Articles',
    detail_share: 'Share',

    // Topics
    topics_title: 'Topic Explorer',
    topics_subtitle: 'Select one or more topics to filter the knowledge library.',
    topics_filtered: 'Filtered articles',
    topics_articles_count: 'articles',
    logic_or: 'Any',
    logic_and: 'All',

    // Tags
    'tag_ciberseguridad': 'Cybersecurity',
    'tag_open-source': 'Open Source',
    'tag_npm': 'npm',
    'tag_supply-chain': 'Supply Chain',
  }
};

/**
 * Get the current language from localStorage or default to 'es'
 */
function getLang() {
  return localStorage.getItem('prisma-lang') || 'es';
}

/**
 * Set the language and update all translatable elements
 */
function setLang(lang) {
  if (!translations[lang]) return;

  localStorage.setItem('prisma-lang', lang);

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  // Update lang switcher buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Update html lang attribute
  document.documentElement.lang = lang;

  // Dispatch event for other modules to react
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

/**
 * Translate a single key
 */
function t(key) {
  const lang = getLang();
  return translations[lang]?.[key] || translations['es']?.[key] || key;
}

/**
 * Initialize i18n: set up event listeners and apply current language
 */
function initI18n() {
  // Language switcher buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
    });
  });

  // Apply saved language
  setLang(getLang());
}

// Export for use in other modules
window.i18n = { getLang, setLang, t, initI18n, translations };
