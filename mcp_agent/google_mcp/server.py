from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import base64
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import email.message
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

# MongoDB setup
mongo_client = MongoClient(os.environ["MONGODB_URI"])
db = mongo_client[os.getenv("MONGODB_DB", "nexflow")]
integrations_col = db["integrations"]

def get_google_credentials(user_id: str) -> Credentials:
    doc = integrations_col.find_one({"user_id": user_id})
    if not doc:
        raise ValueError(f"No integration found for user_id: {user_id}")
    providers = doc.get("providers", [])
    google = next((p for p in providers if p["provider"] == "google"), None)
    if not google:
        raise ValueError(f"No Google provider for user_id: {user_id}")
    creds = google["credentials"]
    
    credentials = Credentials(
        token=creds["access_token"],
        refresh_token=creds["refresh_token"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ["GOOGLE_CLIENT_ID"],
        client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
        scopes=creds["scope"]
    )
    
    # Auto-refresh if expired
    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())
        integrations_col.update_one(
            {"user_id": user_id, "providers.provider": "google"},
            {"$set": {
                "providers.$.credentials.access_token": credentials.token,
                "providers.$.credentials.expires_at": credentials.expiry.timestamp()
            }}
        )
    
    return credentials

app = FastAPI()

# Request models
class BaseRequest(BaseModel):
    user_id: str

class GmailSendRequest(BaseRequest):
    to: str
    subject: str
    body: str
    cc: Optional[str] = None
    bcc: Optional[str] = None

class GmailListRequest(BaseRequest):
    max_results: int = 10
    query: Optional[str] = None

class GmailGetRequest(BaseRequest):
    message_id: str

class GmailReplyRequest(BaseRequest):
    message_id: str
    body: str

class GmailSearchRequest(BaseRequest):
    query: str
    max_results: int = 10

class GmailListLabelsRequest(BaseRequest):
    pass

class GmailCreateLabelRequest(BaseRequest):
    name: str
    label_list_visibility: str = "labelShow"
    message_list_visibility: str = "show"
    background_color: Optional[str] = None
    text_color: Optional[str] = None

class GmailApplyLabelRequest(BaseRequest):
    message_id: str
    label_ids: List[str]
    remove_label_ids: Optional[List[str]] = None

class GmailRemoveLabelRequest(BaseRequest):
    message_id: str
    label_ids: List[str]

class GmailLabelMessagesRequest(BaseRequest):
    query: str
    label_id: str
    max_results: int = 50

class GmailGetOrCreateLabelRequest(BaseRequest):
    name: str
    background_color: Optional[str] = None
    text_color: Optional[str] = None

class SheetsCreateRequest(BaseRequest):
    title: str

class SheetsGetRequest(BaseRequest):
    spreadsheet_id: str

class SheetsReadRequest(BaseRequest):
    spreadsheet_id: str
    range: str
    sheet_name: str = "Sheet1"

class SheetsWriteRequest(BaseRequest):
    spreadsheet_id: str
    range: str
    values: List[List[Any]]
    value_input_option: str = "USER_ENTERED"

class SheetsAppendRequest(BaseRequest):
    spreadsheet_id: str
    range: str
    values: List[List[Any]]

class SheetsClearRequest(BaseRequest):
    spreadsheet_id: str
    range: str

class SheetsListRequest(BaseRequest):
    pass

class SheetsAddSheetRequest(BaseRequest):
    spreadsheet_id: str
    sheet_name: str

class SheetsDeleteRowsRequest(BaseRequest):
    spreadsheet_id: str
    sheet_id: int
    start_index: int
    end_index: int

