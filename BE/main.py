from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.chat import router as chat_router
from app.routes.facilities import router as facilities_router
from app.routes.files import router as files_router
from app.routes.journal import router as journal_router
from app.routes.records import router as records_router
from app.routes.sessions import router as sessions_router
from app.routes.sync import router as sync_router

app = FastAPI(title="Personal Health Companion")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(facilities_router)
app.include_router(files_router)
app.include_router(journal_router)
app.include_router(records_router)
app.include_router(sessions_router)
app.include_router(sync_router)


@app.get("/health")
def health():
    return {"status": "ok"}
