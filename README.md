# Vilyze — AI Video Analysis

> Upload any video or paste a YouTube link. Get AI-powered insights: attention curves, transcripts, engagement scores, and actionable recommendations — all in under 2 minutes.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)](https://supabase.com)
[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## What it does

Vilyze analyzes your video content the same way a professional editor would — but in seconds.

| Feature | Details |
|---|---|
| **Attention Curve** | Frame-by-frame attention score modeled from motion, audio energy, pacing, and speech |
| **Viewer Retention** | YouTube-style smooth retention curve with hover inspection |
| **Drop Detection** | Identifies exact timestamps where engagement falls and explains why |
| **AI Summary** | LLM-generated overview of content quality and structure |
| **Hook Analysis** | Dedicated scoring of your opening 5–15 seconds |
| **Transcript** | Full word-level transcript with timestamps via Whisper |
| **Recommendations** | Prioritized, timestamped action items to improve performance |
| **Shareable Links** | One-click public share links for reports (no login required to view) |
| **Realtime Dashboard** | Live job status updates — stay on the dashboard while analysis runs |
| **Bulk Management** | Bulk archive or delete multiple analyses at once |

---

## Screenshots

> **Add your screenshots here.** Replace the placeholders below with real images.

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Analysis Report
![Analysis](docs/screenshots/analysis.png)

### Attention Curve (Interactive)
![Attention Curve](docs/screenshots/attention-curve.png)

### Upload Flow
![Upload](docs/screenshots/upload.png)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (Next.js)                   │
│  Landing · Auth · Dashboard · Analysis · Admin · Profile  │
└────────────────────────┬────────────────────────────────┘
                         │  HTTPS
               ┌─────────▼──────────┐
               │   Next.js API       │  /api/upload, /api/jobs,
               │   Routes (Edge)     │  /api/account, /api/feedback
               └─────────┬──────────┘
                         │  Supabase JS SDK
        ┌────────────────▼─────────────────────┐
        │              Supabase                 │
        │  ┌──────────┐ ┌──────┐ ┌──────────┐  │
        │  │ Postgres  │ │ Auth │ │ Storage  │  │
        │  │  (jobs,   │ │ PKCE │ │ (videos, │  │
        │  │ analyses, │ │  +   │ │thumbs,   │  │
        │  │ profiles) │ │OAuth │ │avatars)  │  │
        │  └──────────┘ └──────┘ └──────────┘  │
        │         │ Realtime (postgres_changes)  │
        └─────────┼────────────────────────────┘
                  │  poll every 5s
        ┌─────────▼──────────┐
        │   Python Worker     │  FastAPI + uvicorn
        │   (Railway/Fly.io)  │
        │  ┌───────────────┐  │
        │  │ 1. Download   │  │  yt-dlp or Supabase Storage
        │  │ 2. Transcode  │  │  ffmpeg → 640p, 16kHz mono
        │  │ 3. Transcribe │  │  faster-whisper tiny (int8)
        │  │ 4. Motion     │  │  OpenCV frame diffing
        │  │ 5. Audio      │  │  librosa RMS + silence
        │  │ 6. Continuity │  │  TF-IDF cosine similarity
        │  │ 7. Attention  │  │  Mean-reversion model
        │  │ 8. LLM        │  │  OpenRouter (Llama 3.3 70B)
        │  │ 9. Save       │  │  → Supabase → Realtime
        │  └───────────────┘  │
        └────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend (API) | Next.js Route Handlers (Edge-compatible) |
| Database | Supabase (PostgreSQL) with RLS |
| Auth | Supabase Auth — Google + GitHub OAuth, PKCE |
| Storage | Supabase Storage (videos, thumbnails, avatars) |
| Realtime | Supabase Realtime (`postgres_changes`) |
| AI Worker | Python 3.12, FastAPI, uvicorn |
| Speech-to-text | `faster-whisper` tiny model, int8, VAD filter |
| Vision | OpenCV headless (motion scoring) |
| Audio | librosa (RMS energy, silence detection) |
| LLM | OpenRouter API → Llama 3.3 70B Instruct (free tier) |
| Worker hosting | Railway (512MB–1GB plan) |
| Frontend hosting | Vercel |

---

## Prerequisites

- macOS with [Homebrew](https://brew.sh)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — **must be running**
- [asdf](https://asdf-vm.com) — language versions managed via `.tool-versions`
- An [OpenRouter](https://openrouter.ai/keys) API key (free)

---

## Quick Start

### 1. Install system deps

```bash
brew install ffmpeg
```

### 2. Start Supabase locally

```bash
cd /path/to/video-analize

# First run downloads ~500MB Docker images (~5 min)
supabase start

# Apply all migrations
supabase db reset
```

Note the `API URL`, `Publishable key`, and `Secret key` from the output.

### 3. Frontend

```bash
cd apps/web
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
SUPABASE_SERVICE_ROLE_KEY=<secret key>
```

```bash
npm install
npm run dev          # → http://localhost:3000
```

### 4. Python Worker

```bash
cd apps/worker
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<secret key>
OPENROUTER_API_KEY=sk-or-v1-...
```

```bash
uvicorn main:app --reload --port 8001
```

---

## Daily Dev

Open **3 terminals**:

| Terminal | Command | URL |
|---|---|---|
| Supabase | `supabase start` | Studio → http://localhost:54323 |
| Frontend | `npm run dev` (in `apps/web`) | http://localhost:3000 |
| Worker | `uvicorn main:app --reload --port 8001` (in `apps/worker`) | http://localhost:8001/health |

---

## Push Migrations to Production

```bash
# Link to your Supabase project (one time)
supabase link --project-ref <your-project-ref>

# Push all pending migrations
supabase db push
```

---

## Project Structure

```
video-analize/
├── apps/
│   ├── web/                  Next.js 16 frontend
│   │   ├── app/
│   │   │   ├── (auth)/       Login, OAuth callback
│   │   │   ├── dashboard/    Job list, upload, profile
│   │   │   ├── analysis/     Report pages
│   │   │   ├── share/        Public share pages (no auth)
│   │   │   ├── admin/        Admin panel (role-gated)
│   │   │   └── api/          Route handlers
│   │   ├── components/
│   │   │   ├── analysis/     Charts, metrics, transcript
│   │   │   ├── dashboard/    JobList, CreditButton, StatusWatcher
│   │   │   ├── admin/        FeedbackTable
│   │   │   └── ui/           Shared primitives
│   │   ├── hooks/            useUpload, useProfile
│   │   ├── lib/              Supabase clients, utils
│   │   └── types/            TypeScript interfaces
│   │
│   └── worker/               Python AI worker
│       ├── pipeline/
│       │   ├── downloader.py   yt-dlp + Supabase Storage
│       │   ├── transcriber.py  faster-whisper
│       │   ├── motion.py       OpenCV motion scoring
│       │   ├── audio.py        librosa energy + silence
│       │   ├── continuity.py   TF-IDF cosine similarity
│       │   ├── attention.py    Mean-reversion attention model
│       │   └── gpt.py          OpenRouter LLM call
│       ├── worker/
│       │   ├── poller.py       FIFO job queue with backoff
│       │   └── processor.py    Orchestrates pipeline stages
│       └── db/queries.py       Supabase queries
│
└── supabase/migrations/       All SQL: schema, RLS, indexes
```

---

## How the Attention Model Works

The attention score per second is a weighted mean of four signals:

| Signal | Weight | Source |
|---|---|---|
| Motion | 0.30 | OpenCV inter-frame pixel diff |
| Audio energy | 0.25 | librosa RMS (normalized) |
| Speech rate | 0.25 | Words per second from Whisper timestamps |
| Narrative continuity | 0.20 | TF-IDF cosine similarity between transcript segments |

A **mean-reversion** correction is applied: scores are pulled toward the video mean to prevent short bursts of silence from making the whole video look bad.

---

## User Roles

| Role | Access |
|---|---|
| `free` | 3 analyses/month |
| `upgraded` | Higher limits |
| `super` | Unlimited |
| `admin` | Admin panel, reply to feedback |

Set via `profiles.role` column in Supabase.

---

## Deployment (Production)

### Worker → Railway

1. Connect your GitHub repo in [Railway](https://railway.app)
2. Set root directory: `apps/worker`
3. Set environment variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...
   OPENROUTER_API_KEY=sk-or-v1-...
   WHISPER_MODEL=tiny
   MAX_VIDEO_DURATION_S=300
   MAX_FILE_SIZE_MB=100
   ```
4. Deploy. Railway auto-detects the `Procfile` / `uvicorn` startup.
5. **Recommended plan**: 1GB RAM (worker peaks at ~450MB)

### Frontend → Vercel

1. Import the `apps/web` directory in [Vercel](https://vercel.com)
2. Set the same env vars as `.env.local`
3. Deploy.

---

## Cost (Production)

| Service | Cost |
|---|---|
| Vercel (frontend) | Free |
| Supabase (DB + auth + storage) | Free tier |
| Railway (worker, 1GB) | ~$5/month |
| OpenRouter (Llama 3.3 70B free) | $0 |
| **Total** | **~$5/month** |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `supabase start` fails | Make sure Docker Desktop is running |
| Worker OOM on Railway | Upgrade to 1GB RAM plan |
| YouTube download 404 | Video must be public and under 5 minutes |
| `ffmpeg not found` | `brew install ffmpeg` |
| Whisper slow | Set `WHISPER_MODEL=tiny` and `BEAM_SIZE=1` |
| Jobs stuck in `processing` | Worker auto-resets jobs stuck > 15 min |
| Share link 404 | Run `supabase db push` — migration 9 adds `share_token` column |

---

## License

MIT — free to use, fork, and deploy.

---

*Built by [Ravi Giri](https://github.com/ravigiri) · Powered by Supabase, Next.js, and OpenRouter*
