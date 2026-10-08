import * as React from 'react'

export type ImageInfo = { file: File; url: string; width: number; height: number }
export type AudioInfo = { file: File; duration: number }

export function usePickedFiles() {
  const [image, setImage] = React.useState<ImageInfo | null>(null)
  const [imageError, setImageError] = React.useState<string>()
  const [audio, setAudio] = React.useState<AudioInfo | null>(null)
  const [audioError, setAudioError] = React.useState<string>()

  const pickImage = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setImageError('That file is not an image')
      return
    }
    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth < img.naturalHeight) {
        URL.revokeObjectURL(url)
        setImage(null)
        setImageError('Pick a landscape image (wider than tall)')
      } else {
        setImage({
          file: f,
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
        setImageError(undefined)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      setImageError('Could not read that image')
    }
    img.src = url
  }

  const pickAudio = (f: File) => {
    if (!f.type.startsWith('audio/')) {
      setAudioError('That file is not an audio file')
      return
    }
    const url = URL.createObjectURL(f)
    const el = document.createElement('audio')
    el.preload = 'metadata'
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      setAudio({ file: f, duration: el.duration })
      setAudioError(undefined)
    }
    el.onerror = () => {
      URL.revokeObjectURL(url)
      setAudio({ file: f, duration: 0 })
      setAudioError(undefined)
    }
    el.src = url
  }

  const resetFiles = () => {
    setImage(null)
    setAudio(null)
    setImageError(undefined)
    setAudioError(undefined)
  }

  return {
    image,
    imageError,
    pickImage,
    audio,
    audioError,
    pickAudio,
    resetFiles,
  }
}

export function fileSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

export function fmtSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const r = Math.round(s - m * 60)
  return `${m}:${String(r).padStart(2, '0')}`
}
