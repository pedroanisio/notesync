# db/reset_db.py
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.models import Base
from app.db.session import engine
from app.db.init_db import init_db

def reset_db(db: Session) -> None:
    """Drop all tables and recreate them"""
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    
    # Initialize database with required extensions
    init_db(db)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("Database reset complete. All tables dropped and recreated.")

if __name__ == "__main__":
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        reset_db(db)
    finally:
        db.close() 