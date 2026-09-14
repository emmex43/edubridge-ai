# Deploying EduBridge AI

Deployment guide for **EduBridge AI**: the backend, the database, and the two
settings that connect them to the frontend. It is one document serving two
people — see **Who does what** below for which half is yours.

**This file contains no secrets and never should.** Every credential below is a
placeholder in angle brackets. Real values go into the Render/Vercel dashboards,
never into this file or any other file in this repository.

There are two places to change, and they have to agree with each other:

| Where | Setting | Value |
|---|---|---|
| Render (backend) | `ALLOWED_ORIGINS` | the frontend's URL |
| Vercel (frontend) | `NEXT_PUBLIC_API_URL` | the backend's URL |

Get one of those wrong and the app loads but every request fails.

---

## Who does what

This is two jobs done by two people, meeting in the middle.

| Half | Owner | Parts | Hands over |
|---|---|---|---|
| **Backend** — database, API, hosting | the backend owner | 1, 2, 3, and Part 6 steps 1–3 | the Render URL |
| **Frontend** — pointing the app at it | the frontend owner | 4, and Part 6 step 4 | nothing; it is the last step |

The only thing that crosses between them is the **Render URL**, which is a public
address and not a secret. No key, password or connection string is ever sent to
the frontend owner: the frontend never talks to the database or the AI provider,
only to the backend.

**Order.** It does not have to be a loop:

1. Deploy the backend (Parts 1–3) and note its URL.
2. Send that URL to the frontend owner, who sets `NEXT_PUBLIC_API_URL` and then
   **redeploys** — see the warning under Part 4, this is the step that gets
   missed.
3. Set `ALLOWED_ORIGINS` to the frontend's URL and let the service restart.

If the frontend is already deployed on Vercel then its URL is already known, so
step 3 can be folded into step 1 when the service is created. Doing it that way
skips a restart and means the frontend's very first request succeeds.

---

## Which platform for which half

The frontend stays on Vercel — it is a Next.js app and that is what Vercel is
built for. **The backend should go on Render**, not Vercel, for one concrete
reason:

> The backend writes each Text-to-Speech clip to disk and serves it back from
> `/static`. Vercel's filesystem is read-only except for `/tmp`, which is
> per-request and erased the moment the request finishes. Two directories are
> created at import time (`static/` and `static/audio/`), so on Vercel the
> function does not even start — it raises `OSError: [Errno 30] Read-only file
> system` before serving anything. Even with that worked around, a TTS clip could
> never be written and served, so voice replies would permanently have
> `tts_audio_url: null` and students would read the tutor's answers instead of
> hearing them.

Render (and Railway, Fly.io) run a normal long-lived process with a writable
disk, so the code works there exactly as it does on a laptop. Section 5 covers
the Vercel route anyway, for completeness.

---

## Part 1 — Create the database

The backend needs a Postgres database with a public connection string. Two
options:

**Neon (recommended)** — free tier, does not expire, no card. Create a project at
neon.tech and copy the connection string it gives you.

**Render Postgres** — one dashboard for everything, but the free instance is
**256MB and expires after 90 days**, after which it costs $7/month or the data is
lost. Fine for a demo, a trap for anything meant to keep running. If you use this,
create it from the Render dashboard and use its **Internal** connection string if
the backend is also on Render, or **External** if not.

Either way, the string must look like this — SQLAlchemy needs the `postgresql://`
scheme, and hosted databases need SSL, so **add `?sslmode=require` if it is not
already there**:

```
postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

Two failure modes worth knowing up front:

- A string beginning `postgres://` (no `ql`) is rejected by SQLAlchemy. Add the
  `ql`.
- Without `sslmode=require`, hosted Postgres commonly refuses the connection with
  an SSL error.

The tables are created automatically the first time the backend boots — there is
no migration step to run.

---

## Part 2 — Deploy the backend on Render

### Option A — Blueprint (one step, uses `render.yaml`)

The repository already contains `render.yaml` at its root, which describes the
service, its build and start commands, and every environment variable.

1. Push the repository to GitHub (already done).
2. In Render: **New +** → **Blueprint**.
3. Choose this repository. Render reads `render.yaml` and shows the service it
   is about to create.
4. Render prompts for the variables marked `sync: false` — paste in
   `OPENAI_API_KEY`, `DATABASE_URL` and `ALLOWED_ORIGINS` (Part 3 explains each).
   `JWT_SECRET_KEY` is generated for you.
