# PRISMA

PRISMA es una biblioteca digital de análisis técnicos profundos sobre programación, ciberseguridad e inteligencia artificial. Su objetivo es ofrecer conocimiento técnico de alta calidad en múltiples formatos (texto, audio, visual) para adaptarse a diferentes estilos de aprendizaje.

## Características Principales

- **Multi-Formato:** Cada artículo puede acompañarse de podcasts duales (versiones breves y completas), documentos PDF descargables, infografías con lightbox y un dashboard interactivo con gráficas.
- **Bilingüe (ES/EN):** Sistema de internacionalización 100% nativo que permite cambiar de idioma en tiempo real sin recargar la página.
- **Explorador de Temas Dinámico:** Buscador avanzado con filtrado en vivo usando lógica *Cualquiera/Todos* (OR/AND) sobre etiquetas auto-generadas desde `articles.json`.
- **Skeleton Screens:** Los contenedores de contenido muestran placeholders animados mientras se cargan los datos, eliminando los flashes de pantalla en blanco.
- **Arquitectura Modular Vanilla:** Sin frameworks ni bundlers. ES6 modules nativos, HTML5 y CSS3 con sistema de diseño por variables.
- **SEO Estático:** Meta tags `og:*` y `twitter:*` con valores fallback reales en cada HTML para crawlers sin JavaScript.

## Tecnologías Utilizadas

- **Core:** HTML5, CSS3 (variables CSS), Vanilla JavaScript ES6+ (módulos nativos).
- **Librerías Externas (Vía CDN):**
  - [marked.js](https://marked.js.org/) — Renderizado de Markdown en el cliente.
  - [Prism.js](https://prismjs.com/) — Resaltado de sintaxis (`javascript`, `php`, `bash`, etc.).
  - [Chart.js](https://www.chartjs.org/) — Gráficas en los dashboards interactivos.
  - Google Fonts & Material Symbols.

## Estructura del Proyecto

```
/
├── index.html              # Home: hero banner + log cronológico
├── article.html            # Vista detallada de artículo
├── topics.html             # Explorador de temas y buscador
├── interactive.html        # Dashboard interactivo por artículo
├── sitemap.xml             # Mapa del sitio para motores de búsqueda
├── robots.txt              # Reglas SEO
│
├── css/
│   └── styles.css          # Sistema de diseño: tokens, layout, skeleton screens
│
├── js/
│   ├── app.js              # Orquestador: routing por data-page + page inits
│   ├── data.js             # Capa de datos: carga, caché y utilidades de artículos
│   ├── ui.js               # UI compartida: hamburger, search, lightbox, SEO
│   ├── renderer.js         # Renderizado: hero, listas, detalle, relacionados
│   ├── interactive.js      # Dashboard: Chart.js, tabs, accordions, calculadoras
│   └── i18n.js             # Diccionario ES/EN y lógica de cambio de idioma
│
├── data/
│   ├── articles.json       # Base de datos principal (metadatos de artículos)
│   ├── es/                 # Contenido en Español (Markdown + JSONs interactivos)
│   └── en/                 # Contenido en Inglés (Markdown + JSONs interactivos)
│
├── assets/
│   ├── logo.png            # Logo principal (también OG image fallback)
│   ├── favicon.png         # Favicon del navegador
│   ├── covers/             # Hero images optimizadas para web
│   ├── infographics/       # Infografías PNG por artículo e idioma
│   ├── pdfs/               # Documentos PDF descargables
│   ├── spotify/            # Carátulas 3000×3000px para plataformas de podcast
│   └── sources/            # Activos master (logos originales, archivos de diseño)
│
├── draft/                  # Carpeta de trabajo para integración de nuevo contenido
├── AGENTS.md               # Guía técnica para agentes y desarrolladores
├── ARCHITECTURE.md         # Diagrama y contratos de la arquitectura JS modular
├── DESIGN.md               # Sistema de diseño "The Neon Library"
└── CONTENT_TEMPLATE.md     # Plantilla para integrar un nuevo artículo
```

## Cómo Ejecutar en Local

> [!IMPORTANT]
> PRISMA usa **ES6 modules nativos** (`import`/`export`). Los módulos **no funcionan** si abres los archivos directamente desde el sistema de ficheros (`file://`). Necesitas un servidor HTTP local.

Ejecuta uno de los siguientes comandos desde la raíz del proyecto:

```bash
# Node.js (recomendado)
npx serve .

# Python
python3 -m http.server 8000

# PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en el navegador.

## Arquitectura JS (Resumen)

El JavaScript está dividido en módulos ES6 con responsabilidades claras:

| Módulo | Responsabilidad |
|--------|----------------|
| `app.js` | Orquestador: routing por `data-page`, page init functions |
| `data.js` | Data layer: carga artículos con caché, URLs de assets, formateo |
| `ui.js` | UI compartida: hamburger, search, lightbox, progress bar, SEO |
| `renderer.js` | Renderiza hero, listas de artículos, detalle y relacionados |
| `interactive.js` | Dashboard: charts, tabs, accordions, checklist, calculadora |
| `i18n.js` | Traducciones ES/EN (script regular, no módulo) |

Para la guía completa de arquitectura, contratos entre módulos y cómo añadir nuevas funcionalidades, consulta [ARCHITECTURE.md](ARCHITECTURE.md).

## 🚀 Gestión de Contenido y Workflows

Para añadir un nuevo artículo a PRISMA, sigue el flujo:

1. **Preparar archivos:** Deja todos los documentos (PDFs, Markdowns, infografías, HTML de dashboard) en la carpeta `draft/`.
2. **Invocar el workflow:** Lanza `/article_integration` al agente de IA con el contenido de `CONTENT_TEMPLATE.md`.
3. **Procesado automático:** El agente ejecuta `.agent/workflows/article_integration.md`, que:
   - Extrae títulos, resúmenes y etiquetas de los Markdowns.
   - Calcula el tiempo de lectura y asigna la fecha actual.
   - Mueve y renombra todos los activos a sus carpetas finales.
   - Actualiza `articles.json` y `sitemap.xml`.
   - Gestiona el estado `featured` y limpia `draft/`.
4. **Revisión final:** Verifica los cambios y proporciona los IDs de Spotify para los podcasts.

## 📁 Estrategia de Activos

PRISMA gestiona diferentes tipos de activos visuales para maximizar la calidad en todas las plataformas:

- **`assets/logo.png`**: Logo principal. También se usa como `og:image` fallback en todos los HTML para crawlers sin JS.
- **`assets/covers/`**: Imágenes optimizadas para web (hero panorámico). Esenciales para la carga de página.
- **`assets/spotify/`**: Carátulas en alta resolución (3000×3000px) exclusivas para plataformas de podcast.
- **`assets/sources/`**: Fuentes maestras (logos, archivos de diseño originales). No usar directamente en la web.

> [!NOTE]
> **Gestión de espacio:** Si el tamaño del repositorio crece por activos en `assets/spotify/`, considera añadir esa carpeta al `.gitignore` y gestionar los archivos de forma externa (Git LFS o almacenamiento en la nube).

Para la guía técnica completa de arquitectura y contribución, consulta [AGENTS.md](AGENTS.md).
