# Design System Strategy: The Synthesized Space

## 1. Overview & Creative North Star
**Creative North Star: "The Neon Library"**

This design system is built to bridge the gap between rigorous technical documentation and the high-energy pulse of Artificial Intelligence. Unlike standard tech blogs that rely on sterile, boxed-in layouts, this system adopts an **Editorial Tech** aesthetic. 

The "Synthesized Space" vision moves away from traditional grid rigidity. We treat the interface as a dark digital canvas where light and depth define the structure. By utilizing intentional asymmetry, oversized typography scales, and tonal layering, we create an experience that feels like a premium digital publication rather than a generic CMS template. It is "striking" through its use of vibrant accents but "not excessive" because those accents are anchored by a sophisticated, deep-slate foundation.

---

## 2. Colors
Our palette is rooted in the contrast between deep obsidian voids and luminous digital energy.

### The Foundation
*   **Background (`#0b1326`):** The canvas. This deep slate provides the high-contrast base necessary for the neon accents to "pop" without straining the eyes.
*   **Surface Tiers:** We use `surface-container-lowest` through `highest` to define importance.

### The Accents
*   **Primary (`#4cd7f6`):** Our "Cyan Spark." Used for the most critical actions and primary brand moments.
*   **Secondary (`#d0bcff`):** Our "Electric Orchid." Used for AI-specific features or secondary highlights.
*   **Tertiary (`#4edea3`):** Our "Code Emerald." Used for success states, code block accents, and growth metrics.

### Signature Rules
*   **The "No-Line" Rule:** We do not use 1px solid borders to separate sections. Sectioning is achieved through background shifts. For example, a `surface-container-low` section should sit directly against a `surface` background to create a clean, modern break.
*   **The "Glass & Gradient" Rule:** Primary CTAs and floating headers should utilize a subtle linear gradient (from `primary` to `primary_container`) with a `backdrop-blur` (12px–20px) to simulate frosted glass. This adds "soul" and depth that flat hex codes cannot provide.
*   **Nesting Depth:** Always nest surfaces. A card should be one tier "higher" (brighter) than the section it sits on. 

---

## 3. Typography
We use a high-contrast typographic pairing to signal both "The Human Element" (Inter) and "The Machine Intellect" (Space Grotesk).

*   **Display & Headlines (Space Grotesk):** This is our "Technical Bold" voice. Use `display-lg` for hero headlines with tight letter-spacing (-2%) to create an authoritative, editorial feel.
*   **Body & Labels (Inter):** The workhorse. Inter provides maximum readability for long-form programming tutorials. Use `body-lg` for article content with a generous line-height (1.6) to ensure the technical density of AI topics remains digestible.
*   **The Technical Shift:** Use `label-md` for metadata like "Reading Time" or "Language Selection," set in all caps with a tracking boost (+5%) to provide a modern, data-driven feel.

---

## 4. Elevation & Depth
In this system, depth is a function of light, not lines.

*   **Tonal Layering:** Avoid shadows for static elements. Instead, place a `surface-container-highest` card on a `surface-container-low` background. The shift in brightness naturally "lifts" the element.
*   **Ambient Shadows:** For floating elements (Modals, Hovered Cards), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(6, 14, 32, 0.4)`. The shadow color must be a dark tint of the background, never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use the `outline_variant` at **15% opacity**. This creates a "hint" of a border that guides the eye without cluttering the UI.
*   **Interactive Glass:** Navigation bars and language switchers should use a semi-transparent `surface` color with a `backdrop-filter: blur(10px)`. This integrates the UI into the content flowing beneath it.

---

## 5. Components

### Language Switcher (Spanish/English)
*   **Style:** A "Glass Pill" design.
*   **Execution:** A container using `surface-container-high` at 60% opacity with a blur. Use `label-md` for the text. The active language is highlighted with a `primary` glow or a subtle `surface-bright` background shift.

### Buttons
*   **Primary:** Linear gradient from `primary` to `primary_container`. No border. White or `on-primary` text.
*   **Secondary:** `surface-container-high` background with a `primary` "Ghost Border" (20% opacity).
*   **Tertiary:** Text-only with a 2px `primary` underline that expands on hover.

### Cards & Article Lists
*   **Prohibition:** Never use divider lines between list items. 
*   **Execution:** Use the `Spacing Scale` (vertical padding of 2rem+) to create separation. Use a `surface-variant` background on hover to indicate interactivity.
*   **Accents:** Use a 4px vertical "accent bar" of `secondary` or `tertiary` on the left side of featured cards to categorize content (e.g., Purple for AI, Green for Code).

### Code Blocks
*   **Background:** `surface-container-lowest` (the darkest tier).
*   **Detail:** A thin `tertiary` (Emerald) top border to signify "Code." Use `on-surface-variant` for comments and `primary` for keywords.

---

## 6. Do's and Don'ts

### Do
*   **DO** use ample white/dark space. Technical content needs room to breathe.
*   **DO** use `Space Grotesk` for numbers and data points to emphasize the tech-focus.
*   **DO** apply a subtle `primary` glow (inner-shadow) to active input fields.
*   **DO** use the `roundedness.xl` (0.75rem) for main containers to soften the "brutalist" edge of the dark theme.

### Don't
*   **DON'T** use 100% opaque borders. They break the immersive "neon library" feel.
*   **DON'T** use pure black (`#000000`). It creates "smearing" on OLED screens and feels unrefined. Stick to the `surface` palette.
*   **DON'T** use traditional drop shadows on cards. Use tonal shifts instead.
*   **DON'T** clutter the navigation. The language switcher and search should be the only persistent utility icons.

---

## 7. Branding & Assets

The visual identity of PRISMA is centered around the concept of a glass prism refracting digital light, symbolizing the clarity and depth we bring to technical topics.

### 🏛️ Master Logo
*   **Path:** `assets/sources/master-logo.png`
*   **Role:** This is the **definitive source of truth** for the PRISMA brand. It is a high-resolution version containing the complete prism design, light refraction rays, and the brand name in custom typography. 
*   **Usage:** Never used directly in the web UI. It should be used to derive all other assets.

### 📱 App Icon (Apple Touch Icon)
*   **Path:** `assets/logo.png`
*   **Role:** High-fidelity icon for mobile home screens and social media sharing (OG:Image).
*   **Detail:** A direct copy of the master logo, optimized for 180x180 display.

### 🌐 Favicon
*   **Path:** `assets/favicon.png`
*   **Role:** Browser tab icon.
*   **Design:** A simplified, high-contrast version of the prism without text. This ensures brand recognition at minimal sizes (16x16 to 32x32).