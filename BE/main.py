from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.records import router as records_router

app = FastAPI(title="Personal Health Companion")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(records_router)


@app.get("/health")
def health():
    return {"status": "ok"}
