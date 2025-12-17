from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Header
from pydantic import BaseModel
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta
import json, uuid

from .firebase import get_uid, get_user_profile, consume_sso_code

router = APIRouter()

class SSOConsume(BaseModel):
    code: str

@router.post("/sso/consume")
def sso_consume(body: SSOConsume):
    token = consume_sso_code(body.code.strip())
    return {"customToken": token}

# ✅ 파일 위치 기준으로 경로 고정 (배포에서 꼬임 방지)
BASE_DIR = Path(__file__).resolve().parent
DB = BASE_DIR / "community.json"
UPLOAD_DIR = BASE_DIR / "uploads"

# ----- 시간 & JSON 유틸 -----
TZ_KST = timezone(timedelta(hours=9), name="KST")

def now_kst_iso() -> str:
    return datetime.now(TZ_KST).isoformat()

def load_db() -> Dict[str, Any]:
    if not DB.exists():
        return {"posts": []}
    try:
        return json.loads(DB.read_text(encoding="utf-8"))
    except Exception:
        return {"posts": []}

def save_db(data: Dict[str, Any]) -> None:
    DB.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

class CommentCreate(BaseModel):
    # ✅ 호환성 위해 uid/nickname은 optional로 두고,
    # 실제 저장 uid는 토큰에서 뽑는 것을 우선합니다.
    uid: Optional[str] = None
    nickname: Optional[str] = None
    body: str

# ========== 1) 글 작성 (텍스트 + 이미지 업로드) ==========
@router.post("/posts")
async def create_post(
    authorization: str | None = Header(default=None),
    nickname: str = Form(...),
    title: str = Form(...),
    body: str = Form(""),
    image: UploadFile | None = File(None),
):
    """
    게시글 작성 API (multipart/form-data)
    - Authorization: Bearer <firebase id token>
    - nickname, title, body, image(옵션)
    """
    uid = get_uid(authorization)

    # nickname이 비어있으면 users 컬렉션에서 보정(있을 때만)
    nick = (nickname or "").strip()
    if not nick:
        profile = get_user_profile(uid)
        nick = (profile or {}).get("nickname") or (profile or {}).get("name") or "익명"

    db = load_db()
    posts = db.setdefault("posts", [])

    post_id = str(uuid.uuid4())
    now = now_kst_iso()
    image_url: Optional[str] = None

    # 이미지 저장
    if image and image.filename:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        ext = Path(image.filename).suffix.lower()
        filename = f"{post_id}{ext}"
        dest = UPLOAD_DIR / filename

        with dest.open("wb") as f:
            while True:
                chunk = await image.read(1024 * 1024)
                if not chunk:
                    break
                f.write(chunk)

        # ✅ 상대경로로 저장(프론트에서 API_BASE_URL 붙여서 사용)
        image_url = f"/uploads/{filename}"

    post = {
        "postId": post_id,
        "uid": uid,
        "nickname": nick,
        "title": title,
        "body": body,
        "createdAt": now,
        "updatedAt": now,
        "imageUrl": image_url,
        "comments": [],
    }
    posts.append(post)
    save_db(db)
    return post

# ========== 2) 글 목록 ==========
@router.get("/posts")
def list_posts(page: int = 1, page_size: int = 10):
    db = load_db()
    posts = sorted(
        db.get("posts", []),
        key=lambda p: p.get("createdAt", ""),
        reverse=True,
    )

    total_items = len(posts)
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10

    start = (page - 1) * page_size
    end = start + page_size
    slice_posts = posts[start:end]

    items = [
        {
            "postId": p["postId"],
            "title": p["title"],
            "nickname": p.get("nickname", ""),
            "createdAt": p.get("createdAt", ""),
            "commentCount": len(p.get("comments", [])),
            "imageUrl": p.get("imageUrl"),
        }
        for p in slice_posts
    ]

    total_pages = (total_items + page_size - 1) // page_size if page_size else 1

    return {
        "page": page,
        "pageSize": page_size,
        "totalPages": total_pages,
        "totalItems": total_items,
        "items": items,
    }

