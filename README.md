# EduBridge AI: Interactive 3D STEM Learning Platform

EduBridge AI is a multimodal, Next.js-powered educational platform designed to make complex science and engineering concepts highly interactive. It bridges the gap in technical skills education by combining immersive 3D WebGL modeling with an adaptive AI tutoring interface.

## 🎯 Platform Vision & Workstreams

The platform architecture is designed to support a three-tier content strategy:
1.  **Content & Scripting:** Structured STEM curricula (e.g., Process Systems Engineering, Applied Thermodynamics).
2.  **AI Virtual Instructor:** Pre-recorded, AI-generated lesson videos integrated directly into the learning dashboard.
3.  **Interactive AI Tutor (This Repository):** A Socratic AI assistant featuring a 3D WebGL sandbox, real-time voice interaction, and language adaptation (English & Pidgin) to accommodate different student comprehension levels.

---

## 🛠️ Tech Stack (Frontend)

*   **Framework:** Next.js 16 (App Router, Turbopack)
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand
*   **3D Rendering:** Three.js, `@react-three/fiber`, `@react-three/drei`
*   **Markdown & Math:** `react-markdown`, `rehype-katex`, `remark-math`
*   **Icons:** Lucide React
*   **Deployment:** Vercel

---

## 📂 Complete Folder Structure

```text
edubridge-ai/
├── public/
│   └── models/
│       └── sample.glb               # 3D assets for the WebGL canvas
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root Next.js layout
│   │   ├── page.tsx                 # Landing / Auth routing
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Student dashboard (Course Grid, Progress Tracking)
│   │   └── learn/
│   │       └── page.tsx             # Split-screen UI (AI Video Player + 3D Sandbox)
│   ├── components/
│   │   ├── interactive/
│   │   │   ├── CanvasLoader.tsx     # Loading fallback for heavy 3D models
│   │   │   └── ModelViewer.tsx      # React Three Fiber canvas & Fullscreen logic
│   │   └── tutor/
│   │       ├── AudioPlayer.tsx      # CSS waveform visualizer for AI TTS playback
│   │       ├── FormattedMessage.tsx # Markdown and LaTeX parser for AI responses
│   │       └── PauseAndAskOverlay.tsx # Slide-out Zustand chat drawer & Language Toggle
│   ├── hooks/
│   │   └── useAudioRecorder.ts      # Native MediaRecorder API for Voice-to-Text
│   └── store/
│       └── useTutorStore.ts         # Zustand global state (Chat history, Typing indicators, Localization)
├── next.config.ts
├── tailwind.config.ts
└── package.json

```

### Complete Folder Structure (Backend - FastAPI)

The backend is designed using a service-oriented architecture to keep the AI generation logic separate from the API routing.

```text
backend/
├── app/
│   ├── main.py                  # FastAPI application instance and CORS setup
│   ├── api/
│   │   └── routes/              # API endpoints
│   │       ├── auth.py          # Routes for /api/v1/auth/register, /login and /me
│   │       ├── chat.py          # Routes for /api/v1/chat/text and /api/v1/chat/voice
│   │       ├── modules.py       # Route for the /api/v1/modules course catalogue
│   │       └── student.py       # Routes for progress tracking (read and write)
│   ├── core/
│   │   ├── config.py            # Environment variables (API keys, DB credentials)
│   │   └── security.py          # Authentication and token validation
│   ├── models/
│   │   └── schemas.py           # Pydantic models for strict request/response validation
│   ├── services/
│   │   ├── llm_service.py       # Core AI logic (Prompt engineering, Language adaptation)
│   │   ├── rag_service.py       # Vector database retrieval (Knowledge base integration)
│   │   └── audio_service.py     # Speech-to-Text (STT) and Text-to-Speech (TTS) logic
│   └── db/
│       └── database.py          # Database connection pooling (e.g., PostgreSQL/MongoDB)
├── requirements.txt             # Python dependencies (fastapi, uvicorn, langchain, etc.)
└── .env                         # Environment variables (Not tracked in Git)
```

---

## 🔗 Backend API Contracts (Integration Guide)

The frontend and the backend are two separate applications that talk over HTTP.
This section is the contract between them. Everything documented here is **built
and running** in `backend/` — it describes the API that exists, it is not a
request for one. All paths below are relative to `/api/v1`.

### Before you call anything: you need a token

