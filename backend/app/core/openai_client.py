from functools import lru_cache

from openai import OpenAI

from app.core.config import settings


@lru_cache(maxsize=1)
def get_openai_client() -> OpenAI:
    """Build the OpenAI client on first use.

    This used to be a module-level `OpenAI(api_key=...)` in each service, which
    meant a missing or malformed OPENAI_API_KEY raised at import time and took
    down the entire app — including routes that never touch OpenAI (the health
    check, auth, progress). Constructing it lazily keeps those routes working
    and lets the chat routes turn the failure into a clean 502 instead.
    """
    if not settings.OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Copy backend/.env.example to backend/.env and fill it in."
        )
    # base_url=None falls through to the SDK's default OpenAI endpoint, so the
    # same client serves the real API and any OpenAI-compatible gateway.
    return OpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.OPENAI_BASE_URL)
