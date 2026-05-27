# Vilyze — AI Video Analysis SaaS

Upload any video or YouTube link → get AI-powered insights: attention curves, transcripts, engagement metrics, and recommendations.

**Stack:** Next.js 16 · Supabase · Python FastAPI · Whisper · OpenRouter

---

## Prerequisites

- macOS with [Homebrew](https://brew.sh)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — **must be running before anything else**
- [asdf](https://asdf-vm.com) — already configured via `.tool-versions`
- An [OpenRouter](https://openrouter.ai/keys) API key

---

## 1. One-Time Setup

```bash
# Install ffmpeg (required by AI worker)
brew install ffmpeg

# Verify tools
supabase --version
node --version
python3 --version
ffmpeg -version
```

---

## 2. Supabase — Run Once Per Machine

```bash
cd /Users/macbookair/project/video-analize

# Start local Supabase (first run downloads ~500MB Docker images — takes ~5 min)
supabase start

# Run migrations — creates all tables, RLS policies, and indexes
supabase db reset
```

After `supabase start` you will see output like:

```
API URL:          http://127.0.0.1:54321
Publishable key:  sb_publishable_...
Secret key:       sb_secret_...
```

Copy those keys — you need them in the next steps.

---

## 3. Frontend Setup — Run Once

```bash
cd /Users/macbookair/project/video-analize/apps/web

# Copy env template
cp .env.local.example .env.local
```

Edit `.env.local` and fill in the keys from `supabase start`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

---

## 4. Worker Setup — Run Once

```bash
cd /Users/macbookair/project/video-analize/apps/worker

# Create Python virtual environment
python3 -m venv .venv

# Activate it
source .venv/bin/activate

# Install dependencies (downloads Whisper model weights — ~5 min)
pip install -r requirements.txt

# Copy env template
cp .env.example .env
```

Edit `.env` and fill in:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/owl-alpha
```

---

## 5. Daily Start

Open **3 terminals**:

**Terminal 1 — Supabase**
```bash
cd /Users/macbookair/project/video-analize
supabase start
```

**Terminal 2 — Frontend**
```bash
cd /Users/macbookair/project/video-analize/apps/web
npm run dev
```
Open → http://localhost:3000

**Terminal 3 — Python Worker**
```bash
cd /Users/macbookair/project/video-analize/apps/worker
source .venv/bin/activate
uvicorn main:app --reload --port 8001
.venv/bin/python -m uvicorn main:app --reload --port 8001
```

---

## 6. Daily Stop

```bash
# Stop Supabase (data is preserved)
cd /Users/macbookair/project/video-analize
supabase stop

# Stop frontend and worker: Ctrl+C in their terminals
```

---

## Quick Reference

| Service | URL | Start command |
|---|---|---|
| Frontend | http://localhost:3000 | `npm run dev` in `apps/web` |
| Worker API | http://localhost:8001 | `uvicorn main:app --reload --port 8001` |
| Supabase Studio | http://localhost:54323 | `supabase start` |
| Supabase DB | port 54322 | `supabase start` |

---

## Useful Commands

```bash
# Open Supabase Studio (table editor, auth, storage)
open http://localhost:54323

# Check Supabase is running
supabase status

# Wipe DB and re-run all migrations (loses all data)
supabase db reset

# Check worker health
open http://localhost:8001/health

# Check Supabase logs
supabase logs db

# Re-install Python deps after requirements.txt change
cd apps/worker && source .venv/bin/activate && pip install -r requirements.txt
```

---

## Project Structure

```
video-analize/
├── apps/
│   ├── web/               Next.js 16 frontend (port 3000)
│   │   ├── app/           Pages and API routes
│   │   ├── components/    UI components
│   │   ├── hooks/         useUpload, etc.
│   │   ├── lib/           Supabase clients, validations
│   │   └── types/         TypeScript types
│   │
│   └── worker/            Python FastAPI AI worker (port 8001)
│       ├── pipeline/      ffmpeg → Whisper → OpenCV → librosa → attention → OpenRouter
│       ├── worker/        Job poller + processor
│       └── db/            Supabase queries
│
├── supabase/
│   └── migrations/        SQL schema, RLS policies, indexes
│
├── .tool-versions         asdf: Node 20.19.0, Python 3.12.2
├── SETUP.md               Detailed setup guide
└── README.md              This file
```

---

## AI Pipeline (what happens when you upload a video)

```
1. Download     — Supabase Storage or yt-dlp (YouTube)
2. ffmpeg       — resize to 640×360, extract 16kHz mono audio
3. Whisper      — transcription with timestamps
4. OpenCV       — motion score per frame
5. librosa      — audio RMS energy + silence classification
6. sentence-transformers — narrative continuity between segments
7. Attention model — mean-reversion model (ported from video-editor.ipynb)
8. OpenRouter   — summary, hook analysis, recommendations via owl-alpha
9. Save         — results to Supabase → Realtime → frontend updates
```

---

## Cost (when deployed)

| Service | Cost |
|---|---|
| Vercel (frontend) | $0 |
| Supabase (DB + auth + storage) | $0 free tier |
| Fly.io (worker) | $5/month |
| OpenRouter (LLM) | pay per token |
| **Total** | **~$5-7/month** |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `supabase start` fails | Make sure Docker Desktop is running |
| Worker can't connect to Supabase | Run `supabase status` — check it's running |
| `ffmpeg not found` | `brew install ffmpeg` |
| Whisper out of memory | Set `WHISPER_MODEL=tiny` in `apps/worker/.env` |
| YouTube download fails | Check the URL is a public video (not age-restricted) |
| `supabase db reset` fails | Run `supabase logs db` to see the SQL error |
