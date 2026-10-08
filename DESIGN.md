# DESIGN.md

Design contract for this project. Agents read this first; do not re-ask the theme while this file exists.

## Theme
- Component library: shadcn/ui, base `radix`, style preset `radix-maia` (see components.json)
- Dark mode is the default and only shipped theme: `<html class="dark">` in src/routes/__root.tsx, `<meta name="color-scheme" content="dark">`
- CSS variables: src/styles.css (`:root` light palette kept, `.dark` palette is what users see; neutral base color)
- Style preset: clean_product
- Routes: / (single page)

## Colors
- Tokens from shadcn CSS vars: background, foreground, card, muted-foreground, primary (near-white in dark), destructive, border, ring
- Semantic: use tokens only, never raw Tailwind grays

## Typography
- Display/body: Inter Variable (--font-sans). Mono: ui-monospace

## Spacing and shape
- Page: max-w-3xl mx-auto, px-4 sm:px-6 lg:px-8, py-10 sm:py-16, space-y-8 sm:space-y-10
- Cards: SectionCard (src/components/contiv/section-card.tsx), p-5 sm:p-6, header to content gap mt-5
- Control groups gap-6, label to control gap-2
- Spacing scale: 4/8/12/16/24/32/40 only
- Radius: rounded-xl media surfaces and drop zones, rounded-4xl pills (buttons, toggles) from the preset

## Components
- shadcn/ui primitives in src/components/ui: button, card, badge, toggle-group, toggle, progress, alert, separator, tooltip, skeleton
- App components in src/components/contiv: section-card, file-drop-zone, caption-style-picker, caption-options, job-progress, job-result
- Icons: @iconify/react, Solar family only

## Motion
- Tokens: src/styles/motion.css (var(--duration-*), var(--ease-*), var(--distance-*))
- CSS-first interactions in src/styles.css: dropzone drag-over + accept pop (.dz, .u-pop), style-card hover lift/press/selected ring (.u-lift, .card-press, .style-card), swatch bounce (.swatch.is-sel), button press (.u-btn), card enter (.u-enter), progress fill (.u-progress-fill), check pop (.u-checkpop), error shake (.u-shake), status text swap (.t-text-swap)
- All guarded under prefers-reduced-motion: reduce

## Copy
- Human product language. No eng jargon in UI.
- No em dashes. Sentence case. Buttons are verbs.

## Hard bans
- Logo subtitle; gradient-clipped hero text; fake metrics; fake footer; invented sections
