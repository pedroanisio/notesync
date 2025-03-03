# services/note_service.py
import hashlib
import markdown
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import any_
from sqlalchemy.sql import func
from app.db.models import Note
from app.services.embedding_service import embedding_service
from app.services.diff_service import diff_service

class NoteService:
    def create_note(self, db: Session, title: str, raw_content: str, tags: List[str] = None) -> Note:
        """Create a new note with the given content"""
        if tags is None:
            tags = []
            
        # Generate content hash for ID
        content_hash = self._generate_hash(title + raw_content)
        
        # Process markdown content
        content = markdown.markdown(raw_content)
        
        # Detect links to other notes
        links_to = diff_service.extract_linked_notes(raw_content)
        
        # Create vector embedding
        vector_data = embedding_service.generate_embedding(title + " " + raw_content)
        
        # Create new note
        db_note = Note(
            id=content_hash,
            title=title,
            raw_content=raw_content,
            content=content,
            tags=tags,
            links_to=links_to,
            vector_data=vector_data
        )
        
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        
        # Update links_from for all notes that this note links to
        self._update_links_from(db, db_note.id, links_to)
        
        return db_note
    
    def get_note(self, db: Session, note_id: str) -> Optional[Note]:
        """Get a note by its ID"""
        return db.query(Note).filter(Note.id == note_id).first()
    
    def get_notes(self, db: Session, skip: int = 0, limit: int = 100, include_archived: bool = False) -> List[Note]:
        """Get all notes with pagination"""
        query = db.query(Note)
        
        if not include_archived:
            query = query.filter(Note.archived == False)
            
        return query.order_by(Note.updated_at.desc()).offset(skip).limit(limit).all()
    
    def update_note(self, db: Session, note_id: str, 
                    title: Optional[str] = None, 
                    raw_content: Optional[str] = None,
                    tags: Optional[List[str]] = None,
                    archived: Optional[bool] = None) -> Tuple[Note, bool]:
        """Update a note, return updated note and whether content changed"""
        db_note = self.get_note(db, note_id)
        if not db_note:
            return None, False
        
        content_changed = False
        
        if title is not None and title != db_note.title:
            db_note.title = title
            content_changed = True
            
        if raw_content is not None and raw_content != db_note.raw_content:
            db_note.raw_content = raw_content
            db_note.content = markdown.markdown(raw_content)
            content_changed = True
            
            # Update links
            old_links = db_note.links_to
            new_links = diff_service.extract_linked_notes(raw_content)
            db_note.links_to = new_links
            
            # Update links_from for affected notes
            self._update_links_from(db, db_note.id, new_links, old_links)
        
        if tags is not None:
            db_note.tags = tags
            
        if archived is not None:
            db_note.archived = archived
        
        # If content changed, update vector embedding
        if content_changed:
            db_note.vector_data = embedding_service.generate_embedding(
                db_note.title + " " + db_note.raw_content
            )
        
        db.commit()
        db.refresh(db_note)
        
        return db_note, content_changed
    
    def archive_note(self, db: Session, note_id: str) -> Note:
        """Archive a note (soft delete)"""
        db_note = self.get_note(db, note_id)
        if not db_note:
            return None
            
        db_note.archived = True
        db.commit()
        db.refresh(db_note)
        
        return db_note
    
    def get_notes_by_tag(self, db: Session, tag: str, skip: int = 0, limit: int = 100) -> List[Note]:
        """Get notes by tag"""
        return db.query(Note).filter(
            tag.lower() == any_(func.lower(Note.tags)),
            Note.archived == False
        ).order_by(Note.updated_at.desc()).offset(skip).limit(limit).all()
    
    def search_notes(self, db: Session, query: str, tags: List[str] = None, 
                     semantic: bool = False, limit: int = 10, archived: bool = False) -> List[Dict[str, Any]]:
        """Search for notes by text and/or tags"""
        if semantic and query:
            # Semantic search using vector similarity
            return embedding_service.semantic_search(db, query, limit)
        
        # Text-based search
        db_query = db.query(Note)
        
        # Filter by archived status
        if not archived:
            db_query = db_query.filter(Note.archived == False)
        
        # Text search
        if query:
            # Simple case-insensitive search - in production, use full-text search
            db_query = db_query.filter(
                Note.title.ilike(f'%{query}%') | 
                Note.raw_content.ilike(f'%{query}%')
            )
        
        # Tag filtering
        if tags:
            for tag in tags:
                db_query = db_query.filter(tag.lower() == any_(func.lower(Note.tags)))
        
        # Get results
        results = db_query.order_by(Note.updated_at.desc()).limit(limit).all()
        
        # Format results
        return [{"note": note, "similarity_score": 1.0} for note in results]
    
    def get_all_tags(self, db: Session) -> List[str]:
        """Get all unique tags across notes"""
        notes = db.query(Note.tags).filter(Note.archived == False).all()
        # Flatten and get unique tags
        all_tags = []
        for note_tags in notes:
            all_tags.extend(note_tags[0])
        
        return list(set(all_tags))
    
    def merge_notes(self, db: Session, note_ids: List[str], 
                   new_title: str, separator: str = "\n\n---\n\n") -> Optional[Note]:
        """Merge multiple notes into a new note"""
        # Get all source notes
        notes = []
        for note_id in note_ids:
            note = self.get_note(db, note_id)
            if note:
                notes.append(note)
        
        if not notes:
            return None
        
        # Combine content
        combined_raw_content = separator.join([note.raw_content for note in notes])
        
        # Combine tags
        combined_tags = []
        for note in notes:
            combined_tags.extend(note.tags)
        combined_tags = list(set(combined_tags))  # Remove duplicates
        
        # Create new merged note
        merged_note = self.create_note(
            db=db,
            title=new_title,
            raw_content=combined_raw_content,
            tags=combined_tags
        )
        
        return merged_note
    
    def _generate_hash(self, content: str) -> str:
        """Generate a hash from content for use as ID"""
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    
    def _update_links_from(self, db: Session, source_id: str, 
                          new_links: List[str], old_links: List[str] = None) -> None:
        """Update links_from for notes that this note links to"""
        # If no old links provided, assume empty list
        if old_links is None:
            old_links = []
        
        # Notes that are no longer linked to (remove this note from their links_from)
        removed_links = set(old_links) - set(new_links)
        for link in removed_links:
            linked_note = self.get_note(db, link)
            if linked_note and source_id in linked_note.links_from:
                linked_note.links_from.remove(source_id)
        
        # Notes that are newly linked to (add this note to their links_from)
        added_links = set(new_links) - set(old_links)
        for link in added_links:
            linked_note = self.get_note(db, link)
            if linked_note and source_id not in linked_note.links_from:
                linked_note.links_from.append(source_id)
        
        if removed_links or added_links:
            db.commit()

# Singleton instance
note_service = NoteService()