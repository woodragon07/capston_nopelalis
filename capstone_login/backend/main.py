# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, auth

app = FastAPI()

# 1. CORS 설정 (프론트엔드에서 오는 요청 허용)
# 배포 후에는 allow_origins에 실제 도메인 주소를 넣어야 합니다.
origins = [
    "http://localhost:5173", # 로컬 React 주소
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Firebase 초기화 (나중에 키 파일 경로를 실제 파일로 바꿔야 함)
# try-except는 서버 재실행 시 중복 연결 에러 방지용
try:
    # cred = credentials.Certificate("serviceAccountKey.json") # 키 파일 경로
    # firebase_admin.initialize_app(cred)
    print("Firebase 연결 설정 공간 (아직 키 파일 없음)")
except Exception as e:
    print(f"Firebase 초기화 에러: {e}")

@app.get("/")
def read_root():
    return {"message": "백엔드 서버가 정상 작동 중입니다!"}

@app.get("/login_check")
def login_check():
    # 나중에 여기서 DB랑 통신하는 로직을 짭니다.
    return {"status": "로그인 기능 준비 완료"}