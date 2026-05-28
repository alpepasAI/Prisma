---
description: Detailed guidelines for integrating complex interactive HTML drafts into the PRISMA dashboard system with full design fidelity.
---

# 📊 Workflow: Interactive Dashboard Integration

> [!NOTE]
> **Agentic Engineering Context:** LLMs often struggle with spatial visualization and CSS layout matching, which can lead to UI regressions. This workflow is designed as a safety guardrail. It forbids the agent from "reinterpreting" layouts and instead forces a verbatim HTML migration with targeted color mapping via CSS custom variables. This ensures 100% design fidelity while leveraging the agent's ability to map structured data.

This workflow provides specific technical steps to ensure an interactive HTML draft is correctly mapped into the PRISMA JSON format while maintaining high visual quality and dark-mode compatibility.

> [!IMPORTANT]
> **The #1 lesson learned (article 006):** Do NOT attempt to reinterpret the draft HTML by replacing its structure with PRISMA utility classes. This causes layout regressions that are extremely hard to debug. **The correct strategy is to copy the HTML verbatim and only adapt colors/backgrounds using CSS variables.** See Step 1 below.

---

## Step 0: Read the Draft HTML Before Writing Anything

Before touching any JSON or JS file, read the **entire** `draft/interactive.html` from start to finish (all sections + the `<script>` block). Note:

1. **Layout structure** — how are the main sections laid out (grid/flex, how many columns, what proportions)?
2. **Custom JS logic** — what functions exist in the `<script>` block? What are the exact element IDs (`id="..."`) they reference?
3. **Chart.js datasets** — how many datasets does the chart have? What are the exact cost formulas or data sources?
4. **Interactive hooks** — what `onclick` / event listeners exist and which element IDs do they target?

> [!CAUTION]
> Skipping Step 0 is the root cause of dashboard regressions. Re-inventing the layout from scratch always produces an inferior, broken result.

---

## Step 1: HTML-to-JSON Mapping Strategy

### ✅ The correct approach: copy HTML inline, adapt colors only

The correct method is to **preserve the original HTML structure as-is** inside the JSON's `sections` object, making only the minimum changes needed to work with PRISMA's dark theme:

| Original Tailwind / Light-mode style | PRISMA CSS variable replacement |
|---|---|
| `background: #fafaf9` / `bg-white` | `background: var(--surface-container-low)` |
| `color: #292524` / `text-stone-800` | `color: var(--on-surface)` |
| `color: #78716c` / `text-stone-500` | `color: var(--on-surface-variant)` |
| `border-color: #e7e5e4` / `border-stone-200` | `border: 1px solid var(--outline)` |
| `background: stone-100` (sub-cards) | `background: var(--surface-container)` |

**For all other styles (layout, sizing, padding, border-radius, flex/grid), keep the original inline `style=""` attributes exactly as they are.**

### ❌ What NOT to do

Do not replace the original structure with PRISMA utility classes like:
```html
<!-- WRONG: loses layout fidelity -->
<div class="interactive-box grid grid-cols-2 gap-10">
```

The utility class system may not produce the exact proportions. Use inline styles for structural rules:
```html
<!-- CORRECT: layout-faithful -->
<div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem;" class="arch-grid">
```

If a specific responsive breakpoint is needed (e.g., 2 columns on desktop, 1 on mobile), add a dedicated CSS rule to `styles.css` using a **named class** (e.g., `.arch-grid`, `.costs-grid`) with a `@media` query. Do not rely on `lg:grid-cols-2` utility classes that may conflict.

---

## Step 2: Replicate Custom JavaScript Logic

1. **Extract all interactive functions** from the draft's `<script>` block and re-implement them in `js/interactive.js`, inside the appropriate article block.
2. **Use the exact same element IDs** as the draft HTML — do not rename them. The JS logic references these IDs directly.
3. **For Chart.js charts**, replicate:
   - The exact number of datasets (the draft may have 4 lines; do not simplify to 2).
   - The exact cost formulas or data generation functions from the draft's `<script>`.
   - The slider's scale (logarithmic vs linear), min/max, and display formatting (`Intl.NumberFormat`).
4. **chartData sentinel**: For articles with fully custom chart logic (all data computed in JS), set `"chartData": { "ragCost": true }` in the JSON. The JS will ignore the JSON data and use its own `calcRagCosts()` function.

---

## Step 3: Chart.js Dark Mode Configuration

Default Chart.js settings are for light mode. Explicitly set the following for each new chart:

```javascript
scales: {
  y: {
    beginAtZero: true,
    grid: { color: 'rgba(255,255,255,0.05)' },
    ticks: { color: '#a8a29e', callback: v => '$' + v },
    title: { display: true, text: 'Label', color: '#a8a29e' }
  },
  x: { grid: { display: false }, ticks: { color: '#a8a29e' } }
},
plugins: {
  legend: { position: 'bottom', labels: { color: '#a8a29e', padding: 20, usePointStyle: true } },
  tooltip: {
    callbacks: {
      label: ctx => ctx.dataset.label + ': ' + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(ctx.parsed.y)
    }
  }
}
```

---

## Step 4: Cache Invalidation

Whenever logic (`app.js`, `interactive.js`) or styles (`styles.css`) are modified:

1. Bump `?v=X` in **all four HTML files**: `index.html`, `article.html`, `interactive.html`, `topics.html`.
2. Bump both `css/styles.css?v=X` and `js/app.js?v=X` / `js/i18n.js?v=X` to the same number.
3. Bump `CACHE_VERSION` inside `sw.js` (e.g. `const CACHE_VERSION = 'vX';`) to match the new version, which invalidates the Service Worker cache and forces clients to reload all new assets.

---

## Step 5: Verification Checklist

- [ ] All sections match the original draft layout (run side-by-side comparison).
- [ ] Clicking interactive elements (buttons/steps) updates the content panel inline — **no `alert()` popups**.
- [ ] The chart has the same number of lines/datasets as the original draft.
- [ ] The slider updates all chart datasets in real time.
- [ ] No white or light backgrounds bleeding through the dark theme.
- [ ] All chart axes and legend labels are readable on dark backgrounds (`#a8a29e` or similar).
- [ ] Layout switches from single-column (mobile) to multi-column (desktop ≥900px) correctly.
- [ ] Both ES and EN JSON files have been updated identically (structure, only text differs).
