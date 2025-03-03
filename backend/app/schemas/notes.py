# app/schemas/note.py
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field
from uuid import UUID

# Note Schemas
class NoteBase(BaseModel):
    title: str
    raw_content: str
    tags: Optional[List[str]] = []

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    raw_content: Optional[str] = None
    tags: Optional[List[str]] = None
    archived: Optional[bool] = None

class NoteInDB(NoteBase):
    id: str
    content: str
    created_at: datetime
    updated_at: datetime
    archived: bool
    links_to: List[str] = []
    links_from: List[str] = []
    
    class Config:
        orm_mode = True

class Note(NoteInDB):
    pass

# Search Schemas
class NoteSearchQuery(BaseModel):
    query: str = ""
    tags: Optional[List[str]] = None
    semantic: bool = False
    limit: int = 10
    archived: bool = False

class SimilarNoteResult(BaseModel):
    note: Note
    similarity_score: float

# Tag Schema
class TagList(BaseModel):
    tags: List[str] = []