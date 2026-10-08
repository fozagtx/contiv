import fs from 'node:fs'
import { Readable } from 'node:stream'

import { createFileRoute } from '@tanstack/react-router'

import { getJob } from '#/server/jobs'

export const Route = createFileRoute('/api/jobs/$id/video')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const job = getJob(params.id)
        if (!job?.videoPath || !fs.existsSync(job.videoPath)) {
          return Response.json({ error: 'Video not found' }, { status: 404 })
        }
        const inline = new URL(request.url).searchParams.get('inline') === '1'
        const stat = fs.statSync(job.videoPath)
        const size = stat.size
        const headers = new Headers({
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
        })
        if (!inline) {
          headers.set(
            'Content-Disposition',
            `attachment; filename="contiv-${job.id}.mp4"`,
          )
        }

        const range = request.headers.get('range')
        const m = range?.match(/^bytes=(\d*)-(\d*)$/)
        if (m && (m[1] || m[2])) {
          const start = m[1] ? parseInt(m[1], 10) : Math.max(0, size - parseInt(m[2], 10))
          const end = m[1] ? (m[2] ? Math.min(parseInt(m[2], 10), size - 1) : size - 1) : size - 1
          if (start >= size || start > end) {
            return new Response(null, {
              status: 416,
              headers: { 'Content-Range': `bytes */${size}` },
            })
          }
          headers.set('Content-Range', `bytes ${start}-${end}/${size}`)
          headers.set('Content-Length', String(end - start + 1))
          const stream = Readable.toWeb(
            fs.createReadStream(job.videoPath, { start, end }),
          ) as ReadableStream
          return new Response(stream, { status: 206, headers })
        }

        headers.set('Content-Length', String(size))
        const stream = Readable.toWeb(
          fs.createReadStream(job.videoPath),
        ) as ReadableStream
        return new Response(stream, { headers })
      },
    },
  },
})
