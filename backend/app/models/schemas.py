from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel

# ---- Shared ----


class ChatHistoryItem(BaseModel):
    role: Literal["ai", "user"]
    content: str


# ---- 1. Text Chat ----


class ChatTextRequest(BaseModel):
    # Accepted for parity with the documented payload, but never trusted: chat
    # is keyed off the token. Optional so a client that omits it is not 422'd
    # over a field the server ignores anyway.
    student_id: Optional[str] = None
    # Optional, matching the voice route: with no module open the tutor still
    # answers, just without RAG grounding. It used to be required here while
    # being optional on /chat/voice, so a client that could omit it for voice
    # got a 422 for text — which is exactly what a free-exploration session
    # (no module chosen yet) sends.
    module_id: Optional[str] = None
    language: Literal["English", "Pidgin"]
    message: str
    chat_history: List[ChatHistoryItem] = []


class ChatTextResponse(BaseModel):
    status: str
    response_text: str
    latex_content: bool = False
    # Parsed out of the model's trailing [ANIMATE:...] tag. The LLM service has
    # always computed this; the route just used to throw it away, so the 3D
    # sandbox never received a highlight instruction for text chat.
    trigger_3d_animation: Optional[str] = None


# ---- 2. Voice Chat ----
# The request arrives as multipart/form-data (see the route), so this model
# covers the response only — the uploaded file is handled separately.


class ChatVoiceResponse(BaseModel):
    status: str
    transcription: str
    response_text: str
    # None when TTS failed. The caller should fall back to displaying the text
    # rather than treating the whole exchange as broken.
    tts_audio_url: Optional[str] = None
    trigger_3d_animation: Optional[str] = None


# ---- 3. Student Progress ----


class ProgressRequest(BaseModel):
    # Accepted for wire compatibility with the documented payload, but never
    # trusted: the route keys progress off the authenticated user instead.
    student_id: Optional[str] = None
    module_id: str
    time_spent_seconds: int
    completion_percentage: float


class ProgressResponse(BaseModel):
    status: str
    module_id: str
    time_spent_seconds: int
    completion_percentage: float


class ProgressItem(BaseModel):
    module_id: str
    time_spent_seconds: int
    completion_percentage: float
    updated_at: Optional[datetime] = None


class ProgressListResponse(BaseModel):
    status: str
    progress: List[ProgressItem]


# ---- 4. Accounts ----


class UserOut(BaseModel):
    """Who the frontend is logged in as.

    Login used to return a bare token, which left the dashboard unable to greet
    anyone or know whose progress to load.
    """

    id: int
    email: str
    name: Optional[str] = None


class UserRegister(BaseModel):
    email: str
    password: str
    # The sign-up form collects a name; older clients that omit it still work.
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---- 5. Course Catalogue ----


class ModuleItem(BaseModel):
    """One card in the dashboard's course grid.

    The dashboard hardcoded all of this, so the ids it sent to /chat and
    /progress were maintained by hand against the knowledge base. Serving them
    from the same place the material lives removes that whole failure mode.
    """

    id: str
    number: int
    title: str
    course: str
    label: str


class ModuleListResponse(BaseModel):
    status: str
    modules: List[ModuleItem]
