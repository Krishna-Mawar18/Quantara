import json
import logging
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import get_settings
from app.core.database import get_supabase

logger = logging.getLogger(__name__)
settings = get_settings()
security = HTTPBearer()

_firebase_initialized = False


def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    try:
        if settings.FIREBASE_CREDENTIALS_PATH:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        elif settings.FIREBASE_PROJECT_ID:
            cred = credentials.ApplicationDefault()
        else:
            return
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
    except ValueError:
        _firebase_initialized = True


def verify_firebase_token(token: str) -> dict:
    try:
        init_firebase()
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        logger.error(f"Firebase token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    logger.info("Verifying current user")
    token = credentials.credentials
    payload = verify_firebase_token(token)

    uid = payload.get("uid")
    email = payload.get("email", "")

    if not uid:
        logger.error("No uid in token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    logger.info(f"Looking up user {uid} in Supabase")
    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", uid).execute()

    if result.data and len(result.data) > 0:
        logger.info(f"User {uid} found in Supabase")
        return result.data[0]

    logger.info(f"Creating new user {uid} in Supabase")
    user_data = {
        "id": uid,
        "email": email,
        "name": payload.get("name", email.split("@")[0] if email else "User"),
        "plan": "free",
    }
    supabase.table("users").upsert(user_data).execute()

    return user_data
