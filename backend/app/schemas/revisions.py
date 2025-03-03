# app/schemas/revision.py
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID

# Revision Schemas
class RevisionBase(BaseModel):
    revision_name: Optional[str] = None
    revision_note: Optional[str] = None

class RevisionCreate(RevisionBase):
    note_id: str
    content_raw_diff: str
    content_diff: str
    parent_revision_id: Optional[UUID] = None

class RevisionInDB(RevisionBase):
    revision_id: UUID
    note_id: str
    content_raw_diff: str
    content_diff: str
    created_at: datetime
    revision_number: int
    parent_revision_id: Optional[UUID] = None
    
    class Config:
        orm_mode = True

class Revision(RevisionInDB):
    pass

# Diff View Schema
class DiffView(BaseModel):
    before: str
    after: str
    unified_diff: str
    side_by_side_diff: Optional[str] = None