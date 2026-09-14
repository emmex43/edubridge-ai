import os
from pathlib import Path

from dotenv import load_dotenv

# backend/app/core/config.py -> backend/
BACKEND_DIR = Path(__file__).resolve().parents[2]
# backend/ -> repo root
REPO_ROOT = BACKEND_DIR.parent

# Pin the .env location instead of relying on the CWD. load_dotenv() with no
# argument searches upward from wherever the process happened to start, so
# launching the server from the repo root loaded nothing and silently left
# every setting at its default (including an empty API key).
load_dotenv(BACKEND_DIR / ".env")


def _optional_float(name: str, default: str) -> float | None:
    """Read a float env var, where an explicitly blank value means "omit it"."""
    raw = os.getenv(name, default).strip()
    return float(raw) if raw else None


class Settings:
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")

    # Point the OpenAI SDK at any OpenAI-compatible gateway (AgentRouter,
    # OpenRouter, a local vLLM, ...) by setting OPENAI_BASE_URL. Unset -> the
    # real OpenAI API, since the SDK reads None as "use the default endpoint".
    OPENAI_BASE_URL: str | None = os.getenv("OPENAI_BASE_URL") or None

    # Model IDs are provider-specific: AgentRouter exposes claude-opus-5,
    # gpt-5.6-sol, glm-5.3, ... while OpenAI exposes gpt-4o, whisper-1, tts-1.
    # Keeping them here makes a provider switch a .env edit instead of a code
    # change in three service files.
    CHAT_MODEL: str = os.getenv("CHAT_MODEL", "gpt-4o")
    CHAT_TEMPERATURE: float | None = _optional_float("CHAT_TEMPERATURE", "0.4")
    STT_MODEL: str = os.getenv("STT_MODEL", "whisper-1")
    TTS_MODEL: str = os.getenv("TTS_MODEL", "tts-1")
    TTS_VOICE: str = os.getenv("TTS_VOICE", "alloy")
    # Groq's docs contradict themselves on the default (the parameter says mp3,
    # the returns section says wav), so pin it rather than inherit the ambiguity.
    TTS_FORMAT: str = os.getenv("TTS_FORMAT", "mp3")
    # Blank means "this provider has no embeddings endpoint" (Groq has none).
    # RAG then skips the round-trip instead of failing one call per request.
    EMBEDDING_MODEL: str | None = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small") or None

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-change-this")
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")

    # Browser origins allowed to call this API, comma-separated. A deployed
    # frontend lives on a different origin from a deployed API (Vercel vs
    # Render), and browsers block cross-origin calls by default -- so this has
    # to be settable per environment. It used to be hardcoded to localhost,
    # which blocked every deployed frontend with a browser console error and
    # nothing at all in the server log to explain it.
    #
    # List the origins explicitly rather than using "*": the middleware sets
    # allow_credentials=True, and browsers reject a wildcard combined with
    # credentials, so "*" would fail everywhere instead of only where intended.
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
        if origin.strip()
    ]

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24


settings = Settings()

# Fail loudly and early. Without this, a missing DATABASE_URL surfaced as
# SQLAlchemy's "Expected string or URL object, got None" from deep inside
# create_engine, which gives no hint about what to actually fix.
if not settings.DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill it in."
    )