# ========== 3) 글 상세 ==========
@router.get("/posts/{post_id}")
def get_post_detail(post_id: str):
    db = load_db()
    for p in db.get("posts", []):
        if p.get("postId") == post_id:
            comments = sorted(
                p.get("comments", []),
                key=lambda c: c.get("createdAt", ""),
            )
            return {
                "postId": p["postId"],
                "title": p["title"],
                "body": p["body"],
                "uid": p["uid"],
                "nickname": p.get("nickname", ""),
                "createdAt": p.get("createdAt", ""),
                "updatedAt": p.get("updatedAt", ""),
                "imageUrl": p.get("imageUrl"),
                "comments": comments,
            }
    raise HTTPException(status_code=404, detail="post not found")

# ========== 4) 글 수정 ==========
@router.put("/posts/{post_id}")
async def update_post(
    post_id: str,
    authorization: str | None = Header(default=None),
    title: str | None = Form(None),
    body: str | None = Form(None),
    image: UploadFile | None = File(None),
):
    uid = get_uid(authorization)

    db = load_db()
    posts = db.get("posts", [])

    for p in posts:
        if p.get("postId") == post_id:
            # ✅ 작성자만 수정 가능
            if p.get("uid") != uid:
                raise HTTPException(status_code=403, detail="forbidden")

            if title is not None:
                p["title"] = title
            if body is not None:
                p["body"] = body

            if image and image.filename:
                UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
                ext = Path(image.filename).suffix.lower()
                filename = f"{post_id}{ext}"
                dest = UPLOAD_DIR / filename

                with dest.open("wb") as f:
                    while True:
                        chunk = await image.read(1024 * 1024)
                        if not chunk:
                            break
                        f.write(chunk)

                p["imageUrl"] = f"/uploads/{filename}"

            p["updatedAt"] = now_kst_iso()
            save_db(db)

            comments = sorted(
                p.get("comments", []),
                key=lambda c: c.get("createdAt", ""),
            )
            return {
                "postId": p["postId"],
                "title": p["title"],
                "body": p["body"],
                "uid": p["uid"],
                "nickname": p.get("nickname", ""),
                "createdAt": p.get("createdAt", ""),
                "updatedAt": p.get("updatedAt", ""),
                "imageUrl": p.get("imageUrl"),
                "comments": comments,
            }

    raise HTTPException(status_code=404, detail="post not found")

# ========== 5) 글 삭제 ==========
@router.delete("/posts/{post_id}")
def delete_post(
    post_id: str,
    authorization: str | None = Header(default=None),
):
    uid = get_uid(authorization)

    db = load_db()
    posts = db.get("posts", [])

    target = None
    for p in posts:
        if p.get("postId") == post_id:
            target = p
            break

    if not target:
        raise HTTPException(status_code=404, detail="post not found")

    # ✅ 작성자만 삭제 가능
    if target.get("uid") != uid:
        raise HTTPException(status_code=403, detail="forbidden")

    db["posts"] = [p for p in posts if p.get("postId") != post_id]
    save_db(db)
    return {"ok": True}

# ========== 6) 댓글 작성 ==========
@router.post("/posts/{post_id}/comments")
def add_comment(
    post_id: str,
    body: CommentCreate,
    authorization: str | None = Header(default=None),
):
    # ✅ 토큰 있으면 토큰 우선, 없으면(호환) body.uid를 요구
    if authorization and authorization.startswith("Bearer "):
        uid = get_uid(authorization)
        profile = get_user_profile(uid)
        nickname = (body.nickname or "").strip() or (profile or {}).get("nickname") or (profile or {}).get("name") or "익명"
    else:
        if not body.uid:
            raise HTTPException(status_code=401, detail="Missing token")
        uid = body.uid
        nickname = (body.nickname or "").strip() or "익명"

    if not body.body.strip():
        raise HTTPException(status_code=400, detail="comment body is empty")

    db = load_db()
    posts = db.get("posts", [])

    for p in posts:
        if p.get("postId") == post_id:
            comment = {
                "commentId": str(uuid.uuid4()),
                "uid": uid,
                "nickname": nickname,
                "body": body.body,
                "createdAt": now_kst_iso(),
            }
            p.setdefault("comments", []).append(comment)
            p["updatedAt"] = now_kst_iso()
            save_db(db)
            return comment

    raise HTTPException(status_code=404, detail="post not found")
