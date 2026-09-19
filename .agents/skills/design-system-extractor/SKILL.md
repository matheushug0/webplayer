---
name: design-system-extractor
description: Extracts a complete, detailed design system (colors, typography, spacing, radii, shadows, borders, breakpoints, grid, motion, z-index, icons, and components) from front-end code already extracted from a page — typically an index.html plus an /assets folder with CSS, JS, fonts, and images. Use this skill whenever the user asks to "extract the design system," "document the visual tokens," "create a style guide from the site," "clone the look/identity" of a page, "generate design tokens" from HTML/CSS/JS, or provides an index.html + assets asking to understand/replicate the visual pattern. It also applies when the user already has a page's files (downloaded, exported, or scraped) and wants a structured report of the visual system, even without literally using the term "design system."
---

# Design System Extractor from Page Code

## Goal

Given the source code of a page (typically `index.html` + an `/assets` folder with CSS, JS, fonts, and images), produce a **complete, structured, and reusable design system**: color palette, typography, spacing, border radii, shadows, borders, breakpoints/grid, motion, z-index, icons/assets, and the component catalog with its variants and states.

The result is not a loose description of the look — it is an **evidence-based extraction**, built from the actual values present in the code, with usage frequency and grouping into scales, rather than subjective impressions like "looks corporate blue."

## When to use

Trigger this process whenever page code is available (files on disk, not just a URL) and the request involves, directly or indirectly:
- extracting/documenting a design system, style guide, design tokens, visual identity;
- understanding the visual pattern to replicate, clone, or keep consistency in new screens;
- migrating a site to a formal design system (e.g., feeding a `tailwind.config.js` or CSS variables).

If the user only has a URL (no files), first download/extract the HTML and assets before applying this process — the extraction depends on examining the real files, not just the rendered DOM.

## Process overview

1. **Inventory** — map all files and identify the styling "architecture" in use.
2. **Visual foundations (tokens)** — colors, typography, spacing, radii, shadows, borders, breakpoints/grid, motion, z-index, icons/assets.
3. **Component patterns** — how tokens combine into buttons, inputs, cards, badges, modals, etc., including variants and states.
4. **Consolidation** — produce the final Markdown report and, optionally, a machine-readable `design-tokens.json`.

Treat each phase as a filter: phase 1 decides *how* to search; phases 2–3 search and count occurrences; phase 4 organizes what remains after discarding noise (reset CSS, third-party libraries, one-off values).

---

## Phase 1 — File inventory

Recursively list `index.html` and `/assets`, and classify each file:

- **Style**: `.css`, `.scss`, `.less`, or inline CSS/`<style>` in the HTML.
- **Script**: `.js`/`.jsx`/`.ts` — may contain CSS-in-JS (styled-components, Emotion) or utility configuration (e.g., `tailwind.config.js`).
- **Fonts**: `.woff`, `.woff2`, `.ttf`, `.otf`.
- **Images/icons**: `.svg`, `.png`, `.webp`, `.avif`, `.jpg`; watch for SVG sprites (`<symbol>`) and `@2x`/`@3x` variants or `srcset`.

Also identify the styling "architecture," because it changes the extraction strategy:

| Signal found | Likely architecture | Where the real tokens live |
|---|---|---|
| Classes like `bg-blue-500`, `p-4`, `flex` in the HTML | Utility-first (Tailwind/similar) | `tailwind.config.js` in `/assets`, if present; otherwise the `:root` variables in the compiled CSS |
| Hashed classes like `sc-a1b2c3` or `css-x7y8z9` | CSS-in-JS (styled-components/Emotion) | `` styled.div` ` `` or `` css` ` `` blocks inside `.js` files |
| Hashed classes like `Button_root__ab12` | CSS Modules | The original `.module.css` files, if present |
| `--variable-name: value;` inside `:root` | Explicit design tokens via CSS Custom Properties | The `:root` block itself — the most reliable source, start here |
| Classes like `btn`, `card`, `modal` without a framework prefix | Traditional custom CSS (BEM or similar) | The selectors themselves in the CSS |

Also separate **third-party/reset CSS** (Bootstrap, normalize.css, Tailwind preflight, icon libraries) from the **site's authored CSS**. Third-party files often have a license/version header at the top, recognizable file names, or a much larger volume than the rest. They aren't part of the site's intentional design system and should be excluded from the frequency counts in the next phases (otherwise they pollute the palette and type scale with values that are framework defaults, not design decisions).

---

## Phase 2 — Foundational tokens

