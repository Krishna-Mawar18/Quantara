import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

from app.core.config import get_settings
from app.api.auth import router as auth_router
from app.api.upload import router as upload_router
from app.api.analytics import router as analytics_router
from app.api.billing import router as billing_router
from app.api.playground import router as playground_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="Data Intelligence Platform API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://quantara.app",
        "https://*.quantara.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("Including routers...")
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(analytics_router)
app.include_router(billing_router)
app.include_router(playground_router)
logger.info("All routers included successfully")


@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up")
    for route in app.routes:
        if hasattr(route, "path") and hasattr(route, "methods"):
            logger.info(f"Route: {route.methods} {route.path}")


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}


@app.get("/test-s3")
def test_s3():
    from app.services.s3_service import S3Service
    import os

    s3 = S3Service()
    return {
        "client_initialized": s3.client is not None,
        "bucket": s3.bucket,
        "aws_key_present": bool(os.environ.get("AWS_ACCESS_KEY_ID")),
    }


@app.get("/")
def root():
    return {"message": "Quantara API", "docs": "/docs"}
