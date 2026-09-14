from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, chat, modules, student
from app.core.config import REPO_ROOT
from app.db.database import Base, engine
from app.models import progress, user  # noqa: F401 — registers tables with SQLAlchemy

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduBridge AI Backend")

# Browsers treat localhost and 127.0.0.1 as distinct origins, so allowing only
# one makes the other fail CORS with a confusing console error.
ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Absolute path: StaticFiles resolves a relative directory against the CWD, so
# the old "static" only worked when the process happened to be started from
# backend/. Resolving against the repo root makes it CWD-independent and puts
# the audio files where the README's tree says they live.
STATIC_DIR = REPO_ROOT / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(modules.router, prefix="/api/v1/modules", tags=["modules"])
app.include_router(student.router, prefix="/api/v1/student", tags=["student"])


@app.get("/")
def health_check():
    return {"status": "ok"}
