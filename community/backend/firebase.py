import os, json
import firebase_admin
from firebase_admin import credentials, auth as fb_auth, firestore
from fastapi import HTTPException

def _init_firebase():
    if firebase_admin._apps:
        return

    cred_json = os.environ.get("FIREBASE_CREDENTIALS")
    if not cred_json:
        raise RuntimeError("FIREBASE_CREDENTIALS env not set")

    try:
        cred_dict = json.loads(cred_json)
    except Exception as e:
        raise RuntimeError(f"FIREBASE_CREDENTIALS is not valid JSON: {e}")

    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)

_init_firebase()
db = firestore.client()

def get_uid(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.split(" ", 1)[1].strip()
    try:
        decoded = fb_auth.verify_id_token(token)
        return decoded["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_user_profile(uid: str) -> dict | None:
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()
    if user_doc.exists:
        return user_doc.to_dict()
    return None
