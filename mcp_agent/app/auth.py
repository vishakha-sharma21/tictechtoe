import os

import jwt
from fastapi import Header, HTTPException


def current_user_id(authorization: str | None = Header(default=None)) -> str:
    """FastAPI dependency: user id comes ONLY from the signed token minted by the Next.js app."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    secret = os.environ.get("BACKEND_JWT_SECRET")
    if not secret:
        raise HTTPException(status_code=500, detail="Server misconfigured")
    try:
        claims = jwt.decode(
            authorization[7:].strip(),
            secret,
            algorithms=["HS256"],
            audience="mcp_agent",
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return str(claims["sub"])
