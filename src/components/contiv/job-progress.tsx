import * as React from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SectionCard } from '@/components/contiv/section-card'
import { cn } from 'cn'

export type JobStatus =
  | 'queued'
  | 'transcribing'
  | 'rendering'
  | 'done'
  | 'error'

const STATUS_LABEL: Record<JobStatus, string> = {
  queued: 'Uploading',
  transcribing: 'Transcribing',
  rendering: 'Rendering',
  done: 'Ready',
  error: 'Something went wrong',
}

const STEPS: { key: JobStatus; label: string }[] = [
  { key: 'queued', label: 'Uploading' },
  { key: 'transcribing', label: 'Transcribing' },
  { key: 'rendering', label: 'Rendering' },
]

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

export function JobProgress({
  status,
  progress,
  error,
  onRetry,
}: {
  status: JobStatus
  progress: number
  error?: string
  onRetry: () => void
}) {
  const stepIndex = STEPS.findIndex((s) => s.key === status)
  const isError = status === 'error'
  return (
    <SectionCard
      title="Progress"
      className={cn('u-enter', isError && 'border-destructive/40')}
    >
      <div className={cn('flex flex-col gap-6', isError && 'u-shake')}>
        {isError ? (
          <div role="alert" className="flex items-center gap-2 text-destructive">
            <Icon icon="solar:danger-triangle-bold" width={20} />
            <p className="text-sm">{error || 'Something went wrong'}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  {i < stepIndex ? (
                    <Icon
                      icon="solar:check-circle-bold"
                      width={16}
                      className="u-checkpop text-primary"
                    />
                  ) : i === stepIndex ? (
                    <Icon
                      icon="solar:refresh-linear"
                      width={16}
                      className="animate-spin text-primary"
                    />
                  ) : (
                    <span className="size-4 rounded-full border border-border" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      i === stepIndex
                        ? 'text-foreground'
                        : i < stepIndex
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/60',
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <StatusText text={STATUS_LABEL[status]} />
              <span>…</span>
            </p>
            {status === 'rendering' ? (
              <div className="flex items-center gap-3">
                <Progress value={progress} className="u-progress-fill flex-1" />
                <span className="font-mono text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
            ) : (
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="u-indeterminate h-full w-1/3 rounded-full bg-primary" />
              </div>
            )}
          </>
        )}
        {isError && (
          <div>
            <Button variant="destructive" size="sm" onClick={onRetry}>
              <Icon icon="solar:refresh-linear" width={16} />
              Try again
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
