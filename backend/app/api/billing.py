from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.config import get_settings
from app.core.database import get_supabase
from app.core.security import get_current_user
from app.services.billing_service import BillingService

router = APIRouter(prefix="/api/billing", tags=["billing"])
settings = get_settings()
billing_service = BillingService()


@router.get("/plans")
def get_plans():
    return billing_service.get_plans()


@router.get("/subscription")
def get_subscription(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("subscriptions")
        .select("*")
        .eq("user_id", current_user["id"])
        .execute()
    )
    if not result.data or len(result.data) == 0:
        return {"plan": "free", "status": "active"}
    sub = result.data[0]
    return {
        "id": sub["id"],
        "plan": sub["plan"],
        "status": sub["status"],
        "current_period_end": sub.get("current_period_end"),
        "razorpay_subscription_id": sub.get("razorpay_subscription_id"),
    }


@router.post("/create-checkout")
def create_checkout(
    body: dict,
    current_user: dict = Depends(get_current_user),
):
    plan_id = body.get("plan_id")
    if not plan_id:
        raise HTTPException(status_code=400, detail="plan_id is required")

    try:
        result = billing_service.create_subscription(current_user, plan_id)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def razorpay_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    try:
        billing_service.handle_webhook(payload, signature)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
