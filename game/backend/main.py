from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime, timezone, timedelta
from community.backend.community import router as community_router
import json, uuid, time
import os
from firebase_admin import credentials, firestore, initialize_app

app = FastAPI(title="CAP Stats JSON")

# --- Firebase 초기화 12.03---
FIREBASE_ENABLED = False
fb_db = None

cred_json = os.environ.get("FIREBASE_CREDENTIALS")

if cred_json:
    try:
        cred_dict = json.loads(cred_json)
        cred = credentials.Certificate(cred_dict)
        firebase_app = initialize_app(cred)
        fb_db = firestore.client()
        FIREBASE_ENABLED = True
        print("Firebase initialized successfully")
    except Exception as e:
        print("Firebase init failed:", e)
else:
    print("FIREBASE_CREDENTIALS env not set, running without Firebase")

# 1. 현재 파일(main.py)이 있는 폴더의 절대 경로 구하기
BASE_DIR = Path(__file__).resolve().parent

# -- CORS 설정 및 정적 파일 서빙 ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. 모든 경로를 BASE_DIR 기준으로 설정 (backend 폴더 안으로 고정)
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.include_router(community_router, prefix="/community", tags=["community"])

# --- JSON 파일 경로 ---
PLAYERS_DB = BASE_DIR / "players.json"  # 각 플레이어 × 스테이지 통계
CASES_DB = BASE_DIR / "cases.json"      # Case 전체 통계

# --- 세션(시작~종료 구간)은 메모리에만 유지 ---
SESSIONS: Dict[str, dict] = {}

# --- 시간 ---
def now_epoch() -> int:
    # 서버 기준 epoch(초) – 플레이 시간 계산용
    return int(time.time())

TZ_KST = timezone(timedelta(hours=9), name="KST")

def now_kst_iso() -> str:
    # KST 문자열, 수정 필요
    return datetime.now(TZ_KST).isoformat()

# --- 공용 JSON 입출력 ---
def load(path: Path, *, default: dict) -> dict:
    if not path.exists():
        return default.copy()
    try:
        return json.loads(path.read_text())
    except Exception:
        return default.copy()

def save(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2))


# --- 요청 바디 스키마 ---
class StartIn(BaseModel):
    uid: str
    caseid: str

class EndIn(BaseModel):
    session_id: str
    judge: bool              # 이번 플레이 판정 (True/False)
    caseid: Optional[str] = None  # 옵션: caseid 보정용


# --- 세션 시작: 메모리에만 저장 ---
@app.post("/events/start")
def start_session(body: StartIn):
    sid = str(uuid.uuid4())
    start_kst = now_kst_iso()

    SESSIONS[sid] = {
        "uid": body.uid,
        "caseid": body.caseid,
        "start": now_epoch(),   # 초
        "start_kst": start_kst, # KST 문자열
    }

    return {"session_id": sid, "startTime": start_kst}


