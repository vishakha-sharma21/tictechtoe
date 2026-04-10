from pydantic import BaseModel

class QueryRequest(BaseModel):
    user_id: str
    session_id: str
    query: str


class IntegrationRequest(BaseModel):
    user_id: str
    provider: str
    access_token: str
    refresh_token: str | None = None
    expires_at: int | None = None
    scope: str | None = None
    token_type: str = "Bearer"
    email: str | None = None
    name: str | None = None