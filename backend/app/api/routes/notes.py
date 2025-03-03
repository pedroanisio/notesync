# api/routes/notes.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.note import (
    Note, NoteCreate, NoteUpdate, NoteSearchQuery, 
    SimilarNoteResult, TagList
)
from app.services.note_service import note_service
from app.services.embedding_service import embedding_service

router = APIRouter()

@router.post("/", response_model=Note)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    """Create a new note"""
    return note_service.create_note(
        db=db, 
        title=note.title,
        raw_content=note.raw_content,
        tags=note.tags
    )

@router.get("/", response_model=List[Note])
def get_notes(
    skip: int = 0, 
    limit: int = 100,
    include_archived: bool = False,
    db: Session = Depends(get_db)
):
    """Get all notes with pagination"""
    return note_service.get_notes(
        db=db, 
        skip=skip, 
        limit=limit,
        include_archived=include_archived
    )

@router.get("/{note_id}", response_model=Note)
def get_note(note_id: str, db: Session = Depends(get_db)):
    """Get a specific note by ID"""
    db_note = note_service.get_note(db=db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return db_note

@router.put("/{note_id}", response_model=Note)
def update_note(
    note_id: str, 
    note_update: NoteUpdate, 
    db: Session = Depends(get_db)
):
    """Update a note"""
    updated_note, _ = note_service.update_note(
        db=db,
        note_id=note_id,
        title=note_update.title,
        raw_content=note_update.raw_content,
        tags=note_update.tags,
        archived=note_update.archived
    )
    
    if updated_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return updated_note

@router.post("/{note_id}/archive", response_model=Note)
def archive_note(note_id: str, db: Session = Depends(get_db)):
    """Archive a note (soft delete)"""
    archived_note = note_service.archive_note(db=db, note_id=note_id)
    
    if archived_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return archived_note

@router.get("/tags/all", response_model=TagList)
def get_all_tags(db: Session = Depends(get_db)):
    """Get all unique tags across notes"""
    tags = note_service.get_all_tags(db=db)
    return {"tags": tags}

@router.get("/tag/{tag}", response_model=List[Note])
def get_notes_by_tag(
    tag: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get notes by tag"""
    return note_service.get_notes_by_tag(
        db=db,
        tag=tag,
        skip=skip,
        limit=limit
    )

@router.post("/search", response_model=List[SimilarNoteResult])
def search_notes(
    search_query: NoteSearchQuery,
    db: Session = Depends(get_db)
):
    """Search for notes by text and/or tags, with optional semantic search"""
    return note_service.search_notes(
        db=db,
        query=search_query.query,
        tags=search_query.tags,
        semantic=search_query.semantic,
        limit=search_query.limit,
        archived=search_query.archived
    )

@router.get("/{note_id}/similar", response_model=List[SimilarNoteResult])
def get_similar_notes(
    note_id: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get notes similar to the specified note using vector similarity"""
    # Check note exists
    db_note = note_service.get_note(db=db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
        
    return embedding_service.find_similar_notes(
        db=db,
        note_id=note_id,
        limit=limit
    )

@router.post("/merge", response_model=Note)
def merge_notes(
    note_ids: List[str],
    new_title: str,
    separator: str = "\n\n---\n\n",
    db: Session = Depends(get_db)
):
    """Merge multiple notes into a new note"""
    merged_note = note_service.merge_notes(
        db=db,
        note_ids=note_ids,
        new_title=new_title,
        separator=separator
    )
    
    if merged_note is None:
        raise HTTPException(status_code=404, detail="No valid notes to merge")
    
    return merged_note