import os
import pytest
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator, Any
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from app.db.models import Base
from app.services.note_service import NoteService
from app.services.revision_service import RevisionService
from tests.factories import NoteFactory

# Test database URL - use PostgreSQL for tests
TEST_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/test_db")

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def test_engine():
    # Create a test database connection
    engine = create_engine(TEST_DATABASE_URL)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    # Drop all tables when done with all tests
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(test_engine) -> Generator[Session, Any, None]:
    # Create a new session for the test
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    
    # Start with a clean slate for each test
    for table in reversed(Base.metadata.sorted_tables):
        session.execute(table.delete())
    session.commit()
    
    try:
        yield session
    finally:
        # Roll back any changes made during the test
        session.rollback()
        session.close()

@pytest.fixture
def client(db_session) -> Generator[TestClient, Any, None]:
    """
    Create a test client using a test database session
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as client:
        yield client
    
    # Reset the dependency override
    app.dependency_overrides.clear()

@pytest.fixture
def note_service(db_session) -> NoteService:
    """Fixture for NoteService with test database session"""
    return NoteService()

@pytest.fixture
def revision_service(db_session) -> RevisionService:
    """Fixture for RevisionService with test database session"""
    return RevisionService()

@pytest.fixture
def sample_note(db_session) -> dict:
    """Create a sample note for testing using factory"""
    note = NoteFactory.create(
        db=db_session,
        title="Test Note",
        raw_content="This is a test note with some #tags and content.",
        tags=["test", "sample"]
    )
    return {
        "id": note.id,
        "title": note.title,
        "raw_content": note.raw_content,
        "tags": note.tags
    }

@pytest.fixture
def sample_notes(db_session) -> list:
    """Create multiple sample notes for testing using factory"""
    notes = NoteFactory.create_batch(db_session, 5)
    return [{
        "id": note.id,
        "title": note.title,
        "raw_content": note.raw_content,
        "tags": note.tags
    } for note in notes]

@pytest.fixture
def linked_notes(db_session) -> list:
    """Create notes with links for testing using factory"""
    notes = NoteFactory.create_with_links(db_session, 2)
    
    # Make sure the session is committed and notes are refreshed
    db_session.commit()
    for note in notes:
        db_session.refresh(note)
    
    return [{
        "id": note.id,
        "title": note.title,
        "raw_content": note.raw_content,
        "tags": note.tags,
        "links_to": note.links_to,
        "links_from": note.links_from
    } for note in notes]

@pytest.fixture
def notes_with_revisions(db_session) -> dict:
    """Create a note with multiple revisions"""
    note = NoteFactory.create_with_revisions(db_session, 3)
    return {
        "id": note.id,
        "title": note.title,
        "raw_content": note.raw_content,
        "tags": note.tags
    }

@pytest.fixture
def similar_notes(db_session) -> list:
    """Create notes with similar content for testing semantic search"""
    notes = NoteFactory.create_with_similar_content(db_session, 3, "python")
    return [{
        "id": note.id,
        "title": note.title,
        "raw_content": note.raw_content,
        "tags": note.tags
    } for note in notes]

@pytest.fixture
def collision_notes(db_session) -> list:
    """Create notes that would have hash collisions to test collision handling"""
    notes = NoteFactory.create_with_hash_collision(db_session)
    return [{
        "id": note.id,
        "title": note.title,
        "raw_content": note.raw_content,
        "tags": note.tags
    } for note in notes]

@pytest.fixture
def mock_hash_collision(monkeypatch, note_service):
    """Mock the hash generation to simulate a collision"""
    # Keep track of called count to return the same hash only on the second call
    call_count = 0
    original_generate_hash = note_service._generate_hash
    collision_hash = "collision_hash_123"
    
    def mock_generate_hash(content):
        nonlocal call_count
        call_count += 1
        
        if call_count == 1:
            return collision_hash
        elif call_count == 2:  # Return the same hash for the second call
            return collision_hash
        return original_generate_hash(content)
    
    monkeypatch.setattr(note_service, "_generate_hash", mock_generate_hash)
    return note_service 