from fastapi import FastAPI
from pydantic import BaseModel

app=FastAPI()
class MultiplyRequest(BaseModel):
    a: float
    b: float

@app.get("/tools")
def tools():
    return [{
        "name": "multiply_numbers",
        "description": "Multiply two numbers",
        "input_schema": {
            "type": "object",
            "properties": {
                "a": {"type": "number"},
                "b": {"type": "number"}
            },
            "required": ["a", "b"]
        }
    }]

@app.post("/invoke/multiply_numbers")
def multiply(req: MultiplyRequest):
    return {"result": req.a * req.b}
