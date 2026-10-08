import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/contiv/section-card'

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

export function JobResult({ jobId }: { jobId: string }) {
  return (
    <SectionCard
      title="Your video is ready"
      description="Watch it here or download the files"
      action={<SuccessCheck />}
      className="u-enter"
    >
      <div className="flex flex-col gap-4">
        <video
          controls
          className="aspect-video w-full rounded-xl bg-black object-contain"
          src={`/api/jobs/${jobId}/video?inline=1`}
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild className="w-full sm:w-auto">
            <a href={`/api/jobs/${jobId}/video`}>
              <Icon icon="solar:download-minimalistic-linear" width={18} />
              Download video
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full self-center sm:w-auto"
          >
            <a href={`/api/jobs/${jobId}/srt`}>
              <Icon icon="solar:text-bold" width={16} />
              Download captions (.srt)
            </a>
          </Button>
        </div>
      </div>
    </SectionCard>
  )
}
