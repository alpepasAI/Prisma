---
description: This workflow automates the process of adding a new technical article to the PRISMA blog using source materials from the `draft/` folder.
---

# 🔄 Workflow: Article Integration

> [!NOTE]
> **Agentic Engineering Context:** This workflow is a deterministic runtime protocol for AI agents. It orchestrates complex multi-step content integration tasks (parsing, metadata updates, directory moves) by pairing the LLM's semantic reasoning (generating summaries, validating prompts) with Python helper scripts for precise operations (image cropping, version compiling). This hybrid orchestration ensures zero-defect automation.

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
    -   **Summary (articles.json):** Write a compelling 2-3 sentence introduction with a strong "hook" that presents a problem or interesting fact to invite the user to read more.

## Step 4: Content Generation
1.  **Web Markdown (Editorial Summary):** Do NOT copy the full research markdown. Generate a high-quality **editorial summary** (~800-1000 words) that captures the core narrative and key points in a journalistic style. Save to `data/es/[ID].md` and `data/en/[ID].md`.
2.  **Interactive Dashboard (Full Fidelity):** 
    -   Follow the detailed instructions in [Interactive Dashboard Integration](.agent/workflows/interactive_dashboard_integration.md).
    -   Transform draft HTML into `data/es/[ID]-interactive.json` and `data/en/[ID]-interactive.json`.
    -   **CRITICAL:** Maintain the *exact* text and structure from the draft. 
    -   Ensure dark-mode compatibility via `styles.css` overrides as described in the sub-workflow.
3.  **Visual Assets & Covers:**
    -   Follow the instructions in [Visual Assets & Podcast Covers](.agent/workflows/podcast_cover_creation.md).
    -   **Automation:** Use `fix_hero_crop_v2.py` for the panoramic Hero (3000x1285px) and `generate_branded_squares.py` for the 4 Spotify covers.
    -   **Layout:** Embed the hero image at the very top of the markdown articles, **above the main title**.
    -   Organize Spotify assets in `assets/spotify/[ID_NUMBER]/`.

## Step 5: Internationalization
1.  **Update `js/i18n.js`**:
    -   Add any new tags found in Step 1 to the `tags` section in both `es` and `en` dictionaries.
    -   Use the `tag_` prefix for keys.

## Step 6: Validation & Prompts
1.  **NotebookLM Prompt Generation:** 
    -   Based on the final article content, generate a custom prompt for NotebookLM's "Customize Audio Overview" field.
    -   **Natural Language Only:** The prompt MUST be a set of 1-2 paragraphs of natural language guidance (steering prompt), NOT a structured or bulleted script.
    -   **Focus:** Emphasize the "Prisma style": technical depth, professional debate between two experts, and real-world implications.
    -   **Constraints:** Include explicit instructions to avoid mentioning "Prisma" as a tool and to use the specific names of key figures/technologies from the article.
2.  **Request Spotify URLs:** After providing the NotebookLM prompt, explicitly ask the user for the Spotify URLs to complete the integration. Do not ask for cleanup until URLs are provided and updated.

## Step 7: Finalization (User Approval Required)
1.  **Podcast Update:** Once the user provides Spotify URLs, update the `podcasts` object in the corresponding `articles.json` entry.
2.  **Cleanup:** Only after the user confirms that the article is perfect AND the Spotify links are working, delete all files inside the `draft/` folder and any redundant temporary assets.

---

### 📦 Mandatory Deliverables (Final Report)
Every time this workflow is executed, the agent **MUST** include:
1.  **NotebookLM Prompt:** The specific text to be used in the "Customize" field of NotebookLM.
2.  **Verification Links:** Local links to the new `.md` files and the interactive dashboard.
3.  **Visual Confirmation:** Embed the generated Hero image and one Spotify cover.

