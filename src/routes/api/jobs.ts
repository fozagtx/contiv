import fs from 'node:fs'
import path from 'node:path'

import { createFileRoute } from '@tanstack/react-router'

import { createJob } from '#/server/jobs'
import { runJob } from '#/server/pipeline'

const MAX_BYTES = 100 * 1024 * 1024
const STYLES = new Set(['highlight', 'classic', 'karaoke', 'boxed'])
const POSITIONS = new Set(['bottom', 'middle', 'top'])
const SIZES = new Set(['small', 'medium', 'large'])
const COLOR_RE = /^#[0-9a-f]{6}$/i

function safeExt(name: string, fallback: string): string {
  const ext = path.extname(name || '').toLowerCase()
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : fallback
}

function bad(error: string) {
  return Response.json({ error }, { status: 400 })
}

export const Route = createFileRoute('/api/jobs')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!process.env.ASSEMBLYAI_API_KEY) {
          return Response.json(
            { error: 'Server is missing ASSEMBLYAI_API_KEY' },
            { status: 500 },
          )
        }
        let form: FormData
        try {
          form = await request.formData()
        } catch {
          return bad('Expected multipart form data')
        }
        const image = form.get('image')
        const audio = form.get('audio')
        if (!(image instanceof File) || !(audio instanceof File)) {
          return bad('Both an image and an audio file are required')
        }
        if (!image.type.startsWith('image/')) {
          return bad('The first file must be an image')
        }
        if (!audio.type.startsWith('audio/')) {
          return bad('The second file must be an audio file')
        }
        if (image.size > MAX_BYTES || audio.size > MAX_BYTES) {
          return bad('Files must be under 100 MB each')
        }
        const style = String(form.get('style') || '')
        const highlightColor = String(form.get('highlightColor') || '')
        const position = String(form.get('position') || '')
        const size = String(form.get('size') || '')
        if (!STYLES.has(style)) return bad('Unknown caption style')
        if (!POSITIONS.has(position)) return bad('Unknown caption position')
        if (!SIZES.has(size)) return bad('Unknown caption size')
        if (!COLOR_RE.test(highlightColor)) {
          return bad('Invalid highlight color')
        }

        const job = createJob()
        const imagePath = path.join(
          job.dir,
          `image${safeExt(image.name, '.png')}`,
        )
        const audioPath = path.join(
          job.dir,
          `audio${safeExt(audio.name, '.mp3')}`,
        )
        fs.writeFileSync(imagePath, Buffer.from(await image.arrayBuffer()))
        fs.writeFileSync(audioPath, Buffer.from(await audio.arrayBuffer()))

        // fire and forget
        void runJob(job, {
          imagePath,
          audioPath,
          captions: {
            style: style as 'highlight' | 'classic' | 'karaoke' | 'boxed',
            highlightColor,
            position: position as 'bottom' | 'middle' | 'top',
            size: size as 'small' | 'medium' | 'large',
          },
        })

        return Response.json({ id: job.id }, { status: 202 })
      },
    },
  },
})