# --- 세션 종료: 플레이 시간 계산 + JSON 두 군데 갱신 ---
@app.post("/events/end")
def end_session(body: EndIn):
    session = SESSIONS.get(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    end_ts = now_epoch()
    end_kst = now_kst_iso()
    elapsed = max(0, end_ts - session["start"])  # 이번 판 플레이 시간(초)

    uid = session["uid"]
    caseid = body.caseid or session["caseid"]

    # 1) players.json 갱신 (각 플레이어 × 스테이지)
    players_doc = load(PLAYERS_DB, default={"players": {}})
    players = players_doc.setdefault("players", {})

    user_cases = players.get(uid) or {}
    prev = user_cases.get(caseid)

    old_count = prev.get("playCount", 0) if prev else 0
    old_avg = prev.get("avgTimeSeconds", 0.0) if prev else 0.0

     #--------------
    # 기존 클리어 횟수 가져오기 (없으면 0)
    old_clear = prev.get("clearCount", 0) if prev else 0
    
    # 이번 판이 정답(judge=True)이면 +1, 아니면 그대로
    new_clear = old_clear + 1 if body.judge else old_clear
    #----------------

    new_count = old_count + 1
    new_total = old_avg * old_count + elapsed
    new_avg = new_total / new_count if new_count else 0.0

    # 각 플레이어의 스테이지별 최종 형태:
    user_cases[caseid] = {
        "uid": uid,
        "caseid": caseid,
        "startTime": session["start_kst"],  # 이번 판 시작 시간
        "endTime": end_kst,                 # 이번 판 끝난 시간
        "judge": body.judge,                # 이번 판 결과
        "avgTimeSeconds": new_avg,          # 이 유저가 이 스테이지를 플레이한 평균 시간
        "playCount": new_count,             # 이 유저의 이 스테이지 누적 플레이 횟수
        "clearCount": new_clear,            # 클리어 횟수
    }
    players[uid] = user_cases
    save(PLAYERS_DB, players_doc)

    # 2) cases.json 갱신 (Case 전체 통계 + true/false 카운트)
    cases_doc = load(CASES_DB, default={"cases": {}})
    cases = cases_doc.setdefault("cases", {})

    case_stats = cases.get(caseid)
    c_old_count = case_stats.get("playCount", 0) if case_stats else 0
    c_total = case_stats.get("totalTimeSeconds", 0) if case_stats else 0
    c_true = case_stats.get("trueCount", 0) if case_stats else 0
    c_false = case_stats.get("falseCount", 0) if case_stats else 0

    c_new_count = c_old_count + 1
    c_total_new = c_total + elapsed
    c_avg_new = c_total_new / c_new_count if c_new_count else 0.0

    # 이번 판 judge에 따라 true/false 증가
    if body.judge:
        c_true += 1
    else:
        c_false += 1

    # 각 case 별 최종 형태:
    cases[caseid] = {
        "caseid": caseid,
        "playCount": c_new_count,          # 이 case가 전체 몇 번 플레이되었는지
        "totalTimeSeconds": c_total_new,   # 모든 유저의 이 case 플레이 시간 합
        "avgTimeSeconds": c_avg_new,       # 이 case의 전체 평균 플레이 시간
        "trueCount": c_true,               # judge = true 횟수
        "falseCount": c_false              # judge = false 횟수
    }
    save(CASES_DB, cases_doc)
        # --- Firebase에도 저장 (배포 서버용) ---
    if FIREBASE_ENABLED and fb_db is not None:
        try:
            # 1) 플레이어별 스테이지 통계 저장
            #    player_stats 컬렉션 안에 uid 문서 하나에 전부 모아서 저장
            fb_db.collection("player_stats").document(uid).set(
                {
                    "uid": uid,
                    "cases": user_cases,  # 이 유저가 플레이한 모든 case 통계
                },
                merge=True,  # 기존 데이터와 병합
            )

            # 2) 케이스별 전체 통계 저장
            #    case_stats 컬렉션 안에 caseid 문서로 저장
            fb_db.collection("case_stats").document(caseid).set(
                cases[caseid],
                merge=True,
            )

            # 3) 세션 로그도 하나씩 남기고 싶으면 (선택)
            fb_db.collection("session_logs").add(
                {
                    "uid": uid,
                    "caseid": caseid,
                    "judge": body.judge,
                    "elapsed": elapsed,
                    "startTime": session["start_kst"],
                    "endTime": end_kst,
                }
            )

        except Exception as e:
            print(" Firebase save failed:", e)
    # 세션 정보는 메모리에서 삭제

    del SESSIONS[body.session_id]

    # 응답은 디버깅/확인용
    return {
        "session_id": body.session_id,
        "uid": uid,
        "caseid": caseid,
        "timeSpentSeconds": elapsed,
        "playerStage": user_cases[caseid],
        "caseStats": cases[caseid],
    }
