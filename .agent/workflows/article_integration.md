---
description: This workflow automates the process of adding a new technical article to the PRISMA blog using source materials from the `draft/` folder.
---

# 🔄 Workflow: Article Integration

This workflow automates the process of adding a new technical article to the PRISMA blog using source materials from the `draft/` folder.

## Prerequisites
- Files present in `draft/` (PDFs, Markdowns, Infographics, Interactive HTML).
- User provided the `CONTENT_TEMPLATE.md` reference.

## Step 1: Extraction & Identity
1.  **Read Source Markdown (ES/EN):** Extract the title and identified tags.
2.  **Calculate Metadata:** 
    -   **readingTime:** Calculate based on the word count of the **generated web article** (Step 4), not the raw source (~200 words/min).
    -   Use the current date for the `date` field.
3.  **Generate ID:** Assign a unique ID using the `XXX-slug-format` (e.g., `003-future-of-ai`).

## Step 2: Asset Management
1.  **Move & Rename PDFs:**
    -   `draft/[PDF_ES]` -> `assets/pdfs/[ID]-es.pdf`
    -   `draft/[PDF_EN]` -> `assets/pdfs/[ID]-en.pdf`
2.  **Move & Rename Infographics:**
    -   `draft/[INFO_ES]` -> `assets/infographics/[ID]-infographic-es.png`
    -   `draft/[INFO_EN]` -> `assets/infographics/[ID]-infographic-en.png`

## Step 3: Data Layer (articles.json)
1.  **Update `data/articles.json`**:
    -   Insert the new entry at the top of the `articles` array.
    -   Set `featured: true` for the new article.
    -   Set `featured: false` for all previous articles.
    -   **Summary:** Write a 2-3 sentence editorial summary with a professional "hook" and industry perspective.

## Step 4: Content Generation
1.  **Web Markdown:** Save the cleaned Markdown files to `data/es/[ID].md` and `data/en/[ID].md`. Remove any redundant main titles (`# Title`) as the UI handles them.
2.  **Interactive Dashboard:** 
    -   Parse `draft/interactive_article.html`.
    -   Transform data into `data/es/[ID]-interactive.json` and `data/en/[ID]-interactive.json`.
    -   Ensure charts and sections match the PRISMA design system.

## Step 5: Internationalization
1.  **Update `js/i18n.js`**:
    -   Add any new tags found in Step 1 to the `tags` section in both `es` and `en` dictionaries.
    -   Use the `tag_` prefix for keys.

## Step 6: Cleanup & Validation
1.  **Delete Drafts:** Wipe all files inside the `draft/` folder.
2.  **Bump Version:** Increment the `?v=X` parameter in `index.html`, `article.html`, and `topics.html` to invalidate cache.
3.  **Final Report:** Summarize the changes and provide links for manual verification.

## Step 7: Podcast Update (Post-Approval)
1.  Once the user provides Spotify URLs, update the `podcasts` object in the corresponding `articles.json` entry.
