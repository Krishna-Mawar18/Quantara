import os
import uuid
import tempfile
import logging
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
import pandas as pd

from app.core.config import get_settings
from app.core.database import get_supabase
from app.core.security import get_current_user
from app.core.plan_enforcement import check_upload_allowed
from app.services.s3_service import S3Service
from app.api.schemas import UploadResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["upload"])
settings = get_settings()
s3_service = S3Service()


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    logger.info(f"Upload request from user {current_user['id']}: {file.filename}")
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Supported: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit",
        )

    file_id = str(uuid.uuid4())
    uid = current_user["id"]
    s3_key = f"datasets/{uid}/{file_id}.{ext}"

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        if ext == "csv":
            df = pd.read_csv(tmp_path)
        else:
            df = pd.read_excel(tmp_path)

        rows = len(df)
        columns = list(df.columns)

        check_upload_allowed(uid, rows)

        logger.info(f"Uploading to S3: key={s3_key}")
        s3_service.upload_file(tmp_path, s3_key)
        logger.info("S3 upload successful, inserting to Supabase")

        supabase = get_supabase()
        supabase.table("datasets").insert(
            {
                "id": file_id,
                "filename": file.filename,
                "s3_key": s3_key,
                "rows": rows,
                "columns": columns,
                "size": len(contents),
                "status": "ready",
                "owner_id": uid,
            }
        ).execute()
        logger.info(f"Dataset {file_id} saved to Supabase")

        return UploadResponse(
            file_id=file_id,
            filename=file.filename,
            rows=rows,
            columns=columns,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process file: {str(e)}",
        )
    finally:
        os.unlink(tmp_path)


@router.get("/datasets")
def list_datasets(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("datasets")
        .select("*")
        .eq("owner_id", current_user["id"])
        .order("uploaded_at", desc=True)
        .execute()
    )
    return result.data or []


@router.get("/datasets/{dataset_id}")
def get_dataset(
    dataset_id: str,
    current_user: dict = Depends(get_current_user),
):
    supabase = get_supabase()
    result = (
        supabase.table("datasets")
        .select("*")
        .eq("id", dataset_id)
        .eq("owner_id", current_user["id"])
        .execute()
    )
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return result.data[0]


@router.delete("/datasets/{dataset_id}")
def delete_dataset(
    dataset_id: str,
    current_user: dict = Depends(get_current_user),
):
    supabase = get_supabase()
    result = (
        supabase.table("datasets")
        .select("*")
        .eq("id", dataset_id)
        .eq("owner_id", current_user["id"])
        .execute()
    )
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Dataset not found")

    dataset = result.data[0]
    s3_service.delete_file(dataset["s3_key"])
    supabase.table("datasets").delete().eq("id", dataset_id).execute()
    return {"status": "deleted"}


@router.get("/plan")
def get_user_plan_info(current_user: dict = Depends(get_current_user)):
    from app.core.plan_enforcement import (
        get_user_plan,
        get_user_dataset_count,
        get_user_prediction_count,
    )

    plan = get_user_plan(current_user["id"])
    dataset_count = get_user_dataset_count(current_user["id"])
    prediction_count = get_user_prediction_count(current_user["id"])

    return {
        "plan": plan["name"],
        "limits": plan["limits"],
        "features": plan["features"],
        "usage": {
            "datasets": dataset_count,
            "predictions": prediction_count,
        },
    }


@router.get("/predictions-weekly")
def get_predictions_per_week(current_user: dict = Depends(get_current_user)):
    from app.core.plan_enforcement import get_user_prediction_count
    from datetime import datetime, timedelta, timezone

    supabase = get_supabase()

    week_data = []
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    today = datetime.now(timezone.utc).date()
    start_of_week = today - timedelta(days=today.weekday())

    for i in range(7):
        day_date = start_of_week + timedelta(days=i)
        start_of_day = datetime.combine(day_date, datetime.min.time()).replace(
            tzinfo=timezone.utc
        )
        end_of_day = datetime.combine(day_date, datetime.max.time()).replace(
            tzinfo=timezone.utc
        )

        result = (
            supabase.table("predictions_log")
            .select("id", count="exact")
            .eq("user_id", current_user["id"])
            .gte("created_at", start_of_day.isoformat())
            .lte("created_at", end_of_day.isoformat())
            .execute()
        )

        week_data.append({"day": day_names[i], "predictions": result.count or 0})

    return {"data": week_data}
