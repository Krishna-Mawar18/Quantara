import tempfile
import os
import json
import math
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import pandas as pd
from typing import Any
import logging

from app.core.database import get_supabase
from app.core.security import get_current_user
from app.core.plan_enforcement import check_prediction_allowed, log_prediction
from app.services.s3_service import S3Service
from app.services.analytics_service import AnalyticsService
from app.services.feature_engineering import FeatureEngineeringService
from app.ml.playground_predictor import PlaygroundPredictor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/playground", tags=["playground"])
s3_service = S3Service()


def _get_dataset_df(dataset_id: str, user: dict) -> tuple[pd.DataFrame, dict]:
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
    try:
        tmp_path = s3_service.download_to_temp(dataset["s3_key"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to download file from S3: {str(e)}"
        )

    ext = dataset["filename"].rsplit(".", 1)[-1].lower()
    try:
        if ext == "csv":
            return pd.read_csv(tmp_path), dataset
        else:
            return pd.read_excel(tmp_path), dataset
    finally:
        os.unlink(tmp_path)


def _get_dataset_preview(dataset_id: str, user: dict) -> dict[str, Any]:
    df, dataset = _get_dataset_df(dataset_id, user)
    preview = (
        df.head(20)
        .replace({pd.NA: None, pd.NaT: None})
        .fillna(value=np.nan)
        .to_dict(orient="records")
    )

    preview = [{k: _clean_value(v) for k, v in row.items()} for row in preview]

    return {
        "id": dataset["id"],
        "filename": dataset["filename"],
        "rows": len(df),
        "columns": list(df.columns),
        "preview": preview,
    }


@router.get("/datasets/{dataset_id}/preview")
async def get_dataset_preview(
    dataset_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        logger.info(
            f"Loading preview for dataset {dataset_id} by user {current_user.get('id')}"
        )
        return _get_dataset_preview(dataset_id, current_user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading preview: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error loading dataset: {str(e)}")


@router.get("/datasets/{dataset_id}/columns")
async def get_dataset_columns(
    dataset_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        logger.info(f"Loading columns for dataset {dataset_id}")
        df, _ = _get_dataset_df(dataset_id, current_user)
        service = AnalyticsService(df)
        return {
            "columns": service._get_summary(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading columns: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error loading columns: {str(e)}")


@router.post("/datasets/{dataset_id}/features")
def create_derived_feature(
    dataset_id: str,
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    df, _ = _get_dataset_df(dataset_id, current_user)

    name = body.get("name")
    formula = body.get("formula")

    if not name or not formula:
        raise HTTPException(status_code=400, detail="name and formula are required")

    service = FeatureEngineeringService(df)

    validation = service.validate_formula(formula)
    if not validation["valid"]:
        raise HTTPException(
            status_code=400, detail=f"Invalid formula: {validation['error']}"
        )

    df_with_feature = service.add_column(name, formula)

    preview = service.preview_formula(formula, name)

    return {
        "success": True,
        "name": name,
        "result_type": validation["result_type"],
        "preview": preview,
        "columns": list(df_with_feature.columns),
    }


@router.post("/datasets/{dataset_id}/preview")
def preview_with_features(
    dataset_id: str,
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    df, _ = _get_dataset_df(dataset_id, current_user)

    derived_features = body.get("derived_features", [])

    service = FeatureEngineeringService(df)
    for feat in derived_features:
        name = feat.get("name")
        formula = feat.get("formula")
        if name and formula:
            df = service.add_column(name, formula)

    preview = df.head(50).to_dict(orient="records")
    preview = [
        {
            k: (_clean_value(v) if isinstance(v, (float, int)) else v)
            for k, v in row.items()
        }
        for row in preview
    ]

    return {
        "preview": preview,
        "columns": list(df.columns),
        "total_rows": len(df),
    }


@router.get("/models/schema")
def get_model_schema(
    dataset_id: str,
    target_column: str,
    current_user: dict = Depends(get_current_user),
):
    df, _ = _get_dataset_df(dataset_id, current_user)

    if target_column not in df.columns:
        raise HTTPException(status_code=400, detail="Target column not found")

    predictor = PlaygroundPredictor(df, target_column)
    predictor._prepare_data()
    return predictor.get_model_schema()


@router.post("/train")
def train_model(
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    check_prediction_allowed(current_user["id"])

    dataset_id = body.get("dataset_id")
    target_column = body.get("target_column")
    feature_columns = body.get("feature_columns", [])
    model_key = body.get("model_key", "random_forest")
    hyperparameters = body.get("hyperparameters", {})
    validation_config = body.get("validation_config", {})
    derived_features = body.get("derived_features", [])

    if not dataset_id or not target_column:
        raise HTTPException(
            status_code=400, detail="dataset_id and target_column are required"
        )

    df, _ = _get_dataset_df(dataset_id, current_user)

    service = FeatureEngineeringService(df)
    for feat in derived_features:
        name = feat.get("name")
        formula = feat.get("formula")
        if name and formula:
            df = service.add_column(name, formula)

    predictor = PlaygroundPredictor(
        df,
        target_column,
        feature_columns=feature_columns if feature_columns else None,
    )

    result = predictor.train(
        model_key=model_key,
        hyperparameters=hyperparameters,
        validation_config=validation_config,
    )

    log_prediction(current_user["id"])

    return result


@router.post("/predict")
async def predict(
    dataset_id: str = Form(None),
    file: UploadFile = File(None),
    target_column: str = Form(None),
    feature_columns: str = Form("[]"),
    model_key: str = Form("random_forest"),
    hyperparameters: str = Form("{}"),
    validation_config: str = Form("{}"),
    derived_features: str = Form("[]"),
    current_user: dict = Depends(get_current_user),
):
    logger.info(
        f"Predict request - dataset_id: {dataset_id}, target: {target_column}, model: {model_key}"
    )

    if not dataset_id:
        raise HTTPException(status_code=400, detail="dataset_id is required")
    if not file:
        raise HTTPException(status_code=400, detail="file is required")
    if not target_column:
        raise HTTPException(status_code=400, detail="target_column is required")

    try:
        check_prediction_allowed(current_user["id"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Plan check error: {e}")
        raise HTTPException(status_code=500, detail="Plan check failed")

    feature_cols = json.loads(feature_columns) if feature_columns else []
    hyperparams = json.loads(hyperparameters) if hyperparameters else {}
    val_config = json.loads(validation_config) if validation_config else {}
    derived_feats = json.loads(derived_features) if derived_features else []

    train_df, _ = _get_dataset_df(dataset_id, current_user)

    service = FeatureEngineeringService(train_df)
    for feat in derived_feats:
        name = feat.get("name")
        formula = feat.get("formula")
        if name and formula:
            train_df = service.add_column(name, formula)

    predictor = PlaygroundPredictor(
        train_df,
        target_column,
        feature_columns=feature_cols if feature_cols else None,
    )

    predictor.train(
        model_key=model_key,
        hyperparameters=hyperparams,
        validation_config=val_config,
    )

    contents = await file.read()
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "csv"

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


@router.post("/validate-formula")
def validate_formula(
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    dataset_id = body.get("dataset_id")
    formula = body.get("formula")

    if not dataset_id or not formula:
        raise HTTPException(
            status_code=400, detail="dataset_id and formula are required"
        )

    df, _ = _get_dataset_df(dataset_id, current_user)

    service = FeatureEngineeringService(df)
    return service.validate_formula(formula)


@router.post("/predict-download")
async def predict_download(
    dataset_id: str = Form(...),
    file: UploadFile = File(...),
    target_column: str = Form(...),
    feature_columns: str = Form("[]"),
    model_key: str = Form("random_forest"),
    hyperparameters: str = Form("{}"),
    validation_config: str = Form("{}"),
    derived_features: str = Form("[]"),
    current_user: dict = Depends(get_current_user),
):
    """Predict and download results as CSV"""
    logger.info(
        f"Predict download request - dataset_id: {dataset_id}, target: {target_column}"
    )

    try:
        check_prediction_allowed(current_user["id"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Plan check error: {e}")
        raise HTTPException(status_code=500, detail="Plan check failed")

    feature_cols = json.loads(feature_columns) if feature_columns else []
    hyperparams = json.loads(hyperparameters) if hyperparameters else {}
    val_config = json.loads(validation_config) if validation_config else {}
    derived_feats = json.loads(derived_features) if derived_features else []

    train_df, _ = _get_dataset_df(dataset_id, current_user)

    service = FeatureEngineeringService(train_df)
    for feat in derived_feats:
        name = feat.get("name")
        formula = feat.get("formula")
        if name and formula:
            train_df = service.add_column(name, formula)

    predictor = PlaygroundPredictor(
        train_df,
        target_column,
        feature_columns=feature_cols if feature_cols else None,
    )

    predictor.train(
        model_key=model_key,
        hyperparameters=hyperparams,
        validation_config=val_config,
    )

    contents = await file.read()
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "csv"

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

    predictions = result.get("predictions", [])

    from fastapi.responses import StreamingResponse
    import io

    output = io.StringIO()
    if predictions:
        pd.DataFrame(predictions).to_csv(output, index=False)
    else:
        output.write("No predictions generated")

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=predictions.csv"},
    )


def _clean_value(v):
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    return v
