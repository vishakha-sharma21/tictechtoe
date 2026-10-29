from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import os
import re
from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from urllib.parse import quote
from xml.sax.saxutils import escape

load_dotenv()

TWILIO_ACCOUNT_SID = os.environ["TWILIO_ACCOUNT_SID"]
TWILIO_AUTH_TOKEN = os.environ["TWILIO_AUTH_TOKEN"]
TWILIO_FROM_NUMBER = os.environ["TWILIO_FROM_NUMBER"]

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

def build_twiml(message: str) -> str:
    """Speech for a phone call.
    - 1s pause first: speech that starts the instant the call is answered gets its first word clipped.
    - Polly.Aditi speaks Hindi and Indian English ("alice" can't read Devanagari); falls back by script.
    - 1s pause after, so the call doesn't hang up on the last word."""
    lang = "hi-IN" if re.search(r"[\u0900-\u097F]", message) else "en-IN"
    return (f'<Response><Pause length="1"/>'
            f'<Say voice="Polly.Aditi" language="{lang}">{escape(message)}</Say>'
            f'<Pause length="1"/></Response>')


def require_destination(to):
    """Never fall back to a configured number: every message/call must name its recipient."""
    if not to or not str(to).strip():
        raise ValueError("A destination phone number is required (E.164, e.g. +919876543210).")
    return str(to).strip()


@app.post("/invoke/twilio.make_call")
def make_call(req: MakeCallRequest):
    try:
        client = get_twilio_client()
        to_number = require_destination(req.to)
        # Escape: the message is free text (e.g. a shayari with "&" or "<") and is embedded in XML.
        twiml = build_twiml(req.message)
        try:
            call = client.calls.create(to=to_number, from_=TWILIO_FROM_NUMBER, twiml=twiml)
        except TwilioRestException as e:
            # Trial accounts may not use the inline `twiml` parameter; they can only fetch TwiML from a URL.
            if "trial accounts have limited parameter access" not in str(e):
                raise
            url = "https://twimlets.com/echo?Twiml=" + quote(twiml)
            call = client.calls.create(to=to_number, from_=TWILIO_FROM_NUMBER, url=url)
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
        to_number = require_destination(req.to)
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
        to_number = f"whatsapp:{require_destination(req.to)}"
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
