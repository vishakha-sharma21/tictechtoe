import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.environ["MONGODB_URI"]
DB_NAME = os.getenv("MONGODB_DB", "nexflow")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users_col = db["users"]
integrations_col = db["integrations"]
llm_keys_col = db["llm_keys"]
chats_col = db["chats"]
