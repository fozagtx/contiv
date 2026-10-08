import * as React from 'react'
import { cn } from 'cn'

export type CaptionStyle = 'highlight' | 'classic' | 'karaoke' | 'boxed'

export const CAPTION_STYLES: {
  id: CaptionStyle
  name: string
  note: string
}[] = [
  { id: 'highlight', name: 'Word highlight', note: 'One word pops at a time' },
  { id: 'classic', name: 'Classic subtitles', note: 'A phrase at a time' },
  { id: 'karaoke', name: 'Karaoke fill', note: 'Words fill as spoken' },
  { id: 'boxed', name: 'Boxed', note: 'Text on a dark box' },
]

function StyleSwatch({ style, color }: { style: CaptionStyle; color: string }) {
  const words = 'your words show up here'.split(' ')
  const base =
    'flex aspect-video w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-zinc-950 px-2'
  if (style === 'highlight') {
    return (
      <div className={base}>
        <p className="text-center text-[9px] font-extrabold uppercase tracking-wide text-white">
          {words.map((w, i) => (
            <span key={i} style={i === 1 ? { color } : undefined}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    )
  }
  if (style === 'classic') {
    return (
      <div className={base}>
        <p
          className="text-center text-[9px] text-white"
          style={{
            textShadow:
              '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000',
          }}
        >
          your words show up here
        </p>
      </div>
    )
  }
  if (style === 'karaoke') {
    return (
      <div className={base}>
        <p className="text-center text-[9px] font-extrabold uppercase tracking-wide">
          <span style={{ color }}>your words</span>{' '}
          <span className="text-white">show up here</span>
        </p>
      </div>
    )
  }
  return (
    <div className={base}>
      <p className="rounded bg-black/80 px-2 py-1 text-center text-[9px] text-white">
        your words show up here
      </p>
    </div>
  )
}

export function CaptionStylePicker({
  value,
  onChange,
  highlightColor,
}: {
  value: CaptionStyle
  onChange: (v: CaptionStyle) => void
  highlightColor: string
}) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    const ids = CAPTION_STYLES.map((s) => s.id)
    const i = ids.indexOf(value)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(ids[(i + 1) % ids.length])
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(ids[(i - 1 + ids.length) % ids.length])
    }
  }
  return (
    <div
      role="radiogroup"
      aria-label="Caption style"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      onKeyDown={onKeyDown}
    >
      {CAPTION_STYLES.map((s) => (
        <label
          key={s.id}
          className={cn(
            'style-card u-lift card-press relative flex cursor-pointer items-center gap-3 rounded-lg border p-2.5',
            value === s.id
              ? 'is-selected border-primary bg-primary/10 ring-2 ring-primary'
              : 'border-border bg-muted/40 hover:bg-muted/70',
          )}
        >
          <input
            type="radio"
            name="caption-style"
            value={s.id}
            checked={value === s.id}
            onChange={() => onChange(s.id)}
            className="sr-only"
          />
          <StyleSwatch style={s.id} color={highlightColor} />
          <div className="min-w-0">
            <p className="text-sm font-medium">{s.name}</p>
            <p className="text-xs text-muted-foreground">{s.note}</p>
          </div>
        </label>
      ))}
    </div>
  )
}
