import threading
import time
from datetime import datetime, timezone, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import get_supabase
from app.routes.chat import router as chat_router
from app.routes.facilities import router as facilities_router
from app.routes.files import router as files_router
from app.routes.journal import router as journal_router
from app.routes.records import router as records_router
from app.routes.reflection import router as reflection_router
from app.routes.sessions import router as sessions_router
from app.routes.sync import router as sync_router
from app.services.reflection import generate_reflection, store_reflection

WIB = timezone(timedelta(hours=7))
DAYS = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"]


def reflection_worker():
    while True:
        now = datetime.now(WIB)
        is_sunday = now.weekday() == 6
        is_evening = now.hour == 18 and now.minute < 5

        if is_sunday and is_evening and settings.llm_api_key:
            try:
                db = get_supabase()
                users = db.table("journal_entries").select("user_id").execute().data or []
                seen = set()
                for row in users:
                    uid = row["user_id"]
                    if uid in seen:
                        continue
                    seen.add(uid)
                    try:
                        content = generate_reflection(uid)
                        store_reflection(uid, content)
                    except Exception:
                        pass
            except Exception:
                pass

        time.sleep(300)


app = FastAPI(title="Personal Health Companion")


@app.on_event("startup")
def startup():
    t = threading.Thread(target=reflection_worker, daemon=True)
    t.start()

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
app.include_router(reflection_router)
app.include_router(sessions_router)
app.include_router(sync_router)


@app.get("/health")
def health():
    return {"status": "ok"}
