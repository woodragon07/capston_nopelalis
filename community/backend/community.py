from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta
import json, uuid

router = APIRouter()

DB = Path("community.json")
UPLOAD_DIR = Path("uploads")  # main.py에서도 같은 폴더를 StaticFiles로 마운트

# ----- 시간 & JSON 유틸 -----
TZ_KST = timezone(timedelta(hours=9), name="KST")


def now_kst_iso() -> str:
    return datetime.now(TZ_KST).isoformat()


def load_db() -> Dict[str, Any]:
    """community.json을 UTF-8로 읽어서 dict로 반환"""
    if not DB.exists():
        return {"posts": []}
    try:
        return json.loads(DB.read_text(encoding="utf-8"))
    except Exception:
        return {"posts": []}


def save_db(data: Dict[str, Any]) -> None:
    """dict를 community.json에 UTF-8로 저장"""
    DB.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


class CommentCreate(BaseModel):
    uid: str
    nickname: str
    body: str


# ========== 1) 글 작성 (텍스트 + 이미지 업로드) ==========
@router.post("/posts")
async def create_post(
    uid: str = Form(...),
    nickname: str = Form(...),
    title: str = Form(...),
    body: str = Form(""),
    image: UploadFile | None = File(None),
):
    """
    게시글 작성 API (multipart/form-data)
    - 필드: uid, nickname, title, body, image(옵션)
    - image가 있으면 /uploads/... 에 저장하고 imageUrl을 글에 포함
    """
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

        image_url = f"/uploads/{filename}"

    post = {
        "postId": post_id,
        "uid": uid,
        "nickname": nickname,
        "title": title,
        "body": body,
        "createdAt": now,
        "updatedAt": now,
        "imageUrl": image_url,  # 없으면 null
        "comments": [],
    }
    posts.append(post)
    save_db(db)
    return post


# ========== 2) 글 목록 (제목 + 날짜 + 페이징) ==========
@router.get("/posts")
def list_posts(page: int = 1, page_size: int = 10):
    """
    유저 커뮤니티 목록 API
    - 응답: 제목, 작성자, 작성일, 댓글 수(+ imageUrl)
    """
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


# ========== 3) 글 상세 (제목 + 작성자 + 내용 + 댓글 + 이미지) ==========
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


# ========== 4) 글 수정 (텍스트 + 이미지 교체 가능) ==========
@router.put("/posts/{post_id}")
async def update_post(
    post_id: str,
    title: str | None = Form(None),
    body: str | None = Form(None),
    image: UploadFile | None = File(None),
):
    """
    게시글 수정 API
    """
    db = load_db()
    posts = db.get("posts", [])

    for p in posts:
        if p.get("postId") == post_id:
            # 텍스트 수정
            if title is not None:
                p["title"] = title
            if body is not None:
                p["body"] = body

            # 이미지 수정
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
def delete_post(post_id: str):
    db = load_db()
    posts = db.get("posts", [])

    new_posts = [p for p in posts if p.get("postId") != post_id]
    if len(new_posts) == len(posts):
        raise HTTPException(status_code=404, detail="post not found")

    db["posts"] = new_posts
    save_db(db)
    return {"ok": True}


# ========== 6) 댓글 작성 ==========
@router.post("/posts/{post_id}/comments")
def add_comment(post_id: str, body: CommentCreate):
    db = load_db()
    posts = db.get("posts", [])

    for p in posts:
        if p.get("postId") == post_id:
            comment = {
                "commentId": str(uuid.uuid4()),
                "uid": body.uid,
                "nickname": body.nickname,
                "body": body.body,
                "createdAt": now_kst_iso(),
            }
            p.setdefault("comments", []).append(comment)
            p["updatedAt"] = now_kst_iso()
            save_db(db)
            return comment

    raise HTTPException(status_code=404, detail="post not found")
