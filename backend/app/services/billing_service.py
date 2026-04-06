import razorpay
import hmac
import hashlib
import uuid
from datetime import datetime, timezone

from app.core.config import get_settings
from app.core.database import get_supabase

settings = get_settings()

PLANS = {
    "free": {
        "name": "Free",
        "price": 0,
        "limits": {
            "datasets": 1,
            "rows_per_dataset": 10000,
            "predictions_per_month": 3,
        },
        "features": [
            "1 dataset",
            "Basic analytics",
            "3 visualization charts",
        ],
    },
    "pro": {
        "name": "Pro",
        "price": 55900,
        "razorpay_plan_id": "plan_SYIptkKtMt6Nlx",
        "limits": {
            "datasets": 5,
            "rows_per_dataset": 100000,
            "predictions_per_month": 100,
        },
        "features": [
            "5 datasets",
            "Advanced analytics",
            "Unlimited charts (3 types)",
            "Basic insights",
        ],
    },
    "pro_plus": {
        "name": "Pro Plus",
        "price": 139900,
        "razorpay_plan_id": "plan_SYIsAPLI4fk792",
        "limits": {
            "datasets": 20,
            "rows_per_dataset": 500000,
            "predictions_per_month": 500,
        },
        "features": [
            "20 datasets",
            "Advanced analytics",
            "Unlimited charts (all types)",
            "Advanced insights & predictions",
            "ML models (customizable)",
        ],
    },
}


class BillingService:
    def __init__(self):
        if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
            self.client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
        else:
            self.client = None

    def get_plans(self) -> list[dict]:
        return [
            {
                "id": plan_id,
                "name": plan["name"],
                "price": plan["price"],
                "features": plan["features"],
                "limits": plan["limits"],
                "popular": plan_id == "pro",
            }
            for plan_id, plan in PLANS.items()
        ]

    def create_subscription(self, user: dict, plan_id: str) -> dict:
        plan = PLANS.get(plan_id)
        if not plan:
            raise ValueError("Invalid plan")

        supabase = get_supabase()

        if plan_id == "free":
            supabase.table("subscriptions").upsert(
                {
                    "user_id": user["id"],
                    "plan": "free",
                    "status": "active",
                },
                on_conflict="user_id",
            ).execute()
            return {"status": "ok", "plan": "free"}

        if not self.client:
            raise RuntimeError("Razorpay not configured")

        email = user.get("email", "")
        name = user.get("name", "")
        if not email:
            raise ValueError("User email required for subscription")

        existing = (
            supabase.table("subscriptions")
            .select("razorpay_customer_id")
            .eq("user_id", user["id"])
            .execute()
        )

        if existing.data and existing.data[0].get("razorpay_customer_id"):
            customer_id = existing.data[0]["razorpay_customer_id"]
        else:
            try:
                customer = self.client.customer.create({"name": name, "email": email})
                customer_id = customer["id"]
            except Exception:
                result = self.client.customer.all({"count": 100})
                customer_id = None
                for c in result.get("items", []):
                    if c.get("email") == email:
                        customer_id = c["id"]
                        break
                if not customer_id:
                    raise RuntimeError(
                        "Unable to create or find customer. Please contact support."
                    )

        subscription = self.client.subscription.create(
            {
                "plan_id": plan["razorpay_plan_id"],
                "customer_notify": 1,
                "total_count": 12,
            }
        )

        supabase.table("subscriptions").upsert(
            {
                "user_id": user["id"],
                "plan": plan_id,
                "status": "active",
                "razorpay_subscription_id": subscription["id"],
                "razorpay_customer_id": customer_id,
            },
            on_conflict="user_id",
        ).execute()

        return {
            "subscription_id": subscription["id"],
            "plan_id": plan_id,
        }

    def handle_webhook(self, payload: bytes, signature: str) -> None:
        if not settings.RAZORPAY_KEY_SECRET:
            return

        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            payload,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected, signature):
            raise ValueError("Invalid webhook signature")

        import json

        data = json.loads(payload)
        event = data.get("event", "")
        supabase = get_supabase()

        if event == "subscription.charged":
            sub_data = data["payload"]["subscription"]["entity"]
            razorpay_sub_id = sub_data["id"]
            period_end = datetime.fromtimestamp(
                sub_data.get("current_end", 0), tz=timezone.utc
            ).isoformat()

            supabase.table("subscriptions").update(
                {"status": "active", "current_period_end": period_end}
            ).eq("razorpay_subscription_id", razorpay_sub_id).execute()

        elif event == "subscription.cancelled":
            sub_data = data["payload"]["subscription"]["entity"]
            razorpay_sub_id = sub_data["id"]

            supabase.table("subscriptions").update({"status": "cancelled"}).eq(
                "razorpay_subscription_id", razorpay_sub_id
            ).execute()
