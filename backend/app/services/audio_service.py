import io
import logging
import time
import uuid

from app.core.config import REPO_ROOT, settings
from app.core.openai_client import get_openai_client

logger = logging.getLogger(__name__)

# Absolute, for the same CWD-independence reason as the static mount in main.py.
# This is also the directory main.py serves at /static.
AUDIO_DIR = REPO_ROOT / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Rendered clips are disposable once the client has played them, and nothing
# ever removed them: each voice answer writes a fresh file and Orpheus returns
# roughly 1.4 MB of wav, so the directory grew without bound on a long-running
# server. Six hours is far longer than any client needs to fetch its answer.
AUDIO_TTL_SECONDS = 6 * 60 * 60


def _prune_audio_dir(now: float) -> None:
    """Delete rendered clips older than AUDIO_TTL_SECONDS."""
    for path in AUDIO_DIR.glob("*"):
        try:
            if now - path.stat().st_mtime > AUDIO_TTL_SECONDS:
                path.unlink()
        except OSError:
            # A file being read by an in-flight download is expected here;
            # the next request gets it.
            logger.debug("could not prune %s", path, exc_info=True)


def transcribe_audio(file_bytes: bytes, filename: str) -> str:
    audio_file = io.BytesIO(file_bytes)
    # Whisper infers the container format from the filename, so this must be
    # carried over from the upload rather than defaulting to something generic.
    audio_file.name = filename
    result = get_openai_client().audio.transcriptions.create(
        model=settings.STT_MODEL, file=audio_file
    )
    return result.text


def synthesize_speech(text: str) -> str:
    """Render `text` to an audio file under static/audio and return its URL path."""
    # The extension follows the configured container rather than assuming mp3:
    # Groq's Orpheus model documents wav only, so a hardcoded ".mp3" would hand
    # the frontend bytes whose extension lies about their format.
    _prune_audio_dir(time.time())

    file_id = f"{uuid.uuid4()}.{settings.TTS_FORMAT}"
    # with_streaming_response, not the plain .create(): only the streaming
    # variant returns a response whose stream_to_file() actually streams. On the
    # non-streaming call the SDK has already buffered the whole body into memory
    # before the method is reached, so "streaming" it to disk was a copy -- which
    # is why that path is deprecated.
    with get_openai_client().audio.speech.with_streaming_response.create(
        model=settings.TTS_MODEL,
        voice=settings.TTS_VOICE,
        input=text,
        response_format=settings.TTS_FORMAT,
    ) as response:
        response.stream_to_file(AUDIO_DIR / file_id)
    # Relative to the API host — the frontend prefixes its configured base URL.
    return f"/static/audio/{file_id}"
