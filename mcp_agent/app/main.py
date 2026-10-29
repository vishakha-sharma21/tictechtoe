import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import query

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)  # no public API explorer

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("APP_URL", "http://localhost:3000")],
    allow_credentials=False,  # auth is a bearer header, not cookies
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(query.router)


@app.get("/health")
def health():
    return {"ok": True}