# Tools endpoint
@app.get("/tools")
def tools():
    return [
        # Gmail tools
        {
            "name": "google.gmail_send",
            "description": "Send an email",
            "input_schema": GmailSendRequest.model_json_schema()
        },
        {
            "name": "google.gmail_list",
            "description": "List emails",
            "input_schema": GmailListRequest.model_json_schema()
        },
        {
            "name": "google.gmail_get",
            "description": "Get a specific email",
            "input_schema": GmailGetRequest.model_json_schema()
        },
        {
            "name": "google.gmail_reply",
            "description": "Reply to an email",
            "input_schema": GmailReplyRequest.model_json_schema()
        },
        {
            "name": "google.gmail_search",
            "description": "Search emails",
            "input_schema": GmailSearchRequest.model_json_schema()
        },
        # Gmail Labels tools
        {
            "name": "google.gmail_list_labels",
            "description": "List Gmail labels",
            "input_schema": GmailListLabelsRequest.model_json_schema()
        },
        {
            "name": "google.gmail_create_label",
            "description": "Create a Gmail label",
            "input_schema": GmailCreateLabelRequest.model_json_schema()
        },
        {
            "name": "google.gmail_apply_label",
            "description": "Apply labels to an email",
            "input_schema": GmailApplyLabelRequest.model_json_schema()
        },
        {
            "name": "google.gmail_remove_label",
            "description": "Remove labels from an email",
            "input_schema": GmailRemoveLabelRequest.model_json_schema()
        },
        {
            "name": "google.gmail_label_messages",
            "description": "Bulk apply labels to messages matching query",
            "input_schema": GmailLabelMessagesRequest.model_json_schema()
        },
        {
            "name": "google.gmail_get_or_create_label",
            "description": "Get existing label or create new one",
            "input_schema": GmailGetOrCreateLabelRequest.model_json_schema()
        },
        # Google Sheets tools
        {
            "name": "google.sheets_create",
            "description": "Create a new spreadsheet",
            "input_schema": SheetsCreateRequest.model_json_schema()
        },
        {
            "name": "google.sheets_get",
            "description": "Get spreadsheet metadata",
            "input_schema": SheetsGetRequest.model_json_schema()
        },
        {
            "name": "google.sheets_read",
            "description": "Read data from a spreadsheet",
            "input_schema": SheetsReadRequest.model_json_schema()
        },
        {
            "name": "google.sheets_write",
            "description": "Write data to a spreadsheet",
            "input_schema": SheetsWriteRequest.model_json_schema()
        },
        {
            "name": "google.sheets_append",
            "description": "Append data to a spreadsheet",
            "input_schema": SheetsAppendRequest.model_json_schema()
        },
        {
            "name": "google.sheets_clear",
            "description": "Clear data from a spreadsheet range",
            "input_schema": SheetsClearRequest.model_json_schema()
        },
        {
            "name": "google.sheets_list",
            "description": "List all spreadsheets",
            "input_schema": SheetsListRequest.model_json_schema()
        },
        {
            "name": "google.sheets_add_sheet",
            "description": "Add a new sheet to spreadsheet",
            "input_schema": SheetsAddSheetRequest.model_json_schema()
        },
        {
            "name": "google.sheets_delete_rows",
            "description": "Delete rows from a sheet",
            "input_schema": SheetsDeleteRowsRequest.model_json_schema()
        }
    ]

