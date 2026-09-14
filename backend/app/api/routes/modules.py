from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.models.schemas import ModuleItem, ModuleListResponse
from app.models.user import User
from app.services.rag_service import list_modules

router = APIRouter()


@router.get("", response_model=ModuleListResponse)
def get_modules(user: User = Depends(get_current_user)):
    """The course catalogue, so the dashboard stops hardcoding module ids.

    Gated behind auth like every other route. The catalogue is not secret, but
    one route with a different auth rule is one more thing to remember — and
    the only caller is the dashboard, which is always signed in.
    """
    return ModuleListResponse(
        status="success",
        modules=[ModuleItem(**module) for module in list_modules()],
    )
