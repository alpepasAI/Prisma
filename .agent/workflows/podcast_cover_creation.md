---
description: Guidelines for generating and composing thematic visual assets (Hero images and Spotify covers) for PRISMA articles.
---

# 🎨 Workflow: Visual Assets & Podcast Covers

This workflow ensures every article has high-quality branded assets for both the web and external podcast platforms.

## Step 1: Thematic Image Generation
1.  **Analyze Article:** Identify the core technical concept.
2.  **Generate Base Assets:**
    -   **Square Base (1:1):** Generate a 1024x1024 (or higher) square image with the "Neon Library" aesthetic. Use it as the source for podcast covers.
    -   **Hero Image (21:9):** Generate a cinematic ultra-wide (21:9) landscape version of the same theme for the web article header.
3.  **No Text:** Ensure neither image contains AI-generated text.

## Step 2: Processing & Branding
1.  **Hero Image (Web):**
    -   Use `fix_hero_crop_v2.py` to remove any blurred bars (letterboxing) and resize to **3000x1285px**.
    -   Save to `assets/covers/[ID]-hero.png`.
2.  **Spotify Covers (Branded):**
    -   Use `generate_branded_squares.py` to process the Square Base.
    -   **Output:** 4 branded versions (ES, ES-Breve, EN, EN-Short) at **3000x3000px**.
    -   **Logo Size:** Ensure logos (Alpepas Labs & PRISMA) are prominent (approx. 90% of the bottom bar height).
    -   **Labels:** Use "BREVE" for Spanish and "SHORT" for English versions.

## Step 3: Organization & Deployment
1.  **Spotify Folder:** Move all podcast-specific assets (branded covers and the square base) to `assets/spotify/[ID_NUMBER]/`.
2.  **Markdown Integration:**
    -   Embed the Hero Image at the top of the article Markdowns.
    -   Format: `![Description](assets/covers/[ID]-hero.png)`
    -   Ensure the main title uses H1 (`#`) for proper hierarchy.

## Step 4: Storage Strategy
-   High-resolution assets (3000px+) are stored in the repository for completeness.
-   Monitor repository size. If it grows excessively, consider moving the `assets/spotify/` folder to `.gitignore`.
