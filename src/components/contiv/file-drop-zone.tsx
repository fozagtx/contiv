import * as React from 'react'
import { Icon } from '@iconify/react'
import { Badge } from '@/components/ui/badge'
import { cn } from 'cn'
import {
  fileSize,
  fmtSeconds,
  type AudioInfo,
  type ImageInfo,
} from '@/components/contiv/use-picked-files'

export function FileDropZone({
  icon,
  label,
  hint,
  accept,
  error,
  onFile,
  children,
  compact,
  className,
}: {
  icon: string
  label: string
  hint: string
  accept: string
  error?: string
  onFile: (f: File) => void
  children?: React.ReactNode
  compact?: boolean
  className?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [over, setOver] = React.useState(false)
  return (
    <div className={cn('t-input-wrap', error && 'is-error')}>
      <div
        className={cn(
          't-input dz flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 p-4 text-center sm:aspect-[16/10] sm:min-h-0',
          over && 'scale-[1.01] border-solid border-primary bg-primary/5',
          error && 'border-destructive/50',
          error && 'is-shaking',
          className,
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
        onDragEnter={(e) => {
          e.preventDefault()
          setOver(true)
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
          if (f) onFile(f)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
            e.target.value = ''
          }}
        />
        {children ? (
          <div className="u-pop flex w-full flex-col items-center">
            {children}
          </div>
        ) : compact ? (
          <div className="flex items-center gap-3 text-left">
            <div className="shrink-0 rounded-md border border-border bg-muted p-2">
              <Icon icon={icon} width={24} className="text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-md border border-border bg-muted p-2">
              <Icon icon={icon} width={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </>
        )}
      </div>
      <p className="t-error-msg text-sm text-destructive">{error}</p>
    </div>
  )
}

export function ImagePreview({ image }: { image: ImageInfo }) {
  return (
    <>
      <img
        src={image.url}
        alt={image.file.name}
        className="max-h-28 w-full rounded-md object-cover"
      />
      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="max-w-full truncate text-sm">{image.file.name}</p>
        <Badge variant="secondary">
          {image.width} × {image.height}
        </Badge>
      </div>
    </>
  )
}

export function AudioPreview({ audio }: { audio: AudioInfo }) {
  return (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted">
        <Icon
          icon="solar:music-note-bold"
          width={20}
          className="text-foreground"
        />
      </div>
      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="max-w-full truncate text-sm">{audio.file.name}</p>
        <div className="flex gap-2">
          <Badge variant="secondary">{fmtSeconds(audio.duration)}</Badge>
          <Badge variant="outline">{fileSize(audio.file.size)}</Badge>
        </div>
      </div>
    </>
  )
}
