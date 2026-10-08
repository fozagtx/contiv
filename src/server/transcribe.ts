import { AssemblyAI } from 'assemblyai'

export type Word = {
  text: string
  /** seconds */
  start: number
  /** seconds */
  end: number
}

export async function transcribeAudio(
  audioPath: string,
): Promise<{ words: Word[]; srt: string }> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY
  if (!apiKey) {
    throw new Error('Server is missing ASSEMBLYAI_API_KEY')
  }
  const client = new AssemblyAI({ apiKey })
  const transcript = await client.transcripts.transcribe({
    audio: audioPath,
    speech_model: 'universal',
  })
  if (transcript.status === 'error') {
    throw new Error(
      `Transcription failed: ${transcript.error ?? 'unknown error'}`,
    )
  }
  const words: Word[] = (transcript.words ?? []).map((w) => ({
    text: w.text,
    start: w.start / 1000,
    end: w.end / 1000,
  }))
  const srt = await client.transcripts.subtitles(transcript.id, 'srt', 32)
  return { words, srt }
}
