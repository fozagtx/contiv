import { spawn } from 'node:child_process'

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg'
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe'

function escapeAssPath(p: string): string {
  // ffmpeg filter syntax: escape backslashes, colons, quotes
  return p.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'")
}

function probeDuration(path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFPROBE, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      path,
    ])
    let out = ''
    let err = ''
    proc.stdout.on('data', (d) => (out += d))
    proc.stderr.on('data', (d) => (err += d))
    proc.on('error', reject)
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe exited ${code}: ${err.slice(-2000)}`))
        return
      }
      const dur = parseFloat(out.trim())
      if (!Number.isFinite(dur) || dur <= 0) {
        reject(new Error(`ffprobe returned invalid duration: ${out.trim()}`))
        return
      }
      resolve(dur)
    })
  })
}

export async function renderVideo(opts: {
  imagePath: string
  audioPath: string
  assPath: string
  outPath: string
  onProgress?: (pct: number) => void
}): Promise<void> {
  const { imagePath, audioPath, assPath, outPath, onProgress } = opts
  const duration = await probeDuration(audioPath)
  const vf = `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p,ass='${escapeAssPath(assPath)}'`

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(FFMPEG, [
      '-y',
      '-loop',
      '1',
      '-framerate',
      '30',
      '-i',
      imagePath,
      '-i',
      audioPath,
      '-vf',
      vf,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-tune',
      'stillimage',
      '-crf',
      '20',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-shortest',
      '-movflags',
      '+faststart',
      '-progress',
      'pipe:1',
      '-nostats',
      outPath,
    ])
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d) => {
      stdout += d
      const match = /out_time_us=(\d+)/g
      let m: RegExpExecArray | null
      let last: number | null = null
      while ((m = match.exec(stdout))) last = parseInt(m[1], 10)
      if (last != null && onProgress) {
        onProgress(Math.min(100, Math.round((last / 1e6 / duration) * 100)))
      }
      if (stdout.length > 1e6) stdout = stdout.slice(-5000)
    })
    proc.stderr.on('data', (d) => (stderr += d))
    proc.on('error', reject)
    proc.on('close', (code) => {
      if (code !== 0) {
        const tail = stderr.split('\n').slice(-20).join('\n')
        reject(new Error(`ffmpeg exited ${code}:\n${tail}`))
        return
      }
      onProgress?.(100)
      resolve()
    })
  })
}
