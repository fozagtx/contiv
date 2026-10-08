# Contiv

Turn a landscape picture and an audio file into a captioned MP4, plus a matching SRT file. Pick a caption style (word highlight, classic, karaoke, boxed), and Contiv transcribes the audio with AssemblyAI and burns the captions in with ffmpeg.

## Run locally

You need Node 22+, an AssemblyAI API key, and ffmpeg built with libass (check with `ffmpeg -filters | grep ass`).

```sh
npm install
cp .env.example .env   # put your ASSEMBLYAI_API_KEY in .env
npm run dev
```

Open http://localhost:3000.

Production build:

```sh
npm run build
npm run start
```

## Deploy to Render

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and point it at the repo. `render.yaml` defines a single Docker web service named `contiv` with a health check on `/api/health`.
3. Add `ASSEMBLYAI_API_KEY` as a secret environment variable when prompted.

The Docker image is based on `node:22-alpine` and installs ffmpeg, fontconfig, DejaVu, and Inter fonts for subtitle rendering.
