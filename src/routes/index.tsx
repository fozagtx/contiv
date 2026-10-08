import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, CardBody, CardHeader, Chip, Progress } from '@heroui/react'
import { Icon } from '@iconify/react'
import { cn } from '@heroui/react'

export const Route = createFileRoute('/')({ component: Home })

type CaptionStyle = 'highlight' | 'classic' | 'karaoke' | 'boxed'
type Position = 'bottom' | 'middle' | 'top'
type Size = 'small' | 'medium' | 'large'
type JobStatus = 'queued' | 'transcribing' | 'rendering' | 'done' | 'error'

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFE14D' },
  { name: 'Green', value: '#39FF88' },
  { name: 'Cyan', value: '#4DE1FF' },
  { name: 'Pink', value: '#FF5CA8' },
]

const STYLES: { id: CaptionStyle; name: string; note: string }[] = [
  { id: 'highlight', name: 'Word highlight', note: 'One word pops at a time' },
  { id: 'classic', name: 'Classic subtitles', note: 'A phrase at a time' },
  { id: 'karaoke', name: 'Karaoke fill', note: 'Words fill as spoken' },
  { id: 'boxed', name: 'Boxed', note: 'Text on a dark box' },
]

const STATUS_LABEL: Record<JobStatus, string> = {
  queued: 'Uploading',
  transcribing: 'Transcribing',
  rendering: 'Rendering',
  done: 'Ready',
  error: 'Something went wrong',
}

function fileSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

function fmtSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const r = Math.round(s - m * 60)
  return `${m}:${String(r).padStart(2, '0')}`
}

/* ---------- motion helpers ---------- */

function StatusText({ text }: { text: string }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [shown, setShown] = React.useState(text)
  React.useEffect(() => {
    if (text === shown) return
    const el = ref.current
    if (!el) {
      setShown(text)
      return
    }
    el.classList.add('is-exit')
    const t = setTimeout(() => {
      setShown(text)
      el.classList.remove('is-exit')
      el.classList.add('is-enter-start')
      void el.offsetHeight
      el.classList.remove('is-enter-start')
    }, 150)
    return () => clearTimeout(t)
  }, [text, shown])
  return (
    <span ref={ref} className="t-text-swap">
      {shown}
    </span>
  )
}

function SuccessCheck() {
  return (
    <span className="t-success-check" data-state="in" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
        <circle cx="24" cy="24" r="21" fill="#0F8A52" opacity="0.15" />
        <circle cx="24" cy="24" r="16" fill="#0F8A52" />
        <path
          d="M17 24.5l4.5 4.5L31 19.5"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/* ---------- drop zones ---------- */

type ImageInfo = {
  file: File
  url: string
  width: number
  height: number
}

type AudioInfo = {
  file: File
  duration: number
}

function DropZone({
  icon,
  label,
  hint,
  accept,
  error,
  onPick,
  children,
}: {
  icon: string
  label: string
  hint: string
  accept: string
  error?: string
  onPick: (f: File) => void
  children?: React.ReactNode
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [over, setOver] = React.useState(false)
  return (
    <div className={cn('t-input-wrap', error && 'is-error')}>
      <div
        className={cn(
          't-input flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-large border-2 border-dashed border-default-300 bg-content1/40 p-4 text-center transition-colors',
          over && 'border-primary bg-primary/10',
          error && 'border-danger-300',
          error && 'is-shaking',
        )}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f) onPick(f)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onPick(f)
            e.target.value = ''
          }}
        />
        {children ?? (
          <>
            <div className="rounded-medium border border-default-200 bg-default-50 p-2">
              <Icon icon={icon} width={24} className="text-default-500" />
            </div>
            <p className="text-medium font-medium">{label}</p>
            <p className="text-small text-default-400">{hint}</p>
          </>
        )}
      </div>
      <p className="t-error-msg text-small text-danger">{error}</p>
    </div>
  )
}

/* ---------- caption style swatch ---------- */

