```markdown
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
│   │       ├── chat.py          # Routes for /api/v1/chat/text and /api/v1/chat/voice
│   │       └── student.py       # Routes for progress tracking and module history
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

---

## 🔗 Backend API Contracts (Integration Guide)

The Next.js frontend operates on a decoupled client-server architecture. It expects a backend (e.g., Python FastAPI or Django) to handle the AI logic, Retrieval-Augmented Generation (RAG), and database persistence.

The backend engineering team must expose the following RESTful endpoints:

### 1. Text Chat Endpoint

Processes standard text queries and returns a Socratic response tailored to the selected language.

* **Endpoint:** `POST /api/v1/chat/text`
* **Request Payload (JSON):**
```json
{
  "student_id": "user_123",
  "module_id": "module_4_spatial",
  "language": "Pidgin", 
  "message": "Explain the governing equations for this dynamic state.",
  "chat_history": [
    {"role": "ai", "content": "Hello! I can help you model this system."},
    {"role": "user", "content": "What is Fourier series?"}
  ]
}

```


* **Response Payload (JSON):**
```json
{
  "status": "success",
  "response_text": "I don hear your question. Make we check the equation...",
  "latex_content": true
}

```



### 2. Voice Processing Endpoint

Receives native browser audio blobs, transcribes the speech (STT), processes the query, and returns both text and a Text-to-Speech (TTS) audio URL.

* **Endpoint:** `POST /api/v1/chat/voice`
* **Request Payload (`multipart/form-data`):**
* `audio_file`: The `audio/webm` Blob captured by the frontend MediaRecorder.
* `language`: String ("English" | "Pidgin")
* `student_id`: String


* **Response Payload (JSON):**
```json
{
  "status": "success",
  "transcription": "What is the pressure in the batch reactor?",
  "response_text": "The pressure increases proportionally with temperature...",
  "tts_audio_url": "[https://storage.googleapis.com/edubridge/audio/response_892.mp3](https://storage.googleapis.com/edubridge/audio/response_892.mp3)",
  "trigger_3d_animation": "highlight_reactor_core"
}

```



### 3. Progress Tracking Endpoint

Updates the student's dashboard metrics when they interact with a module.

* **Endpoint:** `PUT /api/v1/student/progress`
* **Request Payload (JSON):**
```json
{
  "student_id": "user_123",
  "module_id": "module_4_spatial",
  "time_spent_seconds": 1240,
  "completion_percentage": 85
}

```



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

```

