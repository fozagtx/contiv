import type { Word } from './transcribe'

export type CaptionStyle = 'highlight' | 'classic' | 'karaoke' | 'boxed'
export type CaptionPosition = 'bottom' | 'middle' | 'top'
export type CaptionSize = 'small' | 'medium' | 'large'

export type AssOptions = {
  style: CaptionStyle
  highlightColor: string
  position: CaptionPosition
  size: CaptionSize
}

const PLAY_W = 1920
const PLAY_H = 1080
const WHITE = '&H00FFFFFF&'
const BLACK = '&H00000000&'

/** hex #RRGGBB -> ASS &HAABBGGRR& */
function hexToAss(hex: string): string {
  const h = hex.replace('#', '')
  const r = h.slice(0, 2)
  const g = h.slice(2, 4)
  const b = h.slice(4, 6)
  return `&H00${b}${g}${r}&`.toUpperCase()
}

function fmtTime(t: number): string {
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t - h * 3600 - m * 60
  return `${h}:${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`
}

const ALIGNMENT: Record<CaptionPosition, number> = {
  bottom: 2,
  middle: 5,
  top: 8,
}

const MARGIN_V: Record<CaptionPosition, number> = {
  bottom: 120,
  middle: 0,
  top: 120,
}

const SIZES: Record<CaptionStyle, Record<CaptionSize, number>> = {
  highlight: { small: 56, medium: 72, large: 92 },
  karaoke: { small: 56, medium: 72, large: 92 },
  boxed: { small: 56, medium: 72, large: 92 },
  classic: { small: 48, medium: 60, large: 76 },
}

function escText(text: string): string {
  return text.replace(/\n/g, ' ').replace(/[{}\\]/g, '')
}

/** Group words into chunks of up to maxChunk, breaking on a gap > 0.8s */
function chunkWords(words: Word[], maxChunk: number): Word[][] {
  const chunks: Word[][] = []
  let current: Word[] = []
  for (const w of words) {
    const prev = current[current.length - 1]
    if (
      current.length >= maxChunk ||
      (prev && w.start - prev.end > 0.8)
    ) {
      if (current.length) chunks.push(current)
      current = [w]
    } else {
      current.push(w)
    }
  }
  if (current.length) chunks.push(current)
  return chunks
}

/** Group words into phrases up to ~maxChars characters, breaking on a gap > 0.8s */
function phraseWords(words: Word[], maxChars = 32): Word[][] {
  const phrases: Word[][] = []
  let current: Word[] = []
  let len = 0
  for (const w of words) {
    const prev = current[current.length - 1]
    const add = (current.length ? 1 : 0) + w.text.length
    if (
      current.length > 0 &&
      (len + add > maxChars || (prev && w.start - prev.end > 0.8))
    ) {
      phrases.push(current)
      current = [w]
      len = w.text.length
    } else {
      current.push(w)
      len += add
    }
  }
  if (current.length) phrases.push(current)
  return phrases
}

type StyleLine = {
  font: string
  size: number
  primary: string
  secondary: string
  outline: string
  back: string
  bold: number
  borderStyle: number
  outlineWidth: number
  shadow: number
}

function header(style: StyleLine, opts: AssOptions): string {
  const alignment = ALIGNMENT[opts.position]
  const marginV = MARGIN_V[opts.position]
  return `[Script Info]
ScriptType: v4.00+
PlayResX: ${PLAY_W}
PlayResY: ${PLAY_H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.font},${style.size},${style.primary},${style.secondary},${style.outline},${style.back},${style.bold},0,0,0,100,100,0,0,${style.borderStyle},${style.outlineWidth},${style.shadow},${alignment},60,60,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`
}

