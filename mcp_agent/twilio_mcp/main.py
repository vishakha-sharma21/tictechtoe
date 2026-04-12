from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

TWILIO_ACCOUNT_SID = os.environ["TWILIO_ACCOUNT_SID"]
TWILIO_AUTH_TOKEN = os.environ["TWILIO_AUTH_TOKEN"]
TWILIO_FROM_NUMBER = os.environ["TWILIO_FROM_NUMBER"]
TWILIO_TO_NUMBER = os.environ["TWILIO_TO_NUMBER"]

app = FastAPI()

def get_twilio_client() -> Client:
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

class BaseRequest(BaseModel):
    user_id: str

class MakeCallRequest(BaseRequest):
    message: str
    to: Optional[str] = None

class SendSMSRequest(BaseRequest):
    message: str
    to: Optional[str] = None

class GetCallStatusRequest(BaseRequest):
    call_sid: str

class GetSMSStatusRequest(BaseRequest):
    message_sid: str

class SendWhatsAppRequest(BaseRequest):
    message: str
    to: Optional[str] = None

@app.get("/tools")
def tools():
    return [
        {
            "name": "twilio.make_call",
            "description": "Make a phone call and speak a custom message",
            "input_schema": MakeCallRequest.model_json_schema()
        },
        {
            "name": "twilio.send_sms",
            "description": "Send an SMS message",
            "input_schema": SendSMSRequest.model_json_schema()
        },
        {
            "name": "twilio.get_call_status",
            "description": "Get status of a phone call",
            "input_schema": GetCallStatusRequest.model_json_schema()
        },
        {
            "name": "twilio.get_sms_status",
            "description": "Get status of an SMS message",
            "input_schema": GetSMSStatusRequest.model_json_schema()
        },
        {
            "name": "twilio.send_whatsapp",
            "description": "Send a WhatsApp message",
            "input_schema": SendWhatsAppRequest.model_json_schema()
        }
    ]

@app.post("/invoke/twilio.make_call")
def make_call(req: MakeCallRequest):
    try:
        client = get_twilio_client()
        to_number = req.to or TWILIO_TO_NUMBER
        twiml = f"""
            <Response>
                <Say voice="alice">{req.message}</Say>
            </Response>
        """
        call = client.calls.create(
            to=to_number,
            from_=TWILIO_FROM_NUMBER,
            twiml=twiml
        )
        return {"result": {
            "call_sid": call.sid,
            "status": call.status,
            "to": to_number,
            "from": TWILIO_FROM_NUMBER,
            "message": req.message
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/twilio.send_sms")
def send_sms(req: SendSMSRequest):
    try:
        client = get_twilio_client()
        to_number = req.to or TWILIO_TO_NUMBER
        message = client.messages.create(
            to=to_number,
            from_=TWILIO_FROM_NUMBER,
            body=req.message
        )
        return {"result": {
            "message_sid": message.sid,
            "status": message.status,
            "to": to_number,
            "from": TWILIO_FROM_NUMBER,
            "message": req.message
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/twilio.get_call_status")
def get_call_status(req: GetCallStatusRequest):
    try:
        client = get_twilio_client()
        call = client.calls(req.call_sid).fetch()
        return {"result": {
            "call_sid": call.sid,
            "status": call.status,
            "duration": call.duration,
            "to": call.to,
            "from": call.from_,
            "start_time": str(call.start_time),
            "end_time": str(call.end_time)
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/twilio.get_sms_status")
def get_sms_status(req: GetSMSStatusRequest):
    try:
        client = get_twilio_client()
        message = client.messages(req.message_sid).fetch()
        return {"result": {
            "message_sid": message.sid,
            "status": message.status,
            "to": message.to,
            "from": message.from_,
            "body": message.body,
            "date_sent": str(message.date_sent)
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/twilio.send_whatsapp")
def send_whatsapp(req: SendWhatsAppRequest):
    try:
        client = get_twilio_client()
        to_number = f"whatsapp:{req.to or TWILIO_TO_NUMBER}"
        from_number = f"whatsapp:{TWILIO_FROM_NUMBER}"
        message = client.messages.create(
            to=to_number,
            from_=from_number,
            body=req.message
        )
        return {"result": {
            "message_sid": message.sid,
            "status": message.status,
            "to": to_number,
            "message": req.message
        }}
    except Exception as e:
        return {"error": str(e)}
