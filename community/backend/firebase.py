import os, json
import firebase_admin
from firebase_admin import credentials, auth as fb_auth, firestore
from fastapi import HTTPException
import time

def consume_sso_code(code: str) -> str:
    """
    sso_codes/{code} 문서에서 uid를 꺼내서
    Firebase Custom Token을 발급해 반환한다.
    """
    ref = db.collection("sso_codes").document(code)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=400, detail="Invalid code")

    data = doc.to_dict() or {}

    if data.get("used") is True:
        raise HTTPException(status_code=400, detail="Code already used")

    if int(time.time()) > int(data.get("expiresAt", 0)):
        raise HTTPException(status_code=400, detail="Code expired")

    uid = data.get("uid")
    if not uid:
        raise HTTPException(status_code=400, detail="Code has no uid")

    # 1회용 처리
    ref.update({"used": True})

    # Custom token 발급
    custom_token = fb_auth.create_custom_token(uid).decode("utf-8")
    return custom_token


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