export function buildAss(words: Word[], opts: AssOptions): string {
  const highlight = hexToAss(opts.highlightColor)
  const size = SIZES[opts.style][opts.size]

  if (opts.style === 'highlight') {
    const style: StyleLine = {
      font: 'Inter',
      size,
      primary: WHITE,
      secondary: '&H000000FF',
      outline: BLACK,
      back: BLACK,
      bold: 1,
      borderStyle: 1,
      outlineWidth: 6,
      shadow: 2,
    }
    const events: string[] = []
    for (const chunk of chunkWords(words, 4)) {
      const chunkEnd = chunk[chunk.length - 1].end
      for (let i = 0; i < chunk.length; i++) {
        const w = chunk[i]
        const segStart = w.start
        let segEnd = i + 1 < chunk.length ? chunk[i + 1].start : chunkEnd
        if (segEnd <= segStart) segEnd = segStart + 0.05
        const parts = chunk.map((ww, j) => {
          const text = escText(ww.text).toUpperCase()
          return j === i
            ? `{\\c${highlight}}${text}{\\c${WHITE}}`
            : text
        })
        events.push(
          `Dialogue: 0,${fmtTime(segStart)},${fmtTime(segEnd)},Default,,0,0,0,,${parts.join(' ')}`,
        )
      }
    }
    return header(style, opts) + events.join('\n') + '\n'
  }

  if (opts.style === 'karaoke') {
    const style: StyleLine = {
      font: 'Inter',
      size,
      primary: highlight,
      secondary: WHITE,
      outline: BLACK,
      back: BLACK,
      bold: 1,
      borderStyle: 1,
      outlineWidth: 6,
      shadow: 2,
    }
    const events: string[] = []
    for (const chunk of chunkWords(words, 4)) {
      const start = chunk[0].start
      const end = chunk[chunk.length - 1].end
      const parts: string[] = []
      // leading silence inside the chunk (rare, but keeps timing honest)
      for (let i = 0; i < chunk.length; i++) {
        const w = chunk[i]
        const prevEnd = i === 0 ? start : chunk[i - 1].end
        const gap = Math.max(0, w.start - prevEnd)
        if (gap > 0.01) {
          parts.push(`{\\kf${Math.round(gap * 100)}}`)
        }
        const dur = Math.max(1, Math.round((w.end - w.start) * 100))
        parts.push(`{\\kf${dur}}${escText(w.text).toUpperCase()} `)
      }
      events.push(
        `Dialogue: 0,${fmtTime(start)},${fmtTime(end)},Default,,0,0,0,,${parts.join('').trim()}`,
      )
    }
    return header(style, opts) + events.join('\n') + '\n'
  }

  if (opts.style === 'boxed') {
    const style: StyleLine = {
      font: 'Inter',
      size,
      primary: WHITE,
      secondary: '&H000000FF',
      outline: '&H99000000&',
      back: '&H99000000&',
      bold: 1,
      borderStyle: 4,
      outlineWidth: 10,
      shadow: 0,
    }
    const events: string[] = []
    for (const phrase of phraseWords(words)) {
      const start = phrase[0].start
      const end = phrase[phrase.length - 1].end
      const text = phrase.map((w) => escText(w.text)).join(' ')
      events.push(
        `Dialogue: 0,${fmtTime(start)},${fmtTime(end)},Default,,0,0,0,,${text}`,
      )
    }
    return header(style, opts) + events.join('\n') + '\n'
  }

  // classic
  const style: StyleLine = {
    font: 'DejaVu Sans',
    size,
    primary: WHITE,
    secondary: '&H000000FF',
    outline: BLACK,
    back: BLACK,
    bold: 0,
    borderStyle: 1,
    outlineWidth: 3,
    shadow: 1,
  }
  const events: string[] = []
  for (const phrase of phraseWords(words)) {
    const start = phrase[0].start
    const end = phrase[phrase.length - 1].end
    const text = phrase.map((w) => escText(w.text)).join(' ')
    events.push(
      `Dialogue: 0,${fmtTime(start)},${fmtTime(end)},Default,,0,0,0,,${text}`,
    )
  }
  return header(style, opts) + events.join('\n') + '\n'
}
