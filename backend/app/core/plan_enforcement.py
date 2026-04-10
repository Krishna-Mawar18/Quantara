from fastapi import HTTPException
from app.core.database import get_supabase
from app.services.billing_service import PLANS


def get_user_plan(user_id: str) -> dict:
    supabase = get_supabase()
    result = (
        supabase.table("subscriptions")
        .select("plan, status")
        .eq("user_id", user_id)
        .execute()
    )
    if result.data and len(result.data) > 0:
        plan_id = result.data[0].get("plan", "free")
    else:
        plan_id = "free"

    return PLANS.get(plan_id, PLANS["free"])


def get_user_dataset_count(user_id: str) -> int:
    supabase = get_supabase()
    result = (
        supabase.table("datasets")
        .select("id", count="exact")
        .eq("owner_id", user_id)
        .execute()
    )
    return result.count or 0


def get_user_prediction_count(user_id: str) -> int:
    supabase = get_supabase()
    from datetime import datetime, timezone

    start_of_month = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )

    result = (
        supabase.table("predictions_log")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .gte("created_at", start_of_month.isoformat())
        .execute()
    )
    return result.count or 0


def check_upload_allowed(user_id: str, row_count: int) -> None:
    plan = get_user_plan(user_id)
    limits = plan["limits"]

    dataset_count = get_user_dataset_count(user_id)
    if limits["datasets"] > 0 and dataset_count >= limits["datasets"]:
        raise HTTPException(
            status_code=403,
            detail=f"Dataset limit reached ({limits['datasets']}). Upgrade your plan to upload more.",
        )

    if limits["rows_per_dataset"] > 0 and row_count > limits["rows_per_dataset"]:
        raise HTTPException(
            status_code=403,
            detail=f"File has {row_count} rows. Your plan allows up to {limits['rows_per_dataset']} rows per dataset.",
        )


def check_prediction_allowed(user_id: str) -> None:
    plan = get_user_plan(user_id)
    limits = plan["limits"]

    if limits["predictions_per_month"] <= 0:
        return

    supabase = get_supabase()
    from datetime import datetime, timezone

    start_of_month = datetime.now(timezone.utc).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )

    result = (
        supabase.table("predictions_log")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .gte("created_at", start_of_month.isoformat())
        .execute()
    )
    count = result.count or 0

    if count >= limits["predictions_per_month"]:
        raise HTTPException(
            status_code=403,
            detail=f"Prediction limit reached ({limits['predictions_per_month']}/month). Upgrade your plan for more.",
        )


def log_prediction(user_id: str) -> None:
    supabase = get_supabase()
    supabase.table("predictions_log").insert({"user_id": user_id}).execute()


def check_chart_type_allowed(user_id: str, chart_type: str) -> None:
    plan = get_user_plan(user_id)
    plan_id = plan.get("name", "").lower()

    if plan_id == "free" and chart_type not in ("bar", "pie"):
        raise HTTPException(
            status_code=403,
            detail=f"'{chart_type}' charts require Pro plan. Upgrade to unlock all chart types.",
        )
