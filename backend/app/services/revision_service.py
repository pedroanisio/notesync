# services/revision_service.py
import markdown
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.db.models import Note, NoteRevision
from app.services.diff_service import diff_service

class RevisionService:
    def save_revision(self, db: Session, note_id: str, old_raw_content: str, 
                     old_content: str, new_raw_content: str, new_content: str,
                     revision_name: Optional[str] = None, 
                     revision_note: Optional[str] = None,
                     parent_revision_id: Optional[UUID] = None) -> NoteRevision:
        """Save a revision of a note"""
        # Create diffs between old and new content
        content_raw_diff = diff_service.create_diff(old_raw_content, new_raw_content)
        content_diff = diff_service.create_diff(old_content, new_content)
        
        # Get the next revision number
        revision_number = self._get_next_revision_number(db, note_id)
        
        # Create revision record
        db_revision = NoteRevision(
            note_id=note_id,
            content_raw_diff=content_raw_diff,
            content_diff=content_diff,
            revision_name=revision_name,
            revision_note=revision_note,
            revision_number=revision_number,
            parent_revision_id=parent_revision_id
        )
        
        db.add(db_revision)
        db.commit()
        db.refresh(db_revision)
        
        return db_revision
    
    def get_revisions(self, db: Session, note_id: str) -> List[NoteRevision]:
        """Get all revisions for a note, ordered by revision number"""
        return db.query(NoteRevision).filter(
            NoteRevision.note_id == note_id
        ).order_by(NoteRevision.revision_number.desc()).all()
    
    def get_revision(self, db: Session, revision_id: UUID) -> Optional[NoteRevision]:
        """Get a specific revision by ID"""
        return db.query(NoteRevision).filter(
            NoteRevision.revision_id == revision_id
        ).first()
    
    def reconstruct_note_at_revision(self, db: Session, note_id: str, 
                                    target_revision_number: int) -> Dict[str, Any]:
        """Reconstruct a note's content at a specific revision"""
        # Get the current note
        current_note = db.query(Note).filter(Note.id == note_id).first()
        if not current_note:
            return None
        
        # Get all revisions for the note
        revisions = db.query(NoteRevision).filter(
            NoteRevision.note_id == note_id
        ).order_by(NoteRevision.revision_number.desc()).all()
        
        # If no revisions or target is beyond revisions, return current note
        if not revisions or target_revision_number > revisions[0].revision_number:
            return {
                "title": current_note.title,
                "raw_content": current_note.raw_content,
                "content": current_note.content,
                "tags": current_note.tags
            }
        
        # Start with current content
        raw_content = current_note.raw_content
        content = current_note.content
        
        # Apply revisions in reverse order until we reach the target
        for revision in revisions:
            if revision.revision_number <= target_revision_number:
                break
                
            # Apply diffs in reverse to go backwards in time
            raw_content = diff_service.apply_diff(raw_content, 
                                               diff_service.revert_diff("", revision.content_raw_diff))
            content = diff_service.apply_diff(content,
                                           diff_service.revert_diff("", revision.content_diff))
        
        # Return reconstructed note data
        return {
            "title": current_note.title,  # Title changes not tracked in this simple implementation
            "raw_content": raw_content,
            "content": content,
            "tags": current_note.tags  # Tag changes not tracked in this simple implementation
        }
    
    def revert_to_revision(self, db: Session, revision_id: UUID, 
                          revision_name: Optional[str] = None,
                          revision_note: Optional[str] = None) -> Optional[Note]:
        """Revert a note to a specific revision and create a new revision marking the reversion"""
        # Get the revision
        revision = self.get_revision(db, revision_id)
        if not revision:
            return None
            
        # Get the note
        note = db.query(Note).filter(Note.id == revision.note_id).first()
        if not note:
            return None
            
        # Reconstruct the note at that revision
        reconstructed = self.reconstruct_note_at_revision(
            db, note.id, revision.revision_number
        )
        
        # Create a new reversion revision
        reversion_note = f"Reverted to revision {revision.revision_number}"
        if revision_note:
            reversion_note += f": {revision_note}"
            
        # Before updating, save current state as a revision
        self.save_revision(
            db=db,
            note_id=note.id,
            old_raw_content=note.raw_content,
            old_content=note.content,
            new_raw_content=reconstructed["raw_content"],
            new_content=reconstructed["content"],
            revision_name=revision_name or f"Reversion to #{revision.revision_number}",
            revision_note=reversion_note,
            parent_revision_id=revision.revision_id
        )
        
        # Update the note
        note.raw_content = reconstructed["raw_content"]
        note.content = reconstructed["content"]
        
        db.commit()
        db.refresh(note)
        
        return note
    
    def get_diff_view(self, db: Session, revision_id: UUID) -> Dict[str, Any]:
        """Get a diff view for a specific revision"""
        # Get the revision
        revision = self.get_revision(db, revision_id)
        if not revision:
            return None
            
        # Apply the diff to empty strings to get before and after content
        # This is a simplified approach for the POC
        after_raw = diff_service.apply_diff("", revision.content_raw_diff)
        before_raw = ""  # We'd need to chain previous revisions for a complete before
        
        # Render the diff
        return diff_service.render_diff(before_raw, after_raw)
    
    def _get_next_revision_number(self, db: Session, note_id: str) -> int:
        """Get the next revision number for a note"""
        # Get the highest current revision number
        highest = db.query(NoteRevision).filter(
            NoteRevision.note_id == note_id
        ).order_by(NoteRevision.revision_number.desc()).first()
        
        if highest:
            return highest.revision_number + 1
        else:
            return 1

# Singleton instance
revision_service = RevisionService()