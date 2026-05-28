# 📝 PRISMA Content Submission Template

Drop your files into the `draft/` folder and send this template to the agent to start the integration.

## 1. Assets in `draft/` folder
Please ensure these files are present in the `draft/` directory:

- **PDF (ES):** [Filename.pdf]
- **PDF (EN):** [Filename.pdf]
- **Markdown (ES):** [Filename.md] (Used to extract Title, Tags and content)
- **Markdown (EN):** [Filename.md]
- **Infographic (ES):** [Filename.png/jpg]
- **Infographic (EN):** [Filename.png/jpg]
- **Interactive Draft:** [interactive_article.html]

## 2. Podcast Links (Optional at this stage)
*Note: You can provide these later. The agent will use placeholders if missing.*

- **ES Short:** [Spotify URL]
- **ES Normal:** [Spotify URL]
- **EN Short:** [Spotify URL]
- **EN Normal:** [Spotify URL]

---

## 🖥️ Interactive Dashboard Notes (if `interactive.html` is present)

> [!IMPORTANT]
> Before processing the interactive dashboard, the agent **must** read `draft/interactive.html` in its entirety — including all `<section>` blocks and the `<script>` section — before writing any JSON or JS code.
> The correct integration strategy is documented in `.agent/workflows/interactive_dashboard_integration.md`.

Key points to verify before and after integration:

- **Custom JS logic:** List all interactive functions found in `<script>` and confirm they are re-implemented in `js/interactive.js`.
  - *Example: `switchTab()`, `updateChart()`, slider `input` event, etc.*
- **Chart datasets:** Document the exact number of datasets. **Do not simplify** — replicate them all.
- **Element IDs used by JS:** List every `id="..."` referenced by the script block (e.g. chart canvas IDs, slider IDs, panel IDs).
- **Grid layouts:** Note any responsive grid column rules (e.g., `1fr 1fr` at ≥900px) and the CSS class name to add to `styles.css`.
- **Color adaptation:** Replace `bg-white`/light backgrounds with `var(--surface-container-low)`; replace light text classes with `var(--on-surface)`. Keep all layout styles (padding, margin, border-radius, flex/grid) identical to the draft.

## 🚀 Execution
**Agent:** Please execute the `article_integration` workflow located in `.agent/workflows/article_integration.md` using the assets provided above.