`POST /auth/register` and `POST /auth/login` (see [Accounts](#0-accounts)) are the
only two endpoints that do **not** need a token, because they are how you get one.
Both reply with an `access_token`.

Send that token on **every other request**, in this header:

```
Authorization: Bearer eyJhbGciOi...
```

If the header is missing, or the token has expired or is malformed, the server
replies `401`. So: save the token when the student signs in, send it on every
call, and throw it away when you get a `401`. The browser does not keep it across
a page refresh on its own — call `GET /auth/me` when the app loads to find out
whose token you are holding.

**The one thing you never send is a student id.** Older payloads included a
`student_id` field on chat and progress. The server still accepts it so those
clients keep working, but it ignores the value completely and always uses the id
from the token instead. Sending it is harmless and omitting it is fine — just
never use it to decide whose data you are reading or writing.

### Every error has a `detail` field — but it is not always a string

Check the status code, not only `detail`:

| Status | `detail` is | What happened | What the client should do |
|---|---|---|---|
| `400` | a string | The request was understood but refused — e.g. `"Email already registered"` | Show `detail` to the student |
| `401` | a string | No token, an expired one, or wrong credentials | Send the student to sign-in |
| `422` | **a list of objects** | The payload was the wrong shape — e.g. `language` was `"French"` | A bug in the client. Fix the request; do not show it to the student |
| `502` | a string | The AI provider could not be reached | Offer a retry. This is not a bug. |

A `422` really looks like this — note that `detail` is an **array**, so code like
`detail.toLowerCase()` will throw on it:

```json
{
  "detail": [
    {
      "type": "literal_error",
      "loc": ["body", "language"],
      "msg": "Input should be 'English' or 'Pidgin'",
      "input": "French"
    }
  ]
}
```

### 0. Accounts

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/auth/register` | Create an account; returns a token |
| `POST /api/v1/auth/login` | Exchange credentials for a token |
| `GET /api/v1/auth/me` | Resolve the token's owner (used after a page refresh) |

**Register — request:**
```json
{
  "email": "student@uniben.edu",
  "password": "pass1234",
  "name": "Ada Okafor"
}
```

`name` is optional. A duplicate email returns `400` `"Email already registered"`.

**Token response** — register and login both return this shape:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": { "id": 5, "email": "student@uniben.edu", "name": "Ada Okafor" }
}
```

Wrong credentials return `401` `"Invalid email or password"`.

`GET /api/v1/auth/me` returns the `user` object on its own. Login already returns
the student, but a page refresh discards that response — this is how the client
re-learns who it is holding a token for.

---

### 1. Text Chat Endpoint

Processes standard text queries and returns a Socratic response tailored to the selected language.

* **Endpoint:** `POST /api/v1/chat/text`
* **Headers:** `Authorization: Bearer <access_token>`
* **Request Payload (JSON):**
```json
{
  "module_id": "module_4_spatial",
  "language": "Pidgin", 
  "message": "Explain the governing equations for this dynamic state.",
  "chat_history": [
    {"role": "ai", "content": "Hello! I can help you model this system."},
    {"role": "user", "content": "What is Fourier series?"}
  ]
}

```

* `module_id` is optional. With a module, the answer is grounded in that
  module's course material; without one the tutor still answers, just without
  retrieval. The same applies to `/chat/voice`.
* `language` must be exactly `"English"` or `"Pidgin"`; any other value is a `422`.
* `chat_history` roles are `"ai"` and `"user"`. The server maps `"ai"` to the
  model's `assistant` role — send `"ai"`, not `"assistant"`.
* Expect roughly 1–4 seconds of latency; clients should show a loading state.

* **Response Payload (JSON):**
```json
{
  "status": "success",
  "response_text": "I don hear your question. Make we check the equation...",
  "latex_content": true,
  "trigger_3d_animation": "highlight_reactor_core"
}
```

* `latex_content` is a hint for the client: when `true`, render `response_text`
  with the KaTeX pipeline. Answers use `\( ... \)` and `\[ ... \]` delimiters.
  A bare `$` is not treated as math, since engineering answers mention prices.
* `trigger_3d_animation` is the name of a highlight to play, or `null`. It is
  frequently `null` — treat that as "nothing to highlight", not as an error, and
  never gate the answer on it. The tag is stripped from `response_text` before
  it is returned. The recognised values are:

  `highlight_reactor_core`, `highlight_vessel_wall`, `highlight_inlet_stream`,
  `highlight_outlet_stream`, `highlight_pressure_gauge`,
  `highlight_temperature_probe`, `highlight_waveform`,
  `highlight_frequency_spectrum`

  Any value outside that list is dropped server-side and returned as `null`.

---

### 2. Voice Processing Endpoint

Receives native browser audio blobs, transcribes the speech (STT), processes the query, and returns both text and a Text-to-Speech (TTS) audio URL.

* **Endpoint:** `POST /api/v1/chat/voice`
* **Headers:** `Authorization: Bearer <access_token>`
* **Request Payload (`multipart/form-data`):**
* `audio_file`: The `audio/webm` Blob captured by the frontend MediaRecorder.
* `language`: String ("English" | "Pidgin")
* `student_id`: String (optional; ignored — see the note above)
* `module_id`: String (optional; RAG grounding is skipped when absent)


* **Response Payload (JSON):**
```json
{
  "status": "success",
  "transcription": "What is the pressure in the batch reactor?",
  "response_text": "The pressure increases proportionally with temperature...",
  "tts_audio_url": "/static/audio/response_892.wav",
  "trigger_3d_animation": "highlight_reactor_core"
}
```

* `tts_audio_url` is a **relative path on the API host**, served from the same
  origin as the endpoints — prefix it with the configured base URL before handing
  it to an audio element. It is `null` when synthesis failed; fall back to showing
  `response_text` rather than treating the exchange as broken.
* The extension always matches the real bytes.
* The server deletes rendered clips after six hours, so a `tts_audio_url` is not
  permanent — play it during the lesson rather than saving it for later.

---

### 3. Progress Tracking Endpoint

Updates the student's dashboard metrics when they interact with a module.

* **Endpoint:** `PUT /api/v1/student/progress`
* **Headers:** `Authorization: Bearer <access_token>`
* **Request Payload (JSON):**
```json
{
  "module_id": "module_4_spatial",
  "time_spent_seconds": 1240,
  "completion_percentage": 85
}

```

Saves progress for one student on one module: **one row per student per module**.
Sending it again for the same module updates that row instead of adding a second
one, so it is safe to call repeatedly. The response echoes back what was stored,
alongside `status`.

**Reading progress back:**

* **Endpoint:** `GET /api/v1/student/progress`
* **Headers:** `Authorization: Bearer <access_token>`
* **Query:** `module_id` (optional) — narrows the result to one module.

```json
{
  "status": "success",
  "progress": [
    { "module_id": "module_2_thermo",  "time_spent_seconds": 600,
      "completion_percentage": 40.0, "updated_at": "2026-09-14T12:55:03" },
    { "module_id": "module_4_spatial", "time_spent_seconds": 1240,
      "completion_percentage": 85.0, "updated_at": "2026-09-14T13:01:44" }
  ]
}
```

Sum `time_spent_seconds` for total study time and average
`completion_percentage` for overall progress. A new account returns an empty
list.

---

### 4. Course Catalogue Endpoint

The dashboard's course grid hardcoded both the module ids and their titles, so
the ids it sent to chat and progress were maintained by hand against the course
material. An id with no material behind it makes the tutor answer "no course
material found" with no visible error, so the list is served from the same place
the material lives.

* **Endpoint:** `GET /api/v1/modules`
* **Headers:** `Authorization: Bearer <access_token>`

```json
{
  "status": "success",
  "modules": [
    { "id": "module_2_thermo", "number": 2, "title": "Batch Pyrolysis Reactors",
      "course": "Applied Thermodynamics",
      "label": "Module 2: Batch Pyrolysis Reactors" },
    { "id": "module_4_spatial", "number": 4, "title": "Spatial Model Viewer",
      "course": "Process Systems Engineering",
      "label": "Module 4: Spatial Model Viewer" },
    { "id": "module_6_fourier", "number": 6, "title": "Fourier Series Expansions",
      "course": "Numerical Methods & Algorithms",
      "label": "Module 6: Fourier Series Expansions" }
  ]
}
```

* `id` is what the client sends as `module_id` on `/chat/text`, `/chat/voice`
  and `/student/progress`.
* `course` is the card heading; `label` is the chip, already formatted — render
  it as-is rather than rebuilding `Module N: Title`.
* Only modules with material are listed, so every `id` returned here is safe to
  send. Adding material to the backend adds a card here automatically.
* Sorted by `id`, so the grid order is stable between requests.



---

## 🚀 Local Development

1. Clone the repository:
```bash
git clone [https://github.com/emmex43/edubridge-ai.git](https://github.com/emmex43/edubridge-ai.git)
cd edubridge-ai

```


2. Install dependencies (includes Three.js, Zustand, and Markdown parsers):
```bash
npm install

```


3. Run the development server:
```bash
npm run dev

```


4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The dashboard, tutor and progress tracking need the API below; without it the
client shows an offline banner rather than failing.

---

## ⚙️ Running the Backend

1. Create `backend/.env` from the template:
```bash
cd backend
cp .env.example .env
```
Fill in the API key and the database URL; `backend/.env.example` documents every
setting next to its default. `.env` is gitignored and must never be committed.

2. Start it — the tables are created on first boot:
```powershell
.\start_server.ps1            # foreground, output visible
.\start_server.ps1 -Reload    # auto-reload while developing
```

3. The API is on [http://127.0.0.1:8000](http://127.0.0.1:8000) and its
   interactive docs are at `/docs`.

### Tests

```powershell
.\run_test.bat          # offline suite -- the model is stubbed, free and fast
.\run_test.bat live     # adds the end-to-end tests against the real provider
```

The default suite is **offline**: the model provider is stubbed, so it needs no
key and spends nothing. The tests that really call the provider are marked `live`
and are deselected by default; they need a valid key and cost credits.

### Frontend API URL

The client reads `NEXT_PUBLIC_API_URL` from `frontend/.env` and falls back to
`http://127.0.0.1:8000`, which is correct for local development. `NEXT_PUBLIC_*`
values are inlined at build time, so changing one needs a dev-server restart —
a browser refresh will not pick it up.

