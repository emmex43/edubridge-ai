
# EduBridge AI: Interactive 3D STEM Platform

EduBridge AI is a Next.js-powered educational platform designed to make complex science and engineering concepts highly interactive. It combines a WebGL 3D model viewer with a multimodal AI tutoring interface, allowing students to inspect systems spatially while asking questions via text or voice.

## 🚀 Features

*   **Interactive 3D WebGL Canvas:** Built with React Three Fiber, featuring a `.gltf` / `.glb` model loader, dynamic environment lighting, orbit controls, and a native fullscreen mode for detailed asset inspection.
*   **Multimodal AI Tutor Drawer:** A responsive sliding overlay utilizing Zustand for state management.
*   **Native Voice Input:** Integrates the browser's MediaRecorder API to capture student audio queries (`audio/webm`) with a live pulsing recording UI and timer.
*   **Dynamic Audio Playback:** Simulated CSS waveform visualizer for playing back AI Text-to-Speech (TTS) responses.
*   **Student Dashboard:** A responsive grid layout tracking module progress and study time metrics.
*   **Complete Auth Flow:** Clean, modern Sign-In and Sign-Up user interfaces.

## 🛠️ Tech Stack

*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand
*   **3D Rendering:** Three.js & `@react-three/fiber`
*   **3D Helpers:** `@react-three/drei`
*   **Icons:** Lucide React

## 📦 Local Development Setup

1. Clone the repository and navigate to the frontend directory:
   ```bash
   git clone <repository-url>
   cd frontend

```

2. Install the dependencies:
```bash
npm install

```


*(Note: Ensure you install `@react-three/fiber`, `@react-three/drei`, `three`, and `zustand` if not already present in package.json).*
3. Run the development server:
```bash
npm run dev

```


4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔗 Backend Integration Architecture (Pending)

This frontend is configured to interface with a FastAPI backend. The Next.js application expects the following endpoints to be established by the backend engineering team:

* `POST /api/chat`: Accepts structured JSON (text prompt + chat history).
* `POST /api/voice`: Accepts `FormData` containing an `audio/webm` Blob.
* **Unified Response Schema:** Both endpoints must return JSON instructing the frontend on chat text, audio TTS URLs, and 3D simulation parameter updates.

