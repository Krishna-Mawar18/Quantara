import tempfile
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import pandas as pd

from app.core.database import get_supabase
from app.core.security import get_current_user
from app.core.plan_enforcement import (
    check_chart_type_allowed,
    check_prediction_allowed,
    log_prediction,
)
from app.services.s3_service import S3Service
from app.services.analytics_service import AnalyticsService
from app.ml.predictor import Predictor

router = APIRouter(prefix="/api", tags=["analytics"])
s3_service = S3Service()


def _get_dataset_df(dataset_id: str, user: dict) -> pd.DataFrame:
    supabase = get_supabase()
    result = (
        supabase.table("datasets")
        .select("*")
        .eq("id", dataset_id)
        .eq("owner_id", user["id"])
        .execute()
    )
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=404, detail="Dataset not found")

    dataset = result.data[0]
    tmp_path = s3_service.download_to_temp(dataset["s3_key"])
    ext = dataset["filename"].rsplit(".", 1)[-1].lower()
    try:
        if ext == "csv":
            return pd.read_csv(tmp_path)
        else:
            return pd.read_excel(tmp_path)
    finally:
        os.unlink(tmp_path)


@router.get("/analytics/{dataset_id}")
def get_analytics(
    dataset_id: str,
    current_user: dict = Depends(get_current_user),
):
    df = _get_dataset_df(dataset_id, current_user)
    service = AnalyticsService(df)
    return service.analyze()


@router.post("/predict/{dataset_id}")
def predict(
    dataset_id: str,
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    check_prediction_allowed(current_user["id"])

    target_column = body.get("target_column")
    if not target_column:
        raise HTTPException(status_code=400, detail="target_column is required")

    feature_columns = body.get("feature_columns")
    model_type = body.get("model_type", "auto")

    df = _get_dataset_df(dataset_id, current_user)
    predictor = Predictor(
        df, target_column, feature_columns=feature_columns, model_type=model_type
    )
    result = predictor.train()
    log_prediction(current_user["id"])
    return result


@router.post("/chart/{dataset_id}")
def generate_chart(
    dataset_id: str,
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    chart_type = body.get("chart_type", "bar")
    x_column = body.get("x_column")
    y_column = body.get("y_column")
    hue = body.get("hue", [])

    if not x_column:
        raise HTTPException(status_code=400, detail="x_column is required")

    check_chart_type_allowed(current_user["id"], chart_type)

    df = _get_dataset_df(dataset_id, current_user)

    if x_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{x_column}' not found")
    if y_column and y_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{y_column}' not found")
    for h in hue:
        if h not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{h}' not found")

    service = AnalyticsService(df)
    return service.generate_custom_chart(chart_type, x_column, y_column, hue)


@router.post("/predict/{dataset_id}/data")
async def predict_on_data(
    dataset_id: str,
    file: UploadFile = File(...),
    target_column: str = "",
    model_type: str = "auto",
    feature_columns: str = "",
    current_user: dict = Depends(get_current_user),
):
    check_prediction_allowed(current_user["id"])

    if not target_column:
        raise HTTPException(status_code=400, detail="target_column is required")

    train_df = _get_dataset_df(dataset_id, current_user)
    features = (
        [c.strip() for c in feature_columns.split(",") if c.strip()]
        if feature_columns
        else None
    )

    predictor = Predictor(
        train_df, target_column, feature_columns=features, model_type=model_type
    )

    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "csv"
    contents = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        if ext == "csv":
            new_df = pd.read_csv(tmp_path)
        else:
            new_df = pd.read_excel(tmp_path)
    finally:
        os.unlink(tmp_path)

    result = predictor.predict_on_data(new_df)
    log_prediction(current_user["id"])
    return result
