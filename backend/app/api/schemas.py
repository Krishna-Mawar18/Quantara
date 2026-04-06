from pydantic import BaseModel


class UserSync(BaseModel):
    uid: str
    email: str | None = None
    name: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    plan: str


class UploadResponse(BaseModel):
    file_id: str
    filename: str
    rows: int
    columns: list[str]


class AnalyticsRequest(BaseModel):
    target_column: str | None = None
