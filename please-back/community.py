# community.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import json, uuid

router = APIRouter()

DB = Path("community.json")

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
        encoding="utf-8"
    )


# ----- 요청 바디 -----
class PostCreate(BaseModel):
    uid: str
    nickname: str
    title: str
    body: str

class CommentCreate(BaseModel):
    uid: str
    nickname: str
    body: str


# ========== 1) 글 작성 ==========
@router.post("/posts")
def create_post(body: PostCreate):
    db = load_db()
    posts = db.setdefault("posts", [])

    post_id = str(uuid.uuid4())
    now = now_kst_iso()

    post = {
        "postId": post_id,
        "uid": body.uid,
        "nickname": body.nickname,
        "title": body.title,
        "body": body.body,
        "createdAt": now,
        "updatedAt": now,
        "comments": []  # 댓글 배열
    }
    posts.append(post)
    save_db(db)
    return post


# ========== 2) 글 목록 (제목 + 날짜 + 페이징) ==========
@router.get("/posts")
def list_posts(page: int = 1, page_size: int = 10):
    """
    유저 커뮤니티 목록 API
    - 응답: 제목, 작성자, 작성일, 댓글 수만 포함
    """
    db = load_db()
    posts = sorted(
        db.get("posts", []),
        key=lambda p: p.get("createdAt", ""),
        reverse=True,  # 최신 글 먼저
    )

    total_items = len(posts)
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10

    start = (page - 1) * page_size
    end = start + page_size
    slice_posts = posts[start:end]

    # 리스트에서는 필요한 정보만 축약
    items = [
        {
            "postId": p["postId"],
            "title": p["title"],
            "nickname": p.get("nickname", ""),
            "createdAt": p.get("createdAt", ""),
            "commentCount": len(p.get("comments", [])),
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


# ========== 3) 글 상세 (제목 + 작성자 + 내용 + 댓글) ==========
@router.get("/posts/{post_id}")
def get_post_detail(post_id: str):
    db = load_db()
    for p in db.get("posts", []):
        if p.get("postId") == post_id:
            # 댓글은 작성 시간 기준 정렬
            comments = sorted(
                p.get("comments", []),
                key=lambda c: c.get("createdAt", "")
            )
            return {
                "postId": p["postId"],
                "title": p["title"],
                "body": p["body"],
                "uid": p["uid"],
                "nickname": p.get("nickname", ""),
                "createdAt": p.get("createdAt", ""),
                "updatedAt": p.get("updatedAt", ""),
                "comments": comments,
            }
    raise HTTPException(status_code=404, detail="post not found")


# ========== 4) 댓글 작성 ==========
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
