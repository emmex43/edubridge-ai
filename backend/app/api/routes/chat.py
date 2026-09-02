from fastapi import APIRouter, UploadFile, File, Form
from app.models.schemas import ChatTextRequest, ChatTextResponse, ChatVoiceResponse

router = APIRouter()

@router.post("/text", response_model=ChatTextResponse)
def chat_text(payload: ChatTextRequest):
    # TODO: replace with real llm_service + rag_service call
    return ChatTextResponse(
        status="success",
        response_text=f"(placeholder) You asked: {payload.message}",
        latex_content=False
    )

@router.post("/voice", response_model=ChatVoiceResponse)
async def chat_voice(
    audio_file: UploadFile = File(...),
    language: str = Form(...),
    student_id: str = Form(...)
):
    # TODO: replace with real audio_service (STT) + llm_service + audio_service (TTS) calls
    return ChatVoiceResponse(
        status="success",
        transcription="(placeholder transcription)",
        response_text="(placeholder response)",
        tts_audio_url="https://example.com/placeholder.mp3",
        trigger_3d_animation=None
    )