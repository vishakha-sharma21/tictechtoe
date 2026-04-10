from fastapi import APIRouter
from app.models.schema import QueryRequest
from app.services.gemini import detect_tools
from app.services.integration_checker import check_missing_integrations

router = APIRouter()


@router.post("/process-query")
def process_query(req: QueryRequest):
    tools = detect_tools(req.query)

    missing_tools = check_missing_integrations(req.user_id, tools)

    if missing_tools:
        return {
            "status": "missing_integrations",
            "required_tools": tools,
            "missing_tools": missing_tools
        }

    return {
        "status": "ready",
        "required_tools": tools
    }