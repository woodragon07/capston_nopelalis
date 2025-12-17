from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .community import router as community_router

app = FastAPI(
    title="Please Community API",
    version="0.1.0",
)

BASE_DIR = Path(__file__).resolve().parent

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://please-community-frontend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # Authorization 포함
)

app.include_router(
    community_router,
    prefix="/community",
    tags=["community"],
)

UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads",
)

@app.get("/")
def read_root():
    return {"message": "Community backend running"}
