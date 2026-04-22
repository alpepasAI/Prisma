---
description: Detailed guidelines for integrating complex interactive HTML drafts into the PRISMA dashboard system with full design fidelity.
---

# 📊 Workflow: Interactive Dashboard Integration

This workflow provides specific technical steps to ensure an interactive HTML draft is correctly mapped into the PRISMA JSON format while maintaining high visual quality and dark-mode compatibility.

## Step 1: HTML to JSON Mapping
1.  **Extract Verbatim HTML:** Copy the contents of each major `<section>` from the draft HTML. 
2.  **Section IDs:** Map the draft's section IDs to the `sections` object in the JSON file.
3.  **Literal Content:** Do NOT summarize or change the text. Preserve all classes and specific IDs (e.g., `btn-acid`, `performanceChart`).
4.  **JSON Metadata:** 
    - Set `theme: "stone"` for technical/architectural articles.
    - Map the `nav` labels to the section headings.
    - Map `chartData` manually by extracting values from the draft's `<script>` section.

## Step 2: Dark Mode & Contrast Overrides (styles.css)
Drafts often use light backgrounds (`bg-white`, `bg-stone-50`). You MUST override these in `css/styles.css` under the `.theme-stone` selector:

1.  **Background Overrides:**
    ```css
    .theme-stone .bg-white { background-color: var(--surface) !important; }
    .theme-stone .bg-stone-50 { background-color: var(--background) !important; }
    .theme-stone .bg-stone-100 { background-color: var(--surface-dim) !important; }
    .theme-stone .bg-green-50 { background-color: #064e3b !important; border: 1px solid #10b981 !important; }
    .theme-stone .bg-red-50 { background-color: #450a0a !important; border: 1px solid #ef4444 !important; }
    ```
2.  **Text Contrast:**
    - Force stone-numeric classes (`text-stone-300`, etc.) to be light (`#d6d3d1`).
    - Ensure `strong` and `li` tags inside colored boxes are white (`#ffffff`).
    - Fix button contrast: Ensure dark text on bright buttons (e.g., `#000000` on amber).

## Step 3: Chart.js Dark Mode Configuration (app.js)
Default Chart.js settings are for light mode. You MUST update `js/app.js`:

1.  **Global Defaults:** Set `Chart.defaults.color` to a light gray and `Chart.defaults.borderColor` to a translucent white.
2.  **Instance Config:** Inside `initInteractiveCharts`, explicitly set the following for each new chart:
    ```javascript
    scales: { 
      y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a8a29e' } },
      x: { ticks: { color: '#a8a29e' } }
    },
    plugins: { legend: { labels: { color: '#f5f5f4' } } }
    ```

## Step 4: Cache Invalidation (interactive.html)
Whenever logic (`app.js`) or styles (`styles.css`) are modified for a specific article:
1.  **Bump Version:** Increment the `?v=X` parameter in `interactive.html` for BOTH the CSS and the scripts.
2.  **Sync:** Ensure `js/i18n.js` and `js/app.js` use the same version number if logic changed.

## Step 5: Verification Checklist
- [ ] Are all axes and labels visible in charts?
- [ ] Is there any white box bleeding through the dark background?
- [ ] Do tab buttons clearly show which one is active?
- [ ] Is the text in "Competitive Advantage" / "Risks" boxes bright and readable?
- [ ] Do the interactive buttons trigger the correct `pushState` or chart update?