5. **Apply**. The first build takes a few minutes.

### Option B — Manual web service

If you would rather not use the Blueprint, create a **Web Service** and set:

| Setting | Value |
|---|---|
| Language / Runtime | Python |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/` |
| Instance Type | Free |

Then add the environment variables from Part 3 by hand.

The **Root Directory must be `backend`** — the app lives there, and leaving it
blank makes the build fail to find `requirements.txt`. The start command must
bind `0.0.0.0` and use `$PORT`; Render assigns the port and a process bound to
`127.0.0.1` is unreachable from outside.

**Free-tier behaviour to expect:** the service sleeps after 15 minutes without
traffic, and the next request takes **30–50 seconds** to wake it. The frontend
will look frozen for that first call. This is normal on the free plan, not a bug.

---

## Part 3 — Environment variables

Set these on the backend host (Render → your service → Environment). Nothing here
belongs in the repository.

### Required

| Variable | Example / placeholder | What it does |
|---|---|---|
| `OPENAI_API_KEY` | `<your-provider-key>` | **Secret.** The key for whichever provider `OPENAI_BASE_URL` points at. Without it every chat, voice and transcription call fails with a `502`. |
| `DATABASE_URL` | `postgresql://...?sslmode=require` | **Secret.** The connection string from Part 1. The app refuses to start without it and says so plainly. |
| `JWT_SECRET_KEY` | `<a long random string>` | **Secret.** Signs the login tokens. Must not be the development default. The Blueprint has Render generate this. If you set it by hand, use a long random value — anyone who knows it can mint valid logins for any account. |
| `ALLOWED_ORIGINS` | `https://<your-app>.vercel.app` | The frontend URL(s) allowed to call the API, comma-separated. Must match the frontend's origin **exactly** — scheme included, no trailing slash. Wrong value = every browser request blocked by CORS while the server log shows nothing. |

### Provider and models

These select which AI service is used and which of its models. The values below
are the set the project currently runs on (Groq, via its OpenAI-compatible
endpoint). To use OpenAI itself instead, delete `OPENAI_BASE_URL` and swap in
OpenAI's model IDs (`gpt-4o`, `whisper-1`, `tts-1`,
`text-embedding-3-small`).

| Variable | Value in use | Notes |
|---|---|---|
| `OPENAI_BASE_URL` | `https://api.groq.com/openai/v1` | The OpenAI-compatible gateway. Unset = real OpenAI. |
| `CHAT_MODEL` | `openai/gpt-oss-120b` | The tutoring model. |
| `STT_MODEL` | `whisper-large-v3-turbo` | Turns the student's recording into text. |
| `TTS_MODEL` | `canopylabs/orpheus-v1-english` | Turns the answer into speech. |
| `TTS_VOICE` | `hannah` | Which voice that model uses. |
| `TTS_FORMAT` | `wav` | Must match what the provider actually emits. This model is wav-only; leaving it at the `mp3` default produces files whose extension lies about their bytes. |
| `EMBEDDING_MODEL` | *(blank)* | Blank means "this provider has no embeddings endpoint", so retrieval skips a round-trip that would fail every time. **Blank does not disable retrieval.** |
| `CHAT_TEMPERATURE` | `0.4` | Blank omits the parameter entirely, which some reasoning models require. |

**Watch the provider's daily free-tier limits.** Speech synthesis in particular
has a small daily cap that the voice feature consumes quickly; when it runs out,
voice replies keep working but arrive with `tts_audio_url: null` and no audio.

---

## Part 4 — Connect the frontend (frontend owner)

The frontend already deploys to Vercel. It needs to be told where the backend
now lives. Everything here happens on the Vercel side and needs only the Render
URL from the backend owner.

