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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="space-y-8 sm:space-y-10">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-foreground p-2">
            <Icon
              icon="solar:videocamera-record-bold"
              width={22}
              className="text-background"
            />
          </div>
          <p className="text-lg font-semibold">Contiv</p>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">
            Turn a picture and a voice note into a captioned video
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Drop in a landscape photo and an audio file, pick a caption style,
            and get a video with burned-in subtitles plus a captions file.
          </p>
        </div>

        <SectionCard
          title="Your files"
          description="One landscape image and one audio file"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FileDropZone
              icon="solar:gallery-bold"
              label={image ? 'Replace image' : 'Drop image here or browse'}
              hint="Landscape works best"
              accept="image/*"
              error={imageError}
              onFile={pickImage}
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
            >
              {audio && <AudioPreview audio={audio} />}
            </FileDropZone>
          </div>
        </SectionCard>

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
            <Button
              size="lg"
              className="u-btn w-full sm:w-auto sm:self-start"
              disabled={!image || !audio || busy}
              onClick={submit}
            >
              {busy ? (
                <Icon
                  icon="solar:refresh-linear"
                  width={18}
                  className="animate-spin"
                />
              ) : (
                <Icon icon="solar:videocamera-record-bold" width={18} />
              )}
              {busy ? 'Working on it' : 'Make my video'}
            </Button>
          </div>
        </SectionCard>

        {submitError && (
          <Alert variant="destructive" className="u-shake">
            <Icon icon="solar:danger-triangle-bold" width={18} />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {job && job.status !== 'done' && (
          <JobProgress
            status={job.status}
            progress={job.progress}
            error={job.error}
            onRetry={submit}
          />
        )}

        {job?.status === 'done' && (
          <JobResult jobId={job.id} onStartOver={reset} />
        )}
      </div>
    </main>
  )
}
