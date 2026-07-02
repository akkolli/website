# Apple II Interface Theme

## Target

The site should feel like a black-and-white Apple II desktop interface rendered on a CRT, not a modern terminal and not a normal blog with a monospace font. The visual language is based on low-resolution desktop UI: black outlines, gray dither fills, compact list rows, square controls, and high-contrast pixel-like text. Keep it minimal: do not add fake menus, fake window controls, decorative title bars, icons, or OS chrome unless they directly serve the content.

## Reference Traits

- **Desktop surface:** medium gray dithered background, not a flat white or black page.
- **Content panels:** white rectangular content areas with hard black borders, square corners, and no shadows or blur.
- **No fake chrome:** avoid menu bars, title bars, desktop icons, and inactive controls. Use Apple II constraints, not Apple II decoration.
- **Controls:** checkboxes, buttons, and tag filters should be square, black-and-white, and visibly low resolution.
- **Cursor:** use small raster PNG cursor assets for the page pointer and interactive hand state; avoid SVG cursors because Safari may rasterize them badly.
- **Typography:** use the bundled `VT323` bitmap-style webfont for headings and title-like labels only. Body text, dates, tags, controls, captions, and code should use a sharper monospace so small text does not wash out.
- **Color:** black, white, and gray only. No green phosphor, amber phosphor, gradients, or colorful accents.
- **Resolution:** layout should use coarse units, hard edges, and visible dither patterns so it reads as low-res.
- **CRT:** apply one consistent screen overlay across the whole site: scanlines, slight vignette, and pixel grid. Do not apply separate unrelated glows to individual elements.
- **Figures:** technical figures and plots must stay legible. The theme should protect figures with a clear panel, border, and caption treatment, but should not require hand-tuning individual SVGs.
- **Math:** math can keep its own rendering. Do not force KaTeX into a fake bitmap style if that reduces clarity.

## Theme Modes

- `displayMode: "crt"` is the default: gray dither desktop, subtle scanlines, slight vignette.
- `displayMode: "clean"` keeps the monochrome interface but removes dither and CRT overlay.
- `displayMode: "plain"` is the least styled reading/printing baseline.
- `density: "compact"` is the default low-res layout.
- `density: "comfortable"` increases panel padding, section gaps, and row spacing without changing the component language.

## Home Page Rules

- The whole home page sits inside one primary content panel.
- The intro is the top content region, not a giant hero.
- Posts are a Finder-style list: date column, title column, inline tags.
- Post tags appear inline next to post titles as compact metadata. There is no separate tag filter panel on the home page.
- Tag toggles are real square checkboxes with on/off state.
- Spacing is compact, but rows must not collide or wrap dates.

## Post Page Rules

- A post page uses one primary document panel.
- The post title and date live in the document panel.
- The table of contents is a compact fixed side panel in the left margin on wide screens, outside the bordered article box.
- Code blocks use bordered listing panels with compact title strips and light code fields, not large black slabs.
- Inline code uses hard recessed rectangular boxes.
- Figures use a protected light paper panel with no CRT shadow inside.

## Component Rules

- **Links:** no underline by default; hover and keyboard focus invert black/white.
- **Inline code:** recessed monochrome field treatment, never a soft rounded badge.
- **Code blocks:** monochrome program-listing panel with square border, a compact title strip, readable text size, and no colored syntax requirement.
- **Tables:** square outer border and strong horizontal rules so rows survive the CRT treatment.
- **Sidenotes:** high-contrast text with coarse superscript markers; mobile fallback uses a square bordered panel.
- **TOC:** compact bordered navigation panel with a Macintosh-style striped title strip, tight rows, subordinate nested headings, and inverted active state.
- **Tags:** compact inline metadata next to post titles; do not render a separate tag filter box.
- **Captions:** larger, darker, and heavier than normal modern captions so they do not wash out.
- **Blockquotes:** square bordered callout panel, not a thin modern quote line.

## Implementation Notes

- `VT323` is bundled from Google Fonts under the SIL Open Font License 1.1; keep its license at `static/licenses/VT323-OFL.txt`, but do not make it the global body font.
- Use CSS variables for theme colors and dither patterns.
- Use `image-rendering: pixelated`, square corners, and `-webkit-font-smoothing: none` where useful.
- CRT overlay belongs in one common CSS layer, not scattered across unrelated components.
- Honor reduced-transparency, increased-contrast, and print contexts by removing the CRT/dither layer.
- Avoid modern UI motifs: rounded cards, soft shadows, gradients, glass, pill tags, or animated decoration.
- Keep the design readable first; the Apple II treatment should constrain the UI, not make the content hard to scan.
