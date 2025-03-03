# reset_database.py
from app.db.reset_db import reset_db
from app.db.session import SessionLocal

if __name__ == "__main__":
    print("WARNING: This will delete all data in the database.")
    confirmation = input("Are you sure you want to continue? (y/n): ")
    
    if confirmation.lower() == 'y':
        db = SessionLocal()
        try:
            reset_db(db)
            print("Database reset successful!")
        finally:
            db.close()
    else:
        print("Database reset cancelled.") 