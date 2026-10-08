# DESIGN.md

Design contract for this project. Written by design-promax. Agents read this first; do not re-ask the theme while this file exists.

## Theme
- HeroUI Pro theme: Glass
- data-theme: glass-light / glass-dark
- CSS: themes.css copied to src/styles/themes.css; set data-theme on <html> (src/routes/__root.tsx uses glass-light)
- Style preset: clean_product
- Routes: / (single page, clean_product)

## Colors
- Primary: #0F8A52 (HeroUI primary token override in src/hero.ts, full 50-900 green scale)
- Background: glass-light body gradient in themes.css (never override body with a solid color)
- Foreground: HeroUI foreground token
- Semantic: success / warning / danger from HeroUI tokens; never raw Tailwind colors (bg-gray-100 etc.)

## Typography
- Display: Inter (Variable)  Body: Inter (Variable)  Mono: ui-monospace
- Numbers: tabular-nums in any column; mono for ids, durations, file sizes

## Spacing and shape
- Page: px-4 py-8 sm:px-6 sm:py-12, max-w-3xl mx-auto
- Card: p-5, backdrop-blur-xl bg-content1/60, border border-white/20, rounded-large
- Gap: gap-6 between cards, gap-4 inside cards
- Chips and segmented controls: rounded-full
- Borders and shadows: border-white/20, glass shadow from themes.css

## Icons
- @iconify/react. Primary family: solar (bold / bold-duotone for tiles, linear for secondary). Fallback: lucide via iconify.
- In use: solar:videocamera-record-bold, solar:gallery-bold, solar:music-note-bold, solar:download-minimalistic-linear, solar:text-bold, solar:danger-triangle-bold, solar:check-circle-bold, solar:refresh-linear

## Component states
- hover: bg-content1/70  pressed: bg-content1/80  focus: ring-2 ring-primary/60
- disabled: opacity-40 backdrop-blur-none  selected: bg-primary/15 border-primary/40
- Every list / form has empty, loading, error states as cards or rows (never a blank area)

## Motion
- Tokens: motion/_root.css copied to src/styles/motion.css; reference var(--duration-*), var(--ease-*), var(--distance-*)
- Open is slower than close. Respect prefers-reduced-motion (guards kept in motion.css).
- Moments on this project: text-states-swap (status during processing), success-check (video ready), error-state-shake (validation and job errors)
- Rare UI atoms allowed here: none

## Button matrix
- Primary CTA: color="primary" radius="full" size="lg" + bold solar icon
- Secondary: variant="bordered" radius="full" size="sm" + linear icon
- Danger: color="danger" variant="flat" radius="full" size="sm"
- Ghost: variant="light" radius="full" size="sm"

## Copy
- Human product language. No eng jargon in UI.
- No em dashes. Sentence case. Buttons are verbs.

## Hard bans
- Second Connect button; logo subtitle; gradient-clipped hero text; <br /> that leaves three leftover words
- Fake metrics, fake ACME footer, invented cards, radius-full in dense surfaces
