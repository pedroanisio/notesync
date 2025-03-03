# db/models.py
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Integer, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(String, primary_key=True)  # Content hash as ID
    raw_content = Column(Text, nullable=False)  # Original markdown
    title = Column(String, nullable=False)  # Note title
    content = Column(Text, nullable=False)  # Processed content
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    archived = Column(Boolean, nullable=False, default=False)  # Soft delete flag
    tags = Column(ARRAY(String), default=[])  # Array of tags
    links_to = Column(ARRAY(String), default=[])  # Outgoing links
    links_from = Column(ARRAY(String), default=[])  # Incoming links
    vector_data = Column(Vector(1536))  # Embedding vector for similarity search

class NoteRevision(Base):
    __tablename__ = "notes_revision"
    
    note_id = Column(String, ForeignKey("notes.id"), nullable=False)
    revision_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # Unique revision ID
    content_raw_diff = Column(Text, nullable=False)  # Diff of raw content
    content_diff = Column(Text, nullable=False)  # Diff of processed content
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    revision_name = Column(String, nullable=True)  # Optional revision name
    revision_note = Column(String, nullable=True)  # Optional note about changes
    revision_number = Column(Integer, nullable=False)  # Sequential revision number
    parent_revision_id = Column(UUID(as_uuid=True), ForeignKey("notes_revision.revision_id"), nullable=True)  # For revision hierarchy