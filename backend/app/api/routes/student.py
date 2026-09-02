from fastapi import APIRouter
from app.models.schemas import ProgressRequest, ProgressResponse

router = APIRouter()

@router.put("/progress", response_model=ProgressResponse)
def update_progress(payload: ProgressRequest):
    # TODO: replace with real database write via db/database.py
    return ProgressResponse(status="success")