For each category below, the method is the same: **extract every occurrence, normalize, count frequency, and group into a scale** — don't guess. Values used many times across many different selectors are real tokens; values used only once are noise or inconsistency (document them separately, don't promote them to a token).

### 2.1 Colors

1. If a `:root` (or `[data-theme]`) block with `--variables` exists, extract it first — these are tokens the design team already named (e.g., `--color-primary`, `--gray-100`), which already reveals semantic intent.
2. Otherwise (or as a complement), search for every literal color in the authored CSS:
   ```bash
   grep -roE "#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)" assets/ | sort | uniq -c | sort -rn
   ```
3. Normalize: short hex (`#fff`) → 6-digit hex, consistent casing, `rgba()`/`hsla()` converted to hex+alpha where possible.
4. Group by hue/lightness (convert to HSL and sort) to detect scales such as `50, 100, 200 … 900` of the same base color.
5. Classify semantically by cross-referencing the property and the selector where the color appears:
   - `color` → text; `background`/`background-color` → surface; `border-color` → border; a color inside `box-shadow` → tinted shadow; gradient stops in `linear-gradient`/`radial-gradient` → gradient.
   - The selector name (`.btn-primary`, `.text-danger`, `.badge-success`, `.link`) hints at the role (primary, error, success, warning, link, neutral).
6. Look for dark-theme variants: `@media (prefers-color-scheme: dark)`, `.dark`, `[data-theme="dark"]`. Document the light/dark pair for the same token, not as isolated colors.

### 2.2 Typography

1. `@font-face` blocks: family name, source file in `/assets/fonts`, `font-weight`, `font-style`, `font-display`.
2. `<link>` tags for external fonts in the `<head>` of `index.html` (Google Fonts, Adobe Fonts, etc.).
3. Extract every `font-family` used — the full fallback stack, not just the first name.
4. Extract every distinct `font-size` (normalize to `px`, assuming `rem` = 16px × value unless the `html`/`:root` `font-size` differs — verify this explicitly). Sort them: this ordered list is the type scale. Compute the ratio between consecutive steps to check whether it follows a modular scale (e.g., 1.125, 1.2, 1.25, 1.333).
5. Extract `font-weight` (100–900 or `normal`/`bold`), `line-height`, and `letter-spacing`, always pairing them with the `font-size` they appear alongside.
6. Map combinations to semantic roles by looking at the selectors: `h1`–`h6`, `.heading-*`, `.display-*`, `.title` → heading scale; `p`, `.body-*`, `.text-*` → body; `.caption`, `.label`, `.overline`, `.small` → auxiliary text.
7. Check for "orphan" fonts: a family declared via `@font-face`/imported but never referenced in any real `font-family` — likely leftover, worth flagging in the report.

### 2.3 Spacing

1. Extract every numeric value used in `margin`, `padding`, `gap`, `top/right/bottom/left`, `inset`.
2. Normalize to `px` (using the `rem` base already verified).
3. Sort unique values and look for a consistent **base step** (e.g., everything a multiple of 4 or 8). A 4px or 8px grid is the most common signal.
4. Present it as a named scale, e.g., `4, 8, 12, 16, 24, 32, 48, 64, 96` — and list any "off-scale" value (e.g., `13px`, `22px`) separately as a possible inconsistency.

### 2.4 Border radius

Extract and dedupe every `border-radius` value. This usually resolves into a handful of levels: `0` (none), small, medium, large, and a high value (`9999px`/`50%`) for pill/circular shapes. Note when the radius varies per corner (e.g., only the top corners, common in cards with a highlighted header).

### 2.5 Shadows and elevation

1. Extract every `box-shadow` (treat multi-layer shadows — comma-separated — as a single token).
2. Group by blur/spread/offset magnitude into elevation levels: `0` none, `1` subtle (hover on a list item), `2` card, `3` dropdown/popover, `4` modal.
3. Include `filter: drop-shadow(...)` when applied to SVGs/images — this is usually a separate shadow token from `box-shadow`.

### 2.6 Borders

Extract the `border-width` and `border-style` values used — usually 1–2 thicknesses (`1px`, `2px`) and mostly `solid`, with occasional exceptions (`dashed` for uploads, `dotted` for separators).

### 2.7 Breakpoints and grid

1. Extract every `@media (min-width: …)` / `(max-width: …)` value — the sorted, deduplicated list is the site's breakpoints.
2. Extract the `max-width` of container-like selectors (`.container`, `.wrapper`, `.content`) per breakpoint.
3. Extract `grid-template-columns` and the `gap` used in containers with `display: grid`/`flex` to determine column count and gutter.

