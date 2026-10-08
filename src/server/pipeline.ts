import fs from 'node:fs'
import path from 'node:path'

import type { Job } from './jobs'
import { buildAss, type AssOptions } from './captions'
import { renderVideo } from './render'
import { transcribeAudio } from './transcribe'

export async function runJob(
  job: Job,
  params: { imagePath: string; audioPath: string; captions: AssOptions },
): Promise<void> {
  try {
    job.status = 'transcribing'
    job.progress = 0

    const { words, srt } = await transcribeAudio(params.audioPath)
    if (!words.length) {
      throw new Error('No speech was detected in the audio')
    }

    job.srtPath = path.join(job.dir, 'captions.srt')
    fs.writeFileSync(job.srtPath, srt, 'utf8')

    job.assPath = path.join(job.dir, 'captions.ass')
    fs.writeFileSync(job.assPath, buildAss(words, params.captions), 'utf8')

    job.status = 'rendering'
    job.videoPath = path.join(job.dir, 'video.mp4')
    await renderVideo({
      imagePath: params.imagePath,
      audioPath: params.audioPath,
      assPath: job.assPath,
      outPath: job.videoPath,
      onProgress: (pct) => {
        job.progress = pct
      },
    })

    job.status = 'done'
    job.progress = 100
  } catch (err) {
    job.status = 'error'
    job.error = err instanceof Error ? err.message : 'Something went wrong'
  }
}
