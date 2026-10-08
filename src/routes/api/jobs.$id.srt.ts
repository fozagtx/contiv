import fs from 'node:fs'
import { Readable } from 'node:stream'

import { createFileRoute } from '@tanstack/react-router'

import { getJob } from '#/server/jobs'

export const Route = createFileRoute('/api/jobs/$id/srt')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const job = getJob(params.id)
        if (!job?.srtPath || !fs.existsSync(job.srtPath)) {
          return Response.json(
            { error: 'Captions not found' },
            { status: 404 },
          )
        }
        const stream = Readable.toWeb(
          fs.createReadStream(job.srtPath),
        ) as ReadableStream
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="contiv-${job.id}.srt"`,
          },
        })
      },
    },
  },
})
