from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# community.py 안의 router 불러오기
from community import router as community_router

app = FastAPI(
    title="Please Community API",
    version="0.1.0",
)

# ----- CORS 설정 (프론트엔드에서 호출할 수 있게) -----
# 필요에 따라 origin 수정
origins = [
    "http://localhost:5173",  # Vite 기본 포트
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- 라우터 연결 -----
app.include_router(
    community_router,
    prefix="/community",
    tags=["community"],
)

# ----- 업로드 폴더 Static 마운트 -----
# community.py에서 UPLOAD_DIR = Path("uploads")로 쓰고 있으니
# 같은 폴더를 정적 파일로 노출
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads",
)

# (옵션) 헬스 체크용 루트 엔드포인트
@app.get("/")
def read_root():
    return {"message": "Community backend running"}
