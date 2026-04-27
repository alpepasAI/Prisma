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
    hero_cta: 'Leer Artículo Editorial',

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
    footer_designed_by: 'Diseñado por',
    footer_labs: 'Alpepas Labs',
    footer_copyright: `© ${new Date().getFullYear()} PRISMA. Todos los derechos reservados.`,

    // Search
    search_placeholder: 'Buscar artículos...',

    // Article Detail
    format_interactive: 'Interactivo',
    format_interactive_sub: 'Exploración de datos',
    back_to_article: 'Volver al Artículo',
    
    detail_listen: 'Escucha el Análisis',
    detail_episode: 'Episodio',
    detail_podcast_short: 'Versión Resumida',
    detail_podcast_normal: 'Versión Completa',
    detail_visual_data: 'Datos Visuales',
    detail_expand: 'Ampliar',
    detail_full_study: 'Estudio Completo',
    detail_full_study_desc: 'Accede al documento técnico detallado con referencias académicas y benchmarks.',
    detail_download_pdf: 'Descargar PDF',
    detail_web_version: 'Leer Artículo Editorial',
    detail_related: 'Artículos Relacionados',
    detail_share: 'Compartir',
    detail_explore: 'Explorar',
    
    // System Messages
    content_load_error: 'No se pudo cargar el contenido.',
    no_results: 'No se encontraron artículos.',
    article_not_found: 'Artículo no encontrado.',
    implemented: 'Implementados',
    memory_footprint: 'Huella de Memoria',
    topics_title: 'Temas',
    topics_subtitle: 'Explora nuestros análisis técnicos',
    topics_articles_count: 'artículos',

    // Topics
    topics_title: 'Explorador de Temas',
    topics_subtitle: 'Selecciona uno o más temas para filtrar la biblioteca de conocimiento.',
    topics_filtered: 'Artículos filtrados',
    topics_articles_count: 'artículos',
    logic_or: 'Cualquiera',
    logic_and: 'Todos',

    // Mission Section
    mission_title: 'Nuestra Misión',
    mission_text: 'Este blog nace del deseo de compartir temas de vanguardia sobre IA y programación. Aprovechamos la potencia de modelos como Gemini Deep Research y NotebookLM para crear un crisol de formatos (PDF, Podcast, Infografías, Dashboard Interactivo) para cada análisis, permitiendo que selecciones el que mejor se adapte a tu momento.',
    powered_by: 'Potenciado por Gemini & NotebookLM',

    // Tags
    'tag_ciberseguridad': 'Ciberseguridad',
    'tag_open-source': 'Open Source',
    'tag_npm': 'npm',
    'tag_supply-chain': 'Cadena de Suministro',
    'tag_mcp': 'MCP',
    'tag_ai-agents': 'Agentes de IA',
    'tag_seguridad': 'Seguridad',
    'tag_interoperabilidad': 'Interoperabilidad',
    'tag_arquitectura': 'Arquitectura',
    'tag_backend': 'Backend',
    'tag_nosql': 'NoSQL',
    'tag_consistencia-eventual': 'Consistencia Eventual',
    'tag_microservicios': 'Microservicios',
    'tag_rendimiento': 'Rendimiento',
    'tag_ai': 'IA',
    'tag_optimization': 'Optimización',
    'tag_llm': 'LLM',
    'tag_quantization': 'Cuantización',
    'tag_research': 'Investigación',
    memory_footprint: 'Huella de Memoria',
    implemented: 'Implementado',
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_topics: 'Topics',
    nav_archive: 'Archive',

    // Hero
    hero_cta: 'Read Editorial Article',

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
    footer_designed_by: 'Designed by',
    footer_labs: 'Alpepas Labs',
    footer_copyright: `© ${new Date().getFullYear()} PRISMA. All rights reserved.`,

    // Search
    search_placeholder: 'Search articles...',

    // Article Detail
    format_interactive: 'Interactive',
    format_interactive_sub: 'Data exploration',
    back_to_article: 'Back to Article',

    detail_listen: 'Listen to the Analysis',
    detail_episode: 'Episode',
    detail_podcast_short: 'Short Version',
    detail_podcast_normal: 'Full Version',
    detail_visual_data: 'Visual Data',
    detail_expand: 'Expand',
    detail_full_study: 'Full Study',
    detail_full_study_desc: 'Access the detailed technical paper with academic references and benchmarks.',
    detail_download_pdf: 'Download PDF',
    detail_web_version: 'Read Editorial Article',
    detail_related: 'Related Articles',
    detail_share: 'Share',
    detail_explore: 'Explore',

    // System Messages
    content_load_error: 'Content could not be loaded.',
    no_results: 'No articles found.',
    article_not_found: 'Article not found.',
    implemented: 'Implemented',
    memory_footprint: 'Memory Footprint',
    topics_title: 'Topics',
    topics_subtitle: 'Explore our technical analysis',
    topics_articles_count: 'articles',

    // Topics
    topics_title: 'Topic Explorer',
    topics_subtitle: 'Select one or more topics to filter the knowledge library.',
    topics_filtered: 'Filtered articles',
    logic_or: 'Any',
    logic_and: 'All',

    // Mission Section
    mission_title: 'Our Mission',
    mission_text: 'This blog was born from a desire to share cutting-edge topics in AI and programming. We leverage the power of models like Gemini Deep Research and NotebookLM to create a crucible of formats (PDF, Podcast, Infographics, Interactive Dashboard) for each analysis, letting you choose the one that best fits your moment.',
    powered_by: 'Powered by Gemini & NotebookLM',

    // Tags
    'tag_ciberseguridad': 'Cybersecurity',
    'tag_open-source': 'Open Source',
    'tag_npm': 'npm',
    'tag_supply-chain': 'Supply Chain',
    'tag_mcp': 'MCP',
    'tag_ai-agents': 'AI Agents',
    'tag_seguridad': 'Security',
    'tag_interoperabilidad': 'Interoperability',
    'tag_arquitectura': 'Architecture',
    'tag_backend': 'Backend',
    'tag_nosql': 'NoSQL',
    'tag_consistencia-eventual': 'Eventual Consistency',
    'tag_microservicios': 'Microservices',
    'tag_rendimiento': 'Performance',
    'tag_ai': 'AI',
    'tag_optimization': 'Optimization',
    'tag_llm': 'LLM',
    'tag_quantization': 'Quantization',
    'tag_research': 'Research',
    memory_footprint: 'Memory Footprint',
    implemented: 'Implemented',
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
  return translations[lang]?.[key] || translations['es']?.[key] || null;
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
