from sqlalchemy import text
from sqlalchemy.orm import Session

def init_db(db: Session) -> None:
    """Initialize database with required extensions and settings"""
    # Create pgvector extension if it doesn't exist
    db.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    db.commit() 