1. In Vercel → your project → **Settings** → **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<your-service>.onrender.com` |

   No trailing slash (the client strips them anyway). Use the bare Render URL,
   not a path — the app appends `/api/v1` itself.

2. **Redeploy the frontend.** This step is not optional and is easy to miss:
   `NEXT_PUBLIC_*` values are baked into the JavaScript **at build time**, so
   setting the variable alone changes nothing. Vercel → **Deployments** →
   **Redeploy**. A browser refresh will never pick it up.

3. Go back to Render and set `ALLOWED_ORIGINS` to the Vercel URL:

   ```
   ALLOWED_ORIGINS=https://<your-app>.vercel.app
   ```

   If Vercel gives you several domains (a production one and per-branch preview
   URLs), list them comma-separated, or preview deployments will fail CORS while
   production works. Saving the variable restarts the service.

If you develop locally as well, keep the local origins in the list:

```
ALLOWED_ORIGINS=http://localhost:3000,https://<your-app>.vercel.app
```

---

## Part 5 — The backend on Vercel (alternative)

Possible, but it costs the audio and needs code changes first. Only take this
route if a second platform is unacceptable.

**What works there:** text chat, the course list, progress tracking, and voice
*transcription*. FastAPI is a supported framework on Vercel, and the course
material is held in memory rather than on disk, so retrieval works.

**What cannot work:** the spoken reply. Vercel has no writable filesystem for it.

To even boot, these changes are needed (not yet made):

1. `app/main.py` — wrap the `STATIC_DIR.mkdir(...)` call so it tolerates a
   read-only filesystem, and mount `StaticFiles` only if the directory exists.
2. `app/services/audio_service.py` — same for `AUDIO_DIR.mkdir(...)`, and the
   clip-writing path has to stop writing to disk.
3. `app/db/database.py` — serverless runs many short-lived instances; the engine
   needs `poolclass=NullPool` and `pool_pre_ping=True`, or connections are
   exhausted under even light load.
4. A Vercel entrypoint (an `api/` directory or a framework preset) plus a hosted
   Postgres, since Vercel provides no database.

If the spoken reply matters, the workable version of this is to upload each clip
to object storage (Vercel Blob, Cloudflare R2) and return that absolute URL
instead of a `/static/...` path. The frontend needs **no change** for that — it
already passes absolute URLs straight through — but `audio_service` must change
from writing files to uploading them.

**Recommendation:** use Render. It is less work and loses no features.

---

## Part 6 — Verify the deployment

Run these in order; each one isolates a different failure.

```bash
# 1. The service is up. Expect {"status":"ok"}
curl https://<your-service>.onrender.com/

# 2. The API is mounted and the schema loaded.
#    Open in a browser: https://<your-service>.onrender.com/docs

# 3. The database is reachable. Expect 200 and a token.
curl -X POST https://<your-service>.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"deploy-check@example.com","password":"pass1234","name":"Deploy Check"}'

# 4. CORS. Expect the header to echo your frontend origin.
curl -i -X OPTIONS https://<your-service>.onrender.com/api/v1/modules \
  -H "Origin: https://<your-app>.vercel.app" \
  -H "Access-Control-Request-Method: GET" | grep -i access-control-allow-origin
```

Step 4 is the one that catches the most common mistake. If the header is missing,
`ALLOWED_ORIGINS` does not contain that exact origin.

Finally, open the deployed frontend, sign in, and send the tutor a question. If
the dashboard shows courses and the tutor answers, the integration is complete.

Steps 1–3 are the backend owner's; step 4 is the one to re-run after the frontend
is pointed at the API, because that is when both halves are finally talking.

---

## Part 7 — Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Every browser request fails; server log shows nothing | `ALLOWED_ORIGINS` does not contain the frontend's exact origin | Set it to the frontend URL with scheme, no trailing slash, and restart |
| Frontend still calls `127.0.0.1:8000` after setting the variable | `NEXT_PUBLIC_*` is inlined at build time | Redeploy the frontend — a refresh is not enough |
| `RuntimeError: DATABASE_URL is not set` on boot | Variable missing on the host | Add it and redeploy |
| `Expected string or URL object, got None` | Same, from inside SQLAlchemy | Same |
| SSL / connection refused from the database | Missing `?sslmode=require`, or a `postgres://` scheme | Correct the connection string |
| First request takes 30–50s, then everything is fast | Free instance sleeping | Expected on the free plan; upgrade to remove |
| Every request very slow, or connection errors under load | Serverless-style connection exhaustion, or a paused free database | Render runs a single process, so check the database first |
| `502 AI service unavailable` | Provider key wrong, out of credit, or rate-limited | Check the key and the provider's quota |
| Voice replies have no audio (`tts_audio_url: null`) | Speech synthesis failed or hit its daily quota | Expected and handled — the text answer still arrives. Check the provider quota |
| Audio plays during a session, then 404s later | Clips are deleted six hours after they are made | Expected; they are not permanent |
| Audio stops working right after a redeploy | The service's disk is wiped on deploy | Expected; the next voice answer regenerates |
