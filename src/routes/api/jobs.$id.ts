import { createFileRoute } from '@tanstack/react-router'

import { getJob } from '#/server/jobs'

export const Route = createFileRoute('/api/jobs/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const job = getJob(params.id)
        if (!job) {
          return Response.json({ error: 'Job not found' }, { status: 404 })
        }
        return Response.json({
          id: job.id,
          status: job.status,
          progress: job.progress,
          error: job.error,
        })
      },
    },
  },
})
