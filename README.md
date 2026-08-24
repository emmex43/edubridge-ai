# EduBridge AI 🌍📚

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20%7C%20TailwindCSS%20%7C%20Three.js-blue)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-green)](https://fastapi.tiangolo.com/)
[![AI-Orchestration](https://img.shields.io/badge/AI-Gemini%20%7C%20Whisper%20%7C%20Deepgram-purple)](#system-architecture)

> **Empowering African students through hyper-personalized, curriculum-grounded, interactive AI learning.**

---

## 📖 Table of Contents

- [Vision & Mission](#-vision--mission)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Cost & Performance Engineering](#-cost--performance-engineering)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Vision & Mission

Education across Africa is frequently constrained by overcrowded classrooms, high tutoring costs, and static digital content that consumes heavy mobile bandwidth without fostering true critical thinking. 

**EduBridge AI** is building an educational operating system that moves students from rote memorization to deep conceptual understanding. By combining Retrieval-Augmented Generation (RAG) anchored to local curricula with code-driven 2D/3D visual simulations, EduBridge delivers real-time, low-latency, and culturally grounded tutoring directly to mid-range mobile devices.

---

## 🚀 Key Features

* **Interactive "Pause & Ask" Tutor:** Students can pause any lesson to ask questions via text or voice. The interface stays in place, providing instant grounded explanations without breaking learning context.
* **Curriculum-Grounded AI:** Powered by vector databases embedded strictly with regional curricula (WAEC, JAMB, university syllabi) to eliminate AI hallucinations.
* **Code-Driven Micro-Simulations:** Renders 2D/3D interactive models (physics, engineering, fashion pattern drafting) in-browser using WebGL/Three.js instead of heavy, bandwidth-draining video streams.
* **Cognitive Profiling & Localization:** Dynamically adjusts explanation tone, difficulty, and language based on the student's mastery profile.

---

## 🏗️ System Architecture

```text
                      ┌──────────────────────────────────────────────┐
                      │             Next.js Web Client               │
                      │  • Tailwind CSS Design System                │
                      │  • Three.js WebGL Interactive Canvases       │
                      │  • Web Audio API (Voice Recorder)            │
                      └──────────────────────┬───────────────────────┘
                                             │
                             HTTPS / WebSockets (SSE)
                                             │
                      ┌──────────────────────▼───────────────────────┐
                      │          FastAPI Application Gateway         │
                      │  • Rate Limiting & Auth                      │
                      │  • Session State & Cognitive Profiler        │
                      │  • Semantic Cache (Redis)                    │
                      └──────────────────────┬───────────────────────┘
                                             │
                 ┌───────────────────────────┴───────────────────────────┐
                 │                                                       │
  ┌──────────────▼──────────────┐                         ┌──────────────▼──────────────┐
  │   Curriculum Knowledge RAG  │                         │     AI Model Orchestration  │
  │  • Vector DB (Chroma/Qdrant)│                         │  • Reasoning: Gemini Flash  │
  │  • Dense Text Embeddings    │                         │  • STT: OpenAI Whisper      │
  │  • Syllabus Text Chunks     │                         │  • TTS: Deepgram Aura-2     │
  └─────────────────────────────┘                         └─────────────────────────────┘


## Folder Structure
edubridge-ai/
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       └── backend-ci.yml
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── auth.py
│   │   │   │   │   ├── tutor.py         # "Pause & Ask" endpoint
│   │   │   │   │   └── curriculum.py
│   │   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── models/                      # Database models (PostgreSQL)
│   │   ├── schemas/                     # Pydantic validation schemas
│   │   └── services/
│   │       ├── rag_engine.py            # Retrieval & chunking logic
│   │       ├── vector_store.py          # Vector DB interface
│   │       ├── llm_service.py           # Gemini/OpenAI API orchestration
│   │       ├── voice_service.py         # STT (Whisper) & TTS (Deepgram)
│   │       └── cache_service.py         # Redis semantic caching
│   ├── curriculum_data/                 # Raw/processed syllabus files
│   ├── scripts/
│   │   └── ingest_curriculum.py         # Embedding generation script
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── public/
│   │   └── models/                      # 3D assets (.gltf / .glb)
│   ├── src/
│   │   ├── app/                         # Next.js App Router
│   │   ├── components/
│   │   │   ├── ui/                      # Base UI design system (buttons, modals)
│   │   │   ├── tutor/                   # "Pause & Ask" overlay & audio player
│   │   │   └── interactive/             # Three.js / Canvas WebGL simulations
│   │   ├── hooks/
│   │   │   ├── useAudioRecorder.ts      # Voice query handling
│   │   │   └── useTutorStream.ts        # WebSocket/SSE streaming hook
│   │   ├── lib/
│   │   │   └── api.ts                   # Backend API client
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docs/
│   ├── ARCHITECTURE.md
│   └── API_SPEC.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── LICENSE
└── README.md