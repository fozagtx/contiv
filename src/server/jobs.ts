import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export type JobStatus =
  | 'queued'
  | 'transcribing'
  | 'rendering'
  | 'done'
  | 'error'

export type Job = {
  id: string
  status: JobStatus
  progress: number
  error?: string
  dir: string
  videoPath?: string
  srtPath?: string
  assPath?: string
  createdAt: number
}

export const jobs = new Map<string, Job>()

const MAX_AGE_MS = 2 * 60 * 60 * 1000

function baseDir() {
  return path.join(os.tmpdir(), 'contiv')
}

function sweepOldDirs() {
  const base = baseDir()
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(base, { withFileTypes: true })
  } catch {
    return
  }
  const cutoff = Date.now() - MAX_AGE_MS
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const dir = path.join(base, entry.name)
    try {
      const stat = fs.statSync(dir)
      if (stat.mtimeMs < cutoff) {
        fs.rmSync(dir, { recursive: true, force: true })
        jobs.delete(entry.name)
      }
    } catch {
      // ignore
    }
  }
}

export function createJob(): Job {
  sweepOldDirs()
  const id = crypto.randomUUID()
  const dir = path.join(baseDir(), id)
  fs.mkdirSync(dir, { recursive: true })
  const job: Job = {
    id,
    status: 'queued',
    progress: 0,
    dir,
    createdAt: Date.now(),
  }
  jobs.set(id, job)
  return job
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id)
}
