from pydantic import BaseModel
from typing import List, Optional, Literal

# ---- Shared ----

class ChatHistoryItem(BaseModel):
    role: Literal["ai", "user"]
    content: str

# ---- 1. Text Chat ----

class ChatTextRequest(BaseModel):
    student_id: str
    module_id: str
    language: Literal["English", "Pidgin"]
    message: str
    chat_history: List[ChatHistoryItem] = []

class ChatTextResponse(BaseModel):
    status: str
    response_text: str
    latex_content: bool = False

# ---- 2. Voice Chat ----
# Note: audio_file comes in as multipart/form-data, not JSON body,
# so this model covers the response only. The route handles the file upload separately.

class ChatVoiceResponse(BaseModel):
    status: str
    transcription: str
    response_text: str
    tts_audio_url: str
    trigger_3d_animation: Optional[str] = None

# ---- 3. Student Progress ----

class ProgressRequest(BaseModel):
    student_id: str
    module_id: str
    time_spent_seconds: int
    completion_percentage: float

class ProgressResponse(BaseModel):
    status: str