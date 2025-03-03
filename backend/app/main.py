# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.models import Base
from app.db.session import engine, SessionLocal
from app.core.config import settings
from app.api.routes import notes, revisions
from app.db.init_db import init_db

# Initialize database with required extensions
db = SessionLocal()
try:
    init_db(db)
finally:
    db.close()

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    notes.router,
    prefix=f"{settings.API_V1_STR}/notes",
    tags=["notes"]
)

app.include_router(
    revisions.router,
    prefix=f"{settings.API_V1_STR}/notes",
    tags=["revisions"]
)

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)