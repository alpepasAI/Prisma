---
description: Detailed guidelines for integrating complex interactive HTML drafts into the PRISMA dashboard system with full design fidelity.
---

# 📊 Workflow: Interactive Dashboard Integration

This workflow provides specific technical steps to ensure an interactive HTML draft is correctly mapped into the PRISMA JSON format while maintaining high visual quality and dark-mode compatibility.

## Step 1: HTML to JSON Mapping
1.  **Extract Verbatim HTML:** Copy the contents of each major `<section>` from the draft HTML. 
2.  **Section IDs:** Map the draft's section IDs to the `sections` object in the JSON file.
3.  **Replace Tailwind with Native PRISMA Classes:** 
    - The dashboard NO LONGER uses Tailwind. 
    - Replace colors like `bg-white`, `bg-amber-50`, `text-stone-700` with native semantic classes: `interactive-box`, `text-on-surface`, `text-on-surface-variant`.
    - Use `box-warning`, `box-error`, `box-success` for alert containers.
4.  **Layout Translation (Grid vs Flex):**
    - Avoid using `.interactive-grid` if the columns have specific unequal widths (e.g., `w-1/4` and `w-3/4`). `.interactive-grid` forces `1fr 1fr` columns.
    - Instead, use `.flex.flex-col.lg:flex-row.gap-6` to allow children with `lg:w-1/4` and `lg:w-3/4` to size themselves correctly without squishing.
5.  **JSON Metadata:** 
    - Set `theme: "stone"` for technical/architectural articles.
    - Map the `nav` labels to the section headings.
    - Map `chartData` manually by extracting values from the draft's `<script>` section.

## Step 2: JavaScript State & Logic (interactive.js)
1.  **No Hardcoded Tailwind:** When toggling classes via JS (e.g., switching tabs), NEVER hardcode Tailwind color classes (like `text-amber-900` or `bg-white`). Always use PRISMA's semantic CSS variables to ensure dark mode fidelity (e.g., `interactive-box`, `tab-active`).
2.  **Chart Initialization:** Check the `initInteractiveCharts()` function. Ensure that the `<canvas id="yourChartId">` defined in the JSON is EXPLICITLY initialized in `interactive.js`. Do not assume charts will auto-render; add missing IDs to the arrays inside `initInteractiveCharts()`.

## Step 3: Chart.js Dark Mode Configuration
Default Chart.js settings are for light mode. You MUST respect the global defaults set in `js/interactive.js`:
1.  **Instance Config:** Explicitly set the following for each new chart:
    ```javascript
    scales: { 
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a8a29e' } },
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
