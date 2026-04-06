from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import get_supabase
from app.core.security import get_current_user, verify_firebase_token
from app.api.schemas import UserSync, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/sync", response_model=UserResponse)
def sync_user(data: UserSync, current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()

    user_data = {
        "id": data.uid,
        "email": data.email or current_user.get("email", ""),
        "name": data.name or current_user.get("name", ""),
        "plan": current_user.get("plan", "free"),
    }

    result = supabase.table("users").upsert(user_data).execute()

    user = result.data[0] if result.data else user_data
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        plan=user["plan"],
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        plan=current_user["plan"],
    )