# Gmail endpoints
@app.post("/invoke/google.gmail_send")
def gmail_send(req: GmailSendRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        message = MIMEMultipart()
        message['to'] = req.to
        message['subject'] = req.subject
        if req.cc:
            message['cc'] = req.cc
        if req.bcc:
            message['bcc'] = req.bcc
        
        message.attach(MIMEText(req.body, 'plain'))
        
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        result = service.users().messages().send(userId='me', body={'raw': raw}).execute()
        
        return {"result": {
            "message_id": result['id'],
            "thread_id": result.get('threadId')
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.gmail_list")
def gmail_list(req: GmailListRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        result = service.users().messages().list(
            userId='me', 
            maxResults=req.max_results,
            q=req.query or ''
        ).execute()
        
        messages = result.get('messages', [])
        emails = []
        
        for msg in messages:
            full_msg = service.users().messages().get(userId='me', id=msg['id'], format='metadata').execute()
            headers = full_msg['payload']['headers']
            
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
            from_addr = next((h['value'] for h in headers if h['name'] == 'From'), '')
            date = next((h['value'] for h in headers if h['name'] == 'Date'), '')
            
            emails.append({
                'id': msg['id'],
                'thread_id': msg['threadId'],
                'snippet': full_msg['snippet'],
                'from': from_addr,
                'subject': subject,
                'date': date
            })
        
        return {"result": emails}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.gmail_get")
def gmail_get(req: GmailGetRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        message = service.users().messages().get(userId='me', id=req.message_id, format='full').execute()
        
        # Extract body
        payload = message['payload']
        body = ''
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain' and 'data' in part['body']:
                    body = base64.urlsafe_b64decode(part['body']['data']).decode()
                    break
        elif 'body' in payload and 'data' in payload['body']:
            body = base64.urlsafe_b64decode(payload['body']['data']).decode()
        
        # Extract headers
        headers = payload['headers']
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
        from_addr = next((h['value'] for h in headers if h['name'] == 'From'), '')
        to_addr = next((h['value'] for h in headers if h['name'] == 'To'), '')
        date = next((h['value'] for h in headers if h['name'] == 'Date'), '')
        
        return {"result": {
            'id': message['id'],
            'thread_id': message['threadId'],
            'subject': subject,
            'from': from_addr,
            'to': to_addr,
            'date': date,
            'body': body
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.gmail_reply")
def gmail_reply(req: GmailReplyRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        # Get original message
        original = service.users().messages().get(userId='me', id=req.message_id, format='metadata').execute()
        thread_id = original['threadId']
        
        # Get headers for threading
        headers = original['payload']['headers']
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
        references = next((h['value'] for h in headers if h['name'] == 'References'), '')
        message_id = next((h['value'] for h in headers if h['name'] == 'Message-ID'), '')
        
        # Create reply
        reply_subject = f"Re: {subject}" if not subject.lower().startswith('re:') else subject
        
        message = MIMEMultipart()
        message['subject'] = reply_subject
        message['In-Reply-To'] = message_id
        message['References'] = f"{references} {message_id}".strip()
        
        message.attach(MIMEText(req.body, 'plain'))
        
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        result = service.users().messages().send(userId='me', body={'raw': raw, 'threadId': thread_id}).execute()
        
        return {"result": {
            "message_id": result['id'],
            "thread_id": result.get('threadId')
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.gmail_search")
def gmail_search(req: GmailSearchRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        result = service.users().messages().list(
            userId='me',
            q=req.query,
            maxResults=req.max_results
        ).execute()
        
        messages = result.get('messages', [])
        emails = []
        
        for msg in messages:
            full_msg = service.users().messages().get(userId='me', id=msg['id'], format='metadata').execute()
            headers = full_msg['payload']['headers']
            
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
            from_addr = next((h['value'] for h in headers if h['name'] == 'From'), '')
            date = next((h['value'] for h in headers if h['name'] == 'Date'), '')
            
            emails.append({
                'id': msg['id'],
                'thread_id': msg['threadId'],
                'snippet': full_msg['snippet'],
                'from': from_addr,
                'subject': subject,
                'date': date
            })
        
        return {"result": emails}
    except Exception as e:
        return {"error": str(e)}

# Gmail Labels endpoints
@app.post("/invoke/google.gmail_list_labels")
def gmail_list_labels(req: GmailListLabelsRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        result = service.users().labels().list(userId='me').execute()
        labels = result.get('labels', [])
        
        return {"result": [{
            'id': label['id'],
            'name': label['name'],
            'type': label.get('type', 'user'),
            'messages_total': label.get('messagesTotal', 0),
            'messages_unread': label.get('messagesUnread', 0)
        } for label in labels]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.gmail_create_label")
def gmail_create_label(req: GmailCreateLabelRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        label_body = {
            'name': req.name,
            'labelListVisibility': req.label_list_visibility,
            'messageListVisibility': req.message_list_visibility
        }
        
        if req.background_color or req.text_color:
            label_body['color'] = {}
            if req.background_color:
                label_body['color']['backgroundColor'] = req.background_color
            if req.text_color:
                label_body['color']['textColor'] = req.text_color
        
        result = service.users().labels().create(userId='me', body=label_body).execute()
        
        return {"result": {
            'label_id': result['id'],
            'name': result['name'],
            'color': result.get('color', {})
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.gmail_apply_label")
def gmail_apply_label(req: GmailApplyLabelRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        body = {'addLabelIds': req.label_ids}
        if req.remove_label_ids:
            body['removeLabelIds'] = req.remove_label_ids
        
        result = service.users().messages().modify(userId='me', id=req.message_id, body=body).execute()
        
        return {"result": {
            'message_id': result['id'],
            'labels_applied': req.label_ids,
            'labels_removed': req.remove_label_ids or []
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.gmail_remove_label")
def gmail_remove_label(req: GmailRemoveLabelRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        body = {'removeLabelIds': req.label_ids}
        result = service.users().messages().modify(userId='me', id=req.message_id, body=body).execute()
        
        return {"result": {
            'message_id': result['id'],
            'labels_removed': req.label_ids
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.gmail_label_messages")
def gmail_label_messages(req: GmailLabelMessagesRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        # Search messages
        result = service.users().messages().list(userId='me', q=req.query, maxResults=req.max_results).execute()
        messages = result.get('messages', [])
        
        labeled_count = 0
        for msg in messages:
            try:
                service.users().messages().modify(
                    userId='me', 
                    id=msg['id'], 
                    body={'addLabelIds': [req.label_id]}
                ).execute()
                labeled_count += 1
            except:
                continue
        
        return {"result": {
            'labeled_count': labeled_count,
            'label_id': req.label_id,
            'query': req.query
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.gmail_get_or_create_label")
def gmail_get_or_create_label(req: GmailGetOrCreateLabelRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('gmail', 'v1', credentials=credentials)
        
        # Check if label exists
        result = service.users().labels().list(userId='me').execute()
        labels = result.get('labels', [])
        
        existing = next((label for label in labels if label['name'] == req.name), None)
        if existing:
            return {"result": {
                'label_id': existing['id'],
                'name': existing['name'],
                'created': False
            }}
        
        # Create new label
        label_body = {
            'name': req.name,
            'labelListVisibility': 'labelShow',
            'messageListVisibility': 'show'
        }
        
        if req.background_color or req.text_color:
            label_body['color'] = {}
            if req.background_color:
                label_body['color']['backgroundColor'] = req.background_color
            if req.text_color:
                label_body['color']['textColor'] = req.text_color
        
        new_label = service.users().labels().create(userId='me', body=label_body).execute()
        
        return {"result": {
            'label_id': new_label['id'],
            'name': new_label['name'],
            'created': True
        }}
    except Exception as e:
        return {"error": str(e)}

# Google Sheets endpoints
@app.post("/invoke/google.sheets_create")
def sheets_create(req: SheetsCreateRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('sheets', 'v4', credentials=credentials)
        
        spreadsheet = {
            'properties': {
                'title': req.title
            }
        }
        
        result = service.spreadsheets().create(body=spreadsheet).execute()
        
        return {"result": {
            'spreadsheet_id': result['spreadsheetId'],
            'title': result['properties']['title'],
            'url': result['spreadsheetUrl']
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.sheets_get")
def sheets_get(req: SheetsGetRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('sheets', 'v4', credentials=credentials)
        
        result = service.spreadsheets().get(spreadsheetId=req.spreadsheet_id).execute()
        
        sheets = []
        for sheet in result.get('sheets', []):
            properties = sheet['properties']
            sheets.append({
                'sheet_id': properties['sheetId'],
                'title': properties['title'],
                'row_count': properties.get('gridProperties', {}).get('rowCount', 0),
                'col_count': properties.get('gridProperties', {}).get('columnCount', 0)
            })
        
        return {"result": {
            'title': result['properties']['title'],
            'sheets': sheets
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.sheets_read")
def sheets_read(req: SheetsReadRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('sheets', 'v4', credentials=credentials)
        
        range_str = f"{req.sheet_name}!{req.range}" if req.range != f"{req.sheet_name}!A1:Z1000" else req.range
        result = service.spreadsheets().values().get(
            spreadsheetId=req.spreadsheet_id,
            range=range_str
        ).execute()
        
        values = result.get('values', [])
        
        return {"result": {
            'values': values,
            'row_count': len(values),
            'col_count': len(values[0]) if values else 0
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.sheets_write")
def sheets_write(req: SheetsWriteRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('sheets', 'v4', credentials=credentials)
        
        body = {
            'values': req.values
        }
        
        result = service.spreadsheets().values().update(
            spreadsheetId=req.spreadsheet_id,
            range=req.range,
            valueInputOption=req.value_input_option,
            body=body
        ).execute()
        
        return {"result": {
            'updated_rows': result.get('updatedRows', 0),
            'updated_cols': result.get('updatedColumns', 0),
            'updated_cells': result.get('updatedCells', 0)
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.sheets_append")
def sheets_append(req: SheetsAppendRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('sheets', 'v4', credentials=credentials)
        
        body = {
            'values': req.values
        }
        
        result = service.spreadsheets().values().append(
            spreadsheetId=req.spreadsheet_id,
            range=req.range,
            valueInputOption='USER_ENTERED',
            body=body
        ).execute()
        
        updates = result.get('updates', {})
        
        return {"result": {
            'appended_range': updates.get('updatedRange', ''),
            'appended_rows': updates.get('updatedRows', 0)
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.sheets_clear")
def sheets_clear(req: SheetsClearRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('sheets', 'v4', credentials=credentials)
        
        result = service.spreadsheets().values().clear(
            spreadsheetId=req.spreadsheet_id,
            range=req.range
        ).execute()
        
        return {"result": {
            'cleared_range': result.get('clearedRange', req.range)
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.sheets_list")
def sheets_list(req: SheetsListRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('drive', 'v3', credentials=credentials)
        
        result = service.files().list(
            q="mimeType='application/vnd.google-apps.spreadsheet'",
            pageSize=50,
            fields="files(id,name,createdTime,modifiedTime)"
        ).execute()
        
        files = result.get('files', [])
        
        return {"result": [{
            'id': f['id'],
            'name': f['name'],
            'created_time': f['createdTime'],
            'modified_time': f['modifiedTime']
        } for f in files]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.sheets_add_sheet")
def sheets_add_sheet(req: SheetsAddSheetRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('sheets', 'v4', credentials=credentials)
        
        batch_update_body = {
            'requests': [{
                'addSheet': {
                    'properties': {
                        'title': req.sheet_name
                    }
                }
            }]
        }
        
        result = service.spreadsheets().batchUpdate(
            spreadsheetId=req.spreadsheet_id,
            body=batch_update_body
        ).execute()
        
        sheet = result['replies'][0]['addSheet']['properties']
        
        return {"result": {
            'sheet_id': sheet['sheetId'],
            'sheet_name': sheet['title']
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/google.sheets_delete_rows")
def sheets_delete_rows(req: SheetsDeleteRowsRequest):
    try:
        credentials = get_google_credentials(req.user_id)
        service = build('sheets', 'v4', credentials=credentials)
        
        batch_update_body = {
            'requests': [{
                'deleteDimension': {
                    'range': {
                        'sheetId': req.sheet_id,
                        'dimension': 'ROWS',
                        'startIndex': req.start_index,
                        'endIndex': req.end_index
                    }
                }
            }]
        }
        
        service.spreadsheets().batchUpdate(
            spreadsheetId=req.spreadsheet_id,
            body=batch_update_body
        ).execute()
        
        return {"result": {
            'deleted': True
        }}
    except Exception as e:
        return {"error": str(e)}
