import boto3
import tempfile
import logging
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import HTTPException

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class S3Service:
    def __init__(self):
        logger.info(f"=== S3Service init === bucket: {settings.S3_BUCKET}")
        logger.info(f"AWS_ACCESS_KEY_ID present: {bool(settings.AWS_ACCESS_KEY_ID)}")

        if settings.AWS_ACCESS_KEY_ID:
            try:
                self.client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION,
                )
                logger.info("=== S3 client created successfully ===")
            except Exception as e:
                logger.error(f"=== S3 client creation failed: {e} ===")
                self.client = None
        else:
            logger.warning("=== S3 client not created - no AWS credentials ===")
            self.client = None
        self.bucket = settings.S3_BUCKET
        logger.info(f"=== S3Service init complete, client: {self.client} ===")

    def upload_file(self, file_path: str, key: str) -> str:
        if not self.client:
            return key
        self.client.upload_file(file_path, self.bucket, key)
        return f"s3://{self.bucket}/{key}"

    def download_to_temp(self, key: str) -> str:
        if not self.client:
            logger.error("S3 client not initialized - S3 not configured")
            raise RuntimeError("S3 not configured")

        logger.info(f"Downloading from S3: bucket={self.bucket}, key={key}")

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
        tmp.close()
        try:
            self.client.download_file(self.bucket, key, tmp.name)
            logger.info(f"Successfully downloaded to {tmp.name}")
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            logger.error(f"S3 ClientError: {error_code} - {str(e)}")
            if error_code == "NoSuchKey":
                raise HTTPException(
                    status_code=404, detail=f"File not found in S3: {key}"
                )
            raise RuntimeError(f"S3 download failed: {str(e)}")
        except NoCredentialsError as e:
            logger.error(f"S3 credentials error: {str(e)}")
            raise RuntimeError(f"S3 credentials not configured: {str(e)}")
        return tmp.name

    def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        if not self.client:
            return ""
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_in,
        )

    def delete_file(self, key: str) -> None:
        if not self.client:
            return
        self.client.delete_object(Bucket=self.bucket, Key=key)
