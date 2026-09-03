from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import chat, student, auth
from app.db.database import Base, engine
from app.models import user, progress  # noqa: F401 — needed so SQLAlchemy registers these tables

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduBridge AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(student.router, prefix="/api/v1/student", tags=["student"])

@app.get("/")
def health_check():
    return {"status": "ok"}