# core/config.py
import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Base Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "NoteSync"
    
    # Database
    DATABASE_URI: str = os.getenv(
        "DATABASE_URI", 
        "postgresql://postgres:postgres@db:5432/notesdb"
    )
    
    # Vector Embeddings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"  # Sentence transformer model
    VECTOR_DIMENSIONS: int = 384  # Dimensions for vector embeddings (all-MiniLM-L6-v2 produces 384-dim vectors)

    # Security (for POC, simplified)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret_key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()