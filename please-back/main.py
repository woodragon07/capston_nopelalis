from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime, timezone, timedelta
import json, uuid, time

app = FastAPI(title="CAP Stats JSON")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- JSON 파일 경로 ---
PLAYERS_DB = Path("players.json")  # 각 플레이어 × 스테이지 통계
CASES_DB = Path("cases.json")      # Case 전체 통계

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
