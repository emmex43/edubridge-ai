import logging

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.security import get_current_user
from app.models.schemas import ChatTextRequest, ChatTextResponse, ChatVoiceResponse
from app.services import audio_service, llm_service, rag_service

logger = logging.getLogger(__name__)
router = APIRouter()

# Markers that mean the answer contains math the frontend must render with
# KaTeX. latex_content used to be hardcoded False, so the frontend never
# enabled math rendering even for clearly LaTeX answers.
#
# A bare "$" is deliberately NOT in this list: in an engineering answer it is a
# currency sign far more often than a math delimiter ("the vessel costs $5000"),
# and matching it switched KaTeX on for prose. Inline dollar math is caught by
# the pairing check below instead.
_LATEX_MARKERS = (
    "\\(",
    "\\[",
    "$$",
    "\\begin{",
    "\\frac",
    "\\sum",
    "\\int",
    "\\sqrt",
    "\\alpha",
    "\\beta",
    "\\theta",
    "\\lambda",
    "\\Delta",
)


def _has_latex(text: str) -> bool:
    if any(marker in text for marker in _LATEX_MARKERS):
        return True
    # "$...$" only counts as math when the dollars actually pair up.
    return text.count("$") >= 2


def _answer(message: str, language: str, module_id: str, chat_history: list) -> dict:
    """Shared RAG-then-LLM path used by both the text and voice routes."""
    context = rag_service.retrieve_context(module_id, message) if module_id else ""
    return llm_service.generate_response(message, language, context, chat_history)


@router.post("/text", response_model=ChatTextResponse)
def chat_text(payload: ChatTextRequest, user=Depends(get_current_user)):
    try:
        result = _answer(
            payload.message,
            payload.language,
            payload.module_id,
            [h.model_dump() for h in payload.chat_history],
        )
    except Exception:
        # An OpenAI outage or an expired key used to surface as an unhandled
        # stack trace and a bare 500. Log the detail, return something the
        # frontend can actually display.
        logger.exception("chat/text failed for module_id=%s", payload.module_id)
        raise HTTPException(status_code=502, detail="AI service unavailable, please retry")

    return ChatTextResponse(
        status="success",
        response_text=result["response_text"],
        latex_content=_has_latex(result["response_text"]),
        trigger_3d_animation=result.get("trigger_3d_animation"),
    )


@router.post("/voice", response_model=ChatVoiceResponse)
async def chat_voice(
    audio_file: UploadFile = File(...),
    language: str = Form(...),
    # Accepted for wire compatibility with the documented multipart payload,
    # never trusted: identity comes from the token. Optional for the same
    # reason as the text route — a client that omits a field the server
    # ignores should not be 422'd over it.
    student_id: str = Form(default=""),
    # The README's multipart spec lists only audio_file, language and
    # student_id. Requiring module_id here meant any client built to the docs
    # got a 422, so it stays optional and RAG is skipped when it's absent.
    module_id: str = Form(default=""),
    user=Depends(get_current_user),
):
    audio_bytes = await audio_file.read()

    try:
        transcription = audio_service.transcribe_audio(audio_bytes, audio_file.filename)
    except Exception:
        logger.exception("voice transcription failed")
        raise HTTPException(status_code=502, detail="Could not transcribe the audio")

    try:
        result = _answer(transcription, language, module_id, [])
    except Exception:
        logger.exception("chat/voice LLM failed for module_id=%s", module_id)
        raise HTTPException(status_code=502, detail="AI service unavailable, please retry")

    # A TTS failure must not cost the student the answer itself.
    try:
        tts_url = audio_service.synthesize_speech(result["response_text"])
    except Exception:
        logger.exception("TTS synthesis failed")
        tts_url = None

    return ChatVoiceResponse(
        status="success",
        transcription=transcription,
        response_text=result["response_text"],
        tts_audio_url=tts_url,
        trigger_3d_animation=result.get("trigger_3d_animation"),
    )
