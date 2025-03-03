# api/routes/revisions.py
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.note import Revision, DiffView, Note
from app.services.revision_service import revision_service
from app.services.note_service import note_service

router = APIRouter()

@router.get("/{note_id}/revisions", response_model=List[Revision])
def get_note_revisions(note_id: str, db: Session = Depends(get_db)):
    """Get all revisions for a note"""
    # Verify note exists
    db_note = note_service.get_note(db=db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
        
    return revision_service.get_revisions(db=db, note_id=note_id)

@router.get("/revision/{revision_id}", response_model=Revision)
def get_revision(revision_id: UUID, db: Session = Depends(get_db)):
    """Get a specific revision by ID"""
    revision = revision_service.get_revision(db=db, revision_id=revision_id)
    if revision is None:
        raise HTTPException(status_code=404, detail="Revision not found")
    
    return revision

@router.get("/revision/{revision_id}/diff", response_model=DiffView)
def get_revision_diff(revision_id: UUID, db: Session = Depends(get_db)):
    """Get diff view for a revision"""
    diff_view = revision_service.get_diff_view(db=db, revision_id=revision_id)
    if diff_view is None:
        raise HTTPException(status_code=404, detail="Revision not found")
    
    return diff_view

@router.post("/revision/{revision_id}/revert", response_model=Note)
def revert_to_revision(
    revision_id: UUID,
    revision_name: Optional[str] = None,
    revision_note: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Revert a note to a specific revision"""
    reverted_note = revision_service.revert_to_revision(
        db=db,
        revision_id=revision_id,
        revision_name=revision_name,
        revision_note=revision_note
    )
    
    if reverted_note is None:
        raise HTTPException(status_code=404, detail="Revision not found")
    
    return reverted_note

@router.get("/{note_id}/revision/{revision_number}/content")
def get_note_at_revision(note_id: str, revision_number: int, db: Session = Depends(get_db)):
    """Get a note's content at a specific revision"""
    # Verify note exists
    db_note = note_service.get_note(db=db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    reconstructed = revision_service.reconstruct_note_at_revision(
        db=db,
        note_id=note_id,
        target_revision_number=revision_number
    )
    
    if reconstructed is None:
        raise HTTPException(status_code=404, detail="Failed to reconstruct note at revision")
    
    return reconstructed