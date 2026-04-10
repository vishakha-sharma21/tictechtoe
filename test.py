from pymongo import MongoClient

MONGODB_URI="mongodb+srv://vishakhasharmadpsv_db_user:AJUtuJt1oJcuqS03@nextflow.ltc1rjp.mongodb.net/nexflow?retryWrites=true&w=majority"

client = MongoClient(MONGODB_URI)
db = client["nexflow"]

# insert dummy data
db.users.insert_one({
    "user_id": "test_user_1"
})

print(db.list_collection_names())