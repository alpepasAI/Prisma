# PRISMA

PRISMA es una biblioteca digital de análisis técnicos profundos sobre programación, ciberseguridad e inteligencia artificial. Su objetivo es ofrecer conocimiento técnico de alta calidad en múltiples formatos (texto, audio, visual) para adaptarse a diferentes estilos de aprendizaje.

## Características Principales

- **Multi-Formato:** Cada artículo puede acompañarse de podcasts duales (versiones breves y completas), documentos PDF descargables y ricas infografías con lightbox.
- **Bilingüe (ES/EN):** Sistema de internacionalización 100% nativo que permite cambiar de idioma en tiempo real sin recargar la página.
- **Explorador de Temas Dinámico:** Un buscador avanzado que permite filtrar artículos en vivo usando lógica *Cualquiera/Todos* (OR/AND) directamente sobre una base de etiquetas auto-generadas.
- **Arquitectura Ultraligera:** Cero dependencias complejas. Sin frameworks de backend ni bundlers. Funciona puramente con Vanilla JavaScript, HTML5 y CSS3.
- **Markdown Rendering:** Los artículos técnicos se escriben en Markdown estándar y se renderizan al vuelo en el cliente con resaltado de sintaxis enriquecido.

## Tecnologías Utilizadas

- **Core:** HTML5, CSS3 (con sistema de diseño basado en variables), Vanilla JavaScript (ES6+).
- **Librerías Externas (Vía CDN):**
  - [marked.js](https://marked.js.org/) - Para el renderizado de archivos Markdown.
  - [Prism.js](https://prismjs.com/) - Para el resaltado de sintaxis de código (`javascript`, `php`, `bash`, etc.).
  - Google Fonts & Material Symbols.

## Estructura del Proyecto

```
/
├── index.html          # Página principal (Home) con hero banner y log cronológico
├── article.html        # Plantilla para la vista detallada de cualquier artículo
├── topics.html         # Explorador interactivo de temas y buscador
├── css/
│   └── styles.css      # Hoja de estilos principal (sistema de diseño y responsive)
├── js/
│   ├── app.js          # Lógica principal de la aplicación (Router, Renderizado, Filtros)
│   └── i18n.js         # Diccionario de traducciones y lógica de cambio de idioma
├── data/
│   ├── articles.json   # Base de datos principal (Metadatos de todos los artículos)
│   ├── es/             # Contenido en Español (Markdown, Infografías, PDFs)
│   └── en/             # Contenido en Inglés (Markdown, Infografías, PDFs)
└── robots.txt          # Reglas SEO para motores de búsqueda
```

## Cómo ejecutar en local

Dado que PRISMA hace llamadas `fetch()` para obtener los archivos JSON y Markdown de la carpeta `data/`, no puedes simplemente abrir los archivos HTML con doble clic en el navegador (por políticas de CORS). 

Necesitas un servidor HTTP local básico. Puedes usar cualquiera de las siguientes opciones desde la raíz del proyecto:

- **Node.js / npm:** `npx serve .` o `npx http-server`
- **Python:** `python3 -m http.server 8000`
- **PHP:** `php -S localhost:8000`

Luego, abre `http://localhost:8000` en tu navegador.

## 🚀 Gestión de Contenido y Workflows

Para añadir un nuevo artículo a PRISMA de forma automatizada, sigue estos pasos:

1.  **Preparar Archivos:** Deja todos tus documentos (PDFs, Markdowns, Infografías y HTML de Dashboard) en la carpeta `draft/`.
2.  **Lanzar Integración:** Envía el contenido de `CONTENT_TEMPLATE.md` al agente de IA.
3.  **Procesado Automático:** El agente ejecutará el workflow `article_integration` ubicado en `.agent/workflows/article_integration.md`, el cual se encarga de:
    -   Extraer títulos y etiquetas de los Markdowns.
    -   Calcular el tiempo de lectura y asignar la fecha actual.
    -   Mover y renombrar todos los activos a sus carpetas finales.
    -   Actualizar `articles.json` y gestionar el estado de "noticia destacada".
    -   Limpiar la carpeta `draft/`.
4.  **Revisión Final:** Verifica los cambios y proporciona los IDs finales de Spotify para los podcasts.

Para más detalles sobre la arquitectura y filosofía del proyecto, consulta [AGENTS.md](AGENTS.md).
