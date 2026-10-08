import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SectionCard } from '@/components/contiv/section-card'
import {
  AudioPreview,
  FileDropZone,
  ImagePreview,
} from '@/components/contiv/file-drop-zone'
import {
  CaptionStylePicker,
  type CaptionStyle,
} from '@/components/contiv/caption-style-picker'
import {
  CaptionOptions,
  type CaptionSize,
  type Position,
} from '@/components/contiv/caption-options'
import { JobProgress, type JobStatus } from '@/components/contiv/job-progress'
import { JobResult } from '@/components/contiv/job-result'
import { usePickedFiles } from '@/components/contiv/use-picked-files'

export const Route = createFileRoute('/')({ component: Home })

type Job = {
  id: string
  status: JobStatus
  progress: number
  error?: string
}

function Home() {
  const {
    image,
    imageError,
    pickImage,
    audio,
    audioError,
    pickAudio,
    resetFiles,
  } = usePickedFiles()
  const [style, setStyle] = React.useState<CaptionStyle>('highlight')
  const [color, setColor] = React.useState('#FFE14D')
  const [position, setPosition] = React.useState<Position>('bottom')
  const [size, setSize] = React.useState<CaptionSize>('medium')
  const [job, setJob] = React.useState<Job | null>(null)
  const [submitError, setSubmitError] = React.useState<string>()

  const pollRef = React.useRef<ReturnType<typeof setInterval>>(null)
  React.useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current)
    },
    [],
  )

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
    resetFiles()
  }

  const busy = !!job && job.status !== 'done' && job.status !== 'error'
  const done = job?.status === 'done'

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mb-8 flex items-center gap-3 sm:mb-10">
        <div className="rounded-md bg-foreground p-2">
          <Icon
            icon="solar:videocamera-record-bold"
            width={22}
            className="text-background"
          />
        </div>
        <h1 className="text-lg font-semibold">Contiv</h1>
      </div>

      <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0 xl:grid-cols-[7fr_5fr]">
        <div className="flex min-w-0 flex-col gap-6">
          <SectionCard
            title="Your files"
            description="One landscape image and one audio file"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <FileDropZone
                icon="solar:gallery-bold"
                label={image ? 'Replace image' : 'Drop image here or browse'}
                hint="Landscape works best"
                accept="image/*"
                error={imageError}
                onFile={pickImage}
                className="lg:aspect-auto lg:min-h-56"
              >
                {image && <ImagePreview image={image} />}
              </FileDropZone>
              <FileDropZone
                icon="solar:music-note-bold"
                label={audio ? 'Replace audio' : 'Drop audio here or browse'}
                hint="MP3, WAV, M4A and more"
                accept="audio/*"
                error={audioError}
                onFile={pickAudio}
                compact
                className="lg:aspect-auto lg:min-h-32"
              >
                {audio && <AudioPreview audio={audio} />}
              </FileDropZone>
            </div>
          </SectionCard>

          {job && job.status !== 'done' && (
            <JobProgress
              status={job.status}
              progress={job.progress}
              error={job.error}
              onRetry={submit}
            />
          )}

          {done && <JobResult jobId={job.id} />}
        </div>

        <div className="min-w-0 lg:sticky lg:top-8">
          <SectionCard
            title="Caption style"
            description="How your words will look on screen"
          >
            <div className="flex flex-col gap-6">
              <CaptionStylePicker
                value={style}
                onChange={setStyle}
                highlightColor={color}
              />
              <CaptionOptions
                showColor={style === 'highlight' || style === 'karaoke'}
                color={color}
                onColor={setColor}
                position={position}
                onPosition={setPosition}
                size={size}
                onSize={setSize}
              />
              {submitError && (
                <Alert variant="destructive" className="u-shake">
                  <Icon icon="solar:danger-triangle-bold" width={18} />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              <Button
                size="lg"
                className="u-btn w-full"
                disabled={!done && (!image || !audio || busy)}
                variant={done ? 'outline' : 'default'}
                onClick={done ? reset : submit}
              >
                {busy ? (
                  <Icon
                    icon="solar:refresh-linear"
                    width={18}
                    className="animate-spin"
                  />
                ) : (
                  <Icon
                    icon={
                      done
                        ? 'solar:refresh-linear'
                        : 'solar:videocamera-record-bold'
                    }
                    width={18}
                  />
                )}
                {done ? 'Start over' : busy ? 'Working on it' : 'Make my video'}
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  )
}