function StyleSwatch({
  style,
  color,
}: {
  style: CaptionStyle
  color: string
}) {
  const words = 'your words show up here'.split(' ')
  const base =
    'flex aspect-video w-full items-center justify-center rounded-medium bg-zinc-900 px-3 overflow-hidden'
  if (style === 'highlight') {
    return (
      <div className={base}>
        <p className="text-center text-[11px] font-extrabold uppercase tracking-wide text-white">
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
          className="text-center text-[11px] text-white"
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
        <p className="text-center text-[11px] font-extrabold uppercase tracking-wide">
          <span style={{ color }}>your words</span>{' '}
          <span className="text-white">show up here</span>
        </p>
      </div>
    )
  }
  return (
    <div className={base}>
      <p className="rounded bg-black/80 px-2 py-1 text-center text-[11px] text-white">
        your words show up here
      </p>
    </div>
  )
}

/* ---------- page ---------- */

function Home() {
  const [image, setImage] = React.useState<ImageInfo | null>(null)
  const [imageError, setImageError] = React.useState<string>()
  const [audio, setAudio] = React.useState<AudioInfo | null>(null)
  const [audioError, setAudioError] = React.useState<string>()
  const [style, setStyle] = React.useState<CaptionStyle>('highlight')
  const [color, setColor] = React.useState('#FFE14D')
  const [position, setPosition] = React.useState<Position>('bottom')
  const [size, setSize] = React.useState<Size>('medium')
  const [job, setJob] = React.useState<{
    id: string
    status: JobStatus
    progress: number
    error?: string
  } | null>(null)
  const [submitError, setSubmitError] = React.useState<string>()

  const pollRef = React.useRef<ReturnType<typeof setInterval>>(null)

  React.useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current)
    },
    [],
  )

  const pickImage = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setImageError('That file is not an image')
      return
    }
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth < img.naturalHeight) {
        URL.revokeObjectURL(url)
        setImage(null)
        setImageError('Pick a landscape image (wider than tall)')
      } else {
        setImage({ file: f, url, width: img.naturalWidth, height: img.naturalHeight })
        setImageError(undefined)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      setImageError('Could not read that image')
    }
    img.src = url
  }

  const pickAudio = (f: File) => {
    if (!f.type.startsWith('audio/')) {
      setAudioError('That file is not an audio file')
      return
    }
    const url = URL.createObjectURL(f)
    const el = document.createElement('audio')
    el.preload = 'metadata'
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      setAudio({ file: f, duration: el.duration })
      setAudioError(undefined)
    }
    el.onerror = () => {
      URL.revokeObjectURL(url)
      setAudio({ file: f, duration: 0 })
      setAudioError(undefined)
    }
    el.src = url
  }

  const startPoll = (id: string) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`)
        if (!res.ok) return
        const j = await res.json()
        setJob(j)
        if (j.status === 'done' || j.status === 'error') {
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // keep polling
      }
    }, 1500)
  }

  const submit = async () => {
    if (!image || !audio) return
    setSubmitError(undefined)
    const form = new FormData()
    form.set('image', image.file)
    form.set('audio', audio.file)
    form.set('style', style)
    form.set('highlightColor', color)
    form.set('position', position)
    form.set('size', size)
    setJob({ id: '', status: 'queued', progress: 0 })
    try {
      const res = await fetch('/api/jobs', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setJob(null)
        setSubmitError(data.error || 'Something went wrong')
        return
      }
      setJob({ id: data.id, status: 'queued', progress: 0 })
      startPoll(data.id)
    } catch {
      setJob(null)
      setSubmitError('Could not reach the server')
    }
  }

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    setJob(null)
    setSubmitError(undefined)
    setImage(null)
    setAudio(null)
    setImageError(undefined)
    setAudioError(undefined)
  }

  const busy = job && job.status !== 'done' && job.status !== 'error'

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <div className="rounded-medium bg-primary p-2 shadow-sm">
          <Icon
            icon="solar:videocamera-record-bold"
            width={22}
            className="text-white"
          />
        </div>
        <p className="text-large font-semibold">Contiv</p>
      </div>

      {/* Hero */}
      <div className="flex flex-col gap-2">
        <h1 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
          Turn a picture and a voice note into a captioned video
        </h1>
        <p className="text-medium text-default-500">
          Drop in a landscape photo and an audio file, pick a caption style, and
          get a video with burned-in subtitles plus a captions file.
        </p>
      </div>

      {/* Card 1: files */}
      <Card className="border border-white/20 bg-content1/60 backdrop-blur-xl">
        <CardHeader className="flex flex-col items-start px-5 pb-0 pt-5">
          <p className="text-large font-medium">Your files</p>
          <p className="text-small text-default-500">
            One landscape image and one audio file
          </p>
        </CardHeader>
        <CardBody className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            {image ? (
              <DropZone
                icon="solar:gallery-bold"
                label="Replace image"
                hint="Drop a landscape image here or browse"
                accept="image/*"
                error={imageError}
                onPick={pickImage}
              >
                <img
                  src={image.url}
                  alt={image.file.name}
                  className="h-28 w-full rounded-medium object-cover"
                />
                <p className="max-w-full truncate text-small">{image.file.name}</p>
                <Chip size="sm" radius="full" variant="flat" color="primary">
                  {image.width} × {image.height}
                </Chip>
              </DropZone>
            ) : (
              <DropZone
                icon="solar:gallery-bold"
                label="Drop image here or browse"
                hint="Landscape works best"
                accept="image/*"
                error={imageError}
                onPick={pickImage}
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            {audio ? (
              <DropZone
                icon="solar:music-note-bold"
                label="Replace audio"
                hint="Drop an audio file here or browse"
                accept="audio/*"
                error={audioError}
                onPick={pickAudio}
              >
                <div className="rounded-medium border border-default-200 bg-default-50 p-2">
                  <Icon
                    icon="solar:music-note-bold"
                    width={24}
                    className="text-primary"
                  />
                </div>
                <p className="max-w-full truncate text-small">{audio.file.name}</p>
                <div className="flex gap-2">
                  <Chip size="sm" radius="full" variant="flat" color="primary">
                    {fmtSeconds(audio.duration)}
                  </Chip>
                  <Chip size="sm" radius="full" variant="flat">
                    {fileSize(audio.file.size)}
                  </Chip>
                </div>
              </DropZone>
            ) : (
              <DropZone
                icon="solar:music-note-bold"
                label="Drop audio here or browse"
                hint="MP3, WAV, M4A and more"
                accept="audio/*"
                error={audioError}
                onPick={pickAudio}
              />
            )}
          </div>
        </CardBody>
      </Card>

      {/* Card 2: caption style */}
      <Card className="border border-white/20 bg-content1/60 backdrop-blur-xl">
        <CardHeader className="flex flex-col items-start px-5 pb-0 pt-5">
          <p className="text-large font-medium">Caption style</p>
          <p className="text-small text-default-500">
            How your words will look on screen
          </p>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-5">
          <div
            role="radiogroup"
            aria-label="Caption style"
            className="grid grid-cols-2 gap-3"
          >
            {STYLES.map((s) => (
              <label
                key={s.id}
                className={cn(
                  'cursor-pointer rounded-large border p-3 transition-colors',
                  style === s.id
                    ? 'border-primary/40 bg-primary/15'
                    : 'border-default-200 bg-content1/40 hover:bg-content1/70',
                )}
              >
                <input
                  type="radio"
                  name="caption-style"
                  value={s.id}
                  checked={style === s.id}
                  onChange={() => setStyle(s.id)}
                  className="sr-only"
                />
                <StyleSwatch
                  style={s.id}
                  color={color}
                />
                <p className="mt-2 text-small font-medium">{s.name}</p>
                <p className="text-tiny text-default-400">{s.note}</p>
              </label>
            ))}
          </div>

          {(style === 'highlight' || style === 'karaoke') && (
            <div className="flex flex-col gap-2">
              <p className="text-small text-default-500">Highlight color</p>
              <div className="flex gap-2">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => setColor(c.value)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-transform',
                      color === c.value
                        ? 'scale-110 border-foreground/60'
                        : 'border-white/40 hover:bg-content1/70',
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-small text-default-500">Position</p>
              <div className="flex gap-1 rounded-full border border-default-200 bg-content1/40 p-1">
                {(['bottom', 'middle', 'top'] as Position[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPosition(p)}
                    className={cn(
                      'rounded-full px-3 py-1 text-small capitalize transition-colors',
                      position === p
                        ? 'bg-primary text-white'
                        : 'text-default-500 hover:bg-content1/70',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-small text-default-500">Size</p>
              <div className="flex gap-1 rounded-full border border-default-200 bg-content1/40 p-1">
                {(['small', 'medium', 'large'] as Size[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={cn(
                      'rounded-full px-3 py-1 text-small capitalize transition-colors',
                      size === s
                        ? 'bg-primary text-white'
                        : 'text-default-500 hover:bg-content1/70',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Button
        color="primary"
        radius="full"
        size="lg"
        className="w-full font-semibold"
        startContent={
          !busy && <Icon icon="solar:videocamera-record-bold" width={20} />
        }
        isDisabled={!image || !audio || !!busy}
        isLoading={!!busy}
        onPress={submit}
      >
        {busy ? 'Working on it' : 'Make my video'}
      </Button>

      {submitError && (
        <Card className="border border-danger-300 bg-content1/60 backdrop-blur-xl">
          <CardBody className="flex flex-row items-center gap-3 p-4">
            <Icon
              icon="solar:danger-triangle-bold"
              width={22}
              className="text-danger"
            />
            <p className="text-small text-danger">{submitError}</p>
          </CardBody>
        </Card>
      )}

      {/* Card 3: progress */}
      {job && job.status !== 'done' && (
        <Card
          className={cn(
            'border border-white/20 bg-content1/60 backdrop-blur-xl t-input-wrap',
            job.status === 'error' && 'is-error',
          )}
        >
          <CardHeader className="flex flex-col items-start px-5 pb-0 pt-5">
            <p className="text-large font-medium">Progress</p>
          </CardHeader>
          <CardBody className="flex flex-col gap-4 p-5">
            <div
              className={cn(
                't-input rounded-medium',
                job.status === 'error' && 'is-error is-shaking',
              )}
            >
              {job.status === 'error' ? (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:danger-triangle-bold"
                    width={20}
                    className="text-danger"
                  />
                  <p className="text-medium text-danger">
                    {job.error || 'Something went wrong'}
                  </p>
                </div>
              ) : (
                <p className="text-medium">
                  <StatusText text={STATUS_LABEL[job.status]} />
                  <span className="text-default-400">…</span>
                </p>
              )}
            </div>
            {job.status === 'rendering' ? (
              <Progress
                aria-label="Rendering progress"
                value={job.progress}
                color="primary"
                radius="full"
                showValueLabel
              />
            ) : (
              job.status !== 'error' && (
                <Progress
                  aria-label="Working"
                  isIndeterminate
                  color="primary"
                  radius="full"
                />
              )
            )}
            {job.status === 'error' && (
              <div>
                <Button
                  color="danger"
                  variant="flat"
                  radius="full"
                  size="sm"
                  startContent={<Icon icon="solar:refresh-linear" width={16} />}
                  onPress={submit}
                >
                  Try again
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Card 4: result */}
      {job?.status === 'done' && (
        <Card className="border border-white/20 bg-content1/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center gap-3 px-5 pb-0 pt-5">
            <SuccessCheck />
            <div>
              <p className="text-large font-medium">Your video is ready</p>
              <p className="text-small text-default-500">
                Watch it here or download the files
              </p>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-4 p-5">
            <video
              controls
              className="w-full rounded-large bg-black"
              src={`/api/jobs/${job.id}/video?inline=1`}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                as="a"
                href={`/api/jobs/${job.id}/video`}
                color="primary"
                radius="full"
                startContent={
                  <Icon icon="solar:download-minimalistic-linear" width={18} />
                }
              >
                Download video
              </Button>
              <Button
                as="a"
                href={`/api/jobs/${job.id}/srt`}
                variant="bordered"
                radius="full"
                size="sm"
                className="self-center"
                startContent={<Icon icon="solar:text-bold" width={16} />}
              >
                Download captions (.srt)
              </Button>
              <Button
                variant="light"
                radius="full"
                size="sm"
                className="self-center"
                startContent={<Icon icon="solar:refresh-linear" width={16} />}
                onPress={reset}
              >
                Start over
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </main>
  )
}