### 2.8 Motion (transitions and animations)

1. Extract `transition-duration` and `transition-timing-function` values used; group them into tiers (e.g., fast ~150ms for hover, normal ~250–300ms for open/close, slow ~400ms+ for page transitions).
2. List the distinct `@keyframes` blocks and describe what each one does (fade, slide, scale, spin, shake, etc.) and where it's applied.

### 2.9 Z-index

Extract every `z-index` value used, sort them, and try to map each range to a layering role (normal content, sticky header, dropdown, modal overlay, toast/notification, tooltip). Disorganized z-index (arbitrary values like `9999999`) is common and should be flagged as an observation, not silently normalized.

### 2.10 Icons and visual assets

1. Inventory `/assets`: individual SVG icons vs. a sprite (`<symbol>`/`<use>`), image formats used (`png`/`webp`/`avif`/`jpg`), presence of resolution variants (`@2x`, `@3x`, `srcset`), and logo files.
2. Determine the standard icon size (e.g., `16px`, `20px`, `24px`) and, for outline icons, the stroke width (`stroke-width`).
3. If there are clear clues pointing to a specific icon library (file names, comments, a characteristic `viewBox` structure), mention it — but avoid asserting a brand/license with certainty when the evidence is ambiguous.

---

## Phase 3 — Component patterns

1. Scan `index.html` (and any templates/JS that generate HTML) for recurring class combinations: buttons (`.btn`, `.button`), form inputs (`.input`, `.form-control`, `.field`), cards (`.card`), badges/tags (`.badge`, `.tag`, `.chip`), alerts (`.alert-*`), modals/dialogs (`.modal`, `.dialog`), navigation (`.nav`, `.navbar`), tables.
2. For each identified component, extract:
   - **Base**: padding, border-radius, typography, background/text/border color in the default state.
   - **Variants**: suffixes like `-primary`, `-secondary`, `-outline`, `-ghost`, `-danger`.
   - **States**: `:hover`, `:focus`/`:focus-visible`, `:active`, `:disabled`, `[aria-invalid]` — extract the exact declarations that change in each state.
   - **Sizes**: `-sm`, `-md`, `-lg`, or explicit size classes.
3. Document each component as a table: `property | default | hover | focus | disabled`, referencing the Phase 2 tokens instead of repeating raw values (e.g., "uses `--color-primary-600`" instead of "uses `#1d4ed8`").

---

## Phase 4 — Consolidation and output format

Produce **two deliverables**:

### 4.1 Markdown report (primary)

Required structure for the final report:

```markdown
# Design System — [Project Name]

## 1. Summary and styling architecture
(utility-first / CSS-in-JS / custom CSS / hybrid, and what that implies)

## 2. Colors
### 2.1 Primitive palette (table: token | hex | most common use | count)
### 2.2 Semantic colors (primary, success, error, warning, neutral, text, surface, border)
### 2.3 Dark mode (if present, table of light/dark pairs)

## 3. Typography
### 3.1 Families and fallbacks
### 3.2 Size scale (table: level | px/rem | usage | line-height | weight)
### 3.3 Weights and styles

## 4. Spacing
(table: token | value | multiples observed)

## 5. Border radius

## 6. Shadows / elevation

## 7. Borders

## 8. Breakpoints and grid

## 9. Motion (transitions and animations)

## 10. Z-index

## 11. Icons and assets

## 12. Components
(one subsection per component, with a states/variants table)

## 13. Observed inconsistencies
(off-scale values, orphan colors/fonts, arbitrary z-index, etc. — useful as design debt to resolve)
```

Rules for filling in this template:
- Every color mentioned is shown with its hex value **and** occurrence count (evidence, not opinion).
- No section is left empty without explanation — if there's no dark mode, say "not found in the analyzed code" instead of omitting the section.
- Section 13 is mandatory: a design system extracted from real code almost always has some inconsistency, and hiding it reduces the report's value for whoever uses it.

### 4.2 `design-tokens.json` (optional, generate when the use case is technical — e.g., feeding Tailwind, Style Dictionary, or CSS custom properties)

Recommended structure:

```json
{
  "color": {
    "primary": { "50": "#eff6ff", "500": "#3b82f6", "900": "#1e3a8a" },
    "neutral": { "0": "#ffffff", "100": "#f5f5f5", "900": "#171717" },
    "semantic": { "success": "#16a34a", "danger": "#dc2626", "warning": "#d97706" }
  },
  "typography": {
    "fontFamily": { "sans": "Inter, system-ui, sans-serif" },
    "fontSize": { "xs": "12px", "sm": "14px", "base": "16px", "lg": "18px", "xl": "24px" },
    "fontWeight": { "regular": 400, "medium": 500, "bold": 700 },
    "lineHeight": { "tight": 1.2, "normal": 1.5, "loose": 1.75 }
  },
  "space": { "1": "4px", "2": "8px", "3": "12px", "4": "16px", "6": "24px", "8": "32px" },
  "radius": { "sm": "4px", "md": "8px", "lg": "16px", "full": "9999px" },
  "shadow": { "sm": "0 1px 2px rgba(0,0,0,.05)", "md": "0 4px 6px rgba(0,0,0,.1)" },
  "breakpoint": { "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px" },
  "motion": { "fast": "150ms", "normal": "250ms", "easing": "cubic-bezier(0.4,0,0.2,1)" },
  "zIndex": { "dropdown": 1000, "sticky": 1100, "modal": 1300, "toast": 1400 }
}
```

Adjust level names to match the scales actually found — don't force a value to exist just because the template suggests it.

---

## Useful tools and commands

Minified CSS (no line breaks) makes grep-based extraction much harder. Before analyzing, reformat it:

```bash
npx prettier --write "assets/**/*.css"
```

Quick extraction commands (adjust paths per the Phase 1 inventory):

```bash
# Colors, by frequency
grep -roE "#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)" assets/ | sort | uniq -c | sort -rn

# Font sizes
grep -roE "font-size:\s*[0-9.]+(px|rem|em)" assets/ | sort | uniq -c | sort -rn

# Spacing
grep -roE "(margin|padding|gap):\s*[0-9.]+(px|rem|em)" assets/ | sort | uniq -c | sort -rn

# Shadows
grep -roE "box-shadow:[^;]+;" assets/ | sort | uniq -c | sort -rn

# Breakpoints
grep -roE "@media[^{]+" assets/ | sort | uniq -c | sort -rn

# Transitions
grep -roE "transition[^:]*:\s*[^;]+;" assets/ | sort | uniq -c | sort -rn
```

For CSS-in-JS sites, the commands above should target the `.js` files instead of `.css`, and the search should look for `` styled.<tag>`...` `` or `` css`...` `` blocks.

For utility-first sites (Tailwind), first look for `tailwind.config.js`/`tailwind.config.ts` inside `/assets` — if it exists, the `theme`/`theme.extend` section **is** the declared design system, and should be prioritized over regex-based inference. Still, check for arbitrary-value classes in the HTML (e.g., `bg-[#1a2b3c]`, `p-[13px]`) — these are deviations from the official theme and should go into the "Observed inconsistencies" section.

For more robust extraction than plain regex (minified CSS with complex selectors, chained `var()`, nested media queries), prefer an AST parser:
- Node: `postcss` + `postcss-values-parser`.
- Python: `tinycss2`.

This avoids false positives (e.g., capturing a hex value inside a comment or an unrelated string).

---

## Common pitfalls

- **Third-party CSS contaminating the count**: always exclude reset/framework CSS before counting frequency (Phase 1). If not excluded, the detected "primary color" might just be Bootstrap's default, not a team decision.
- **`rem` with a base other than 16px**: check the `html`/`:root` `font-size` before converting any `rem` to `px` — a project with a `62.5%` (10px) base changes every scale calculation.
- **One-off values mistakenly promoted to tokens**: a value that appears only once isn't a scale, it's an exception. Document it in the inconsistencies section, not in the main palette.
- **CSS-in-JS with dynamic styles via JS** (e.g., a color coming from a prop): the color may not appear literally in the static CSS/JS — also check theme objects (`theme.js`, `theme.ts`) imported by components.
- **Fonts loaded but unused** and **colors declared in `:root` but never referenced**: worth mentioning as code residue, useful for anyone cleaning up the project.
- **Partial dark mode**: not every token has a dark-theme counterpart — don't invent the missing pair, note "no dark variant defined" when that's the case.

---

## Final checklist before delivering

- [ ] Every color in the report has a normalized hex value + usage count.
- [ ] The type scale is sorted and the ratio between steps has been checked.
- [ ] The spacing scale states the base step (4px/8px/other) and lists exceptions.
- [ ] Shadows and z-index are grouped into named levels, not just listed raw.
- [ ] At least the most common components (button, input, card) have a states table.
- [ ] The "Observed inconsistencies" section has been filled in (or explicitly marked "none found").
- [ ] If relevant to the use case, `design-tokens.json` was generated and is consistent with the Markdown report.