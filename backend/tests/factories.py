import factory
import random
from faker import Faker
from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models import Note, NoteRevision
from app.services.note_service import NoteService
from app.services.revision_service import RevisionService
from app.services.diff_service import DiffService

fake = Faker()

# Get service instances - create them directly here to avoid circular imports
note_service = NoteService()
revision_service = RevisionService()
diff_service = DiffService()

class BaseFactory(factory.Factory):
    """Base factory with common utilities"""
    
    @classmethod
    def create_batch_in_db(cls, db: Session, size: int, **kwargs):
        """Create multiple instances and save them to the database"""
        return [cls.create_in_db(db, **kwargs) for _ in range(size)]

class NoteFactory:
    """Factory for creating Note instances directly in the database"""
    
    @staticmethod
    def create(db: Session, title: Optional[str] = None, 
               raw_content: Optional[str] = None, 
               tags: Optional[List[str]] = None,
               archived: bool = False) -> Note:
        """Create a note and save it to the database"""
        if title is None:
            title = fake.sentence(nb_words=5)
            
        if raw_content is None:
            paragraphs = fake.paragraphs(nb=3)
            raw_content = "\n\n".join(paragraphs)
            
        if tags is None:
            # Generate 0-3 random tags
            num_tags = random.randint(0, 3)
            tags = [fake.word() for _ in range(num_tags)]
            
        # Create note in DB
        note = note_service.create_note(
            db=db,
            title=title,
            raw_content=raw_content,
            tags=tags
        )
        
        # Archive if requested
        if archived:
            note = note_service.archive_note(db=db, note_id=note.id)
            
        return note
    
    @staticmethod
    def create_batch(db: Session, size: int, **kwargs) -> List[Note]:
        """Create multiple notes"""
        return [NoteFactory.create(db, **kwargs) for _ in range(size)]
    
    @staticmethod
    def create_with_revisions(db: Session, num_revisions: int = 3, **kwargs) -> Note:
        """Create a note with a series of revisions"""
        # Create initial note
        note = NoteFactory.create(db, **kwargs)
        
        # Create revisions
        for i in range(num_revisions):
            # Get current content
            current_content = note.raw_content
            old_content = note.content
            
            # Generate new content (append a new paragraph)
            new_content = current_content + f"\n\nRevision {i+1}: {fake.paragraph()}"
            
            # Update note without revision parameters
            note, _ = note_service.update_note(
                db=db,
                note_id=note.id,
                raw_content=new_content
            )
            
            # Create the revision manually
            revision_service.save_revision(
                db=db,
                note_id=note.id,
                old_raw_content=current_content,
                old_content=old_content,
                new_raw_content=new_content,
                new_content=note.content,
                revision_name=f"Revision {i+1}",
                revision_note=f"Test revision {i+1}"
            )
            
        return note
    
    @staticmethod
    def create_with_links(db: Session, num_notes: int = 3, 
                         bidirectional: bool = True, **kwargs) -> List[Note]:
        """Create a network of linked notes"""
        notes = NoteFactory.create_batch(db, num_notes, **kwargs)
        
        # Create links between notes
        for i, note in enumerate(notes):
            # Link to the next note in the list (circular)
            next_idx = (i + 1) % num_notes
            next_id = notes[next_idx].id
            
            # Update content to include a link
            new_content = note.raw_content + f"\n\nThis links to [[{next_id}]]."
            
            note_service.update_note(
                db=db,
                note_id=note.id,
                raw_content=new_content
            )
            
            # Make sure changes are committed
            db.commit()
        
        # If bidirectional, also create backlinks
        if bidirectional:
            # For the last note, add links back to all previous notes
            backlinks_content = notes[-1].raw_content
            
            for j in range(num_notes - 1):
                back_id = notes[j].id
                backlinks_content += f"\n\nThis links back to [[{back_id}]]."
            
            # Update the last note with all backlinks at once
            note_service.update_note(
                db=db,
                note_id=notes[-1].id,
                raw_content=backlinks_content
            )
            
            # Make sure changes are committed
            db.commit()
            
        # Refresh all notes from the database
        for i in range(len(notes)):
            db.refresh(notes[i])
            
        return notes
    
    @staticmethod
    def create_with_similar_content(db: Session, num_notes: int = 3, 
                                   base_topic: str = None, **kwargs) -> List[Note]:
        """Create notes with similar content for testing semantic search"""
        if base_topic is None:
            base_topic = fake.word()
            
        notes = []
        topics = [
            f"{base_topic} overview", 
            f"{base_topic} tutorial",
            f"{base_topic} advanced guide",
            f"{base_topic} tips and tricks",
            f"{base_topic} common issues"
        ]
        
        # Ensure we don't request more notes than we have topics
        num_notes = min(num_notes, len(topics))
        
        for i in range(num_notes):
            title = topics[i]
            # Create content with repeated mentions of the topic
            paragraphs = fake.paragraphs(nb=3)
            # Insert topic mentions in each paragraph
            for j in range(len(paragraphs)):
                insertion_point = random.randint(0, len(paragraphs[j]) - 1)
                paragraphs[j] = (
                    paragraphs[j][:insertion_point] + 
                    f" {base_topic} " + 
                    paragraphs[j][insertion_point:]
                )
            
            raw_content = "\n\n".join(paragraphs)
            
            # Create the note
            note = NoteFactory.create(
                db=db,
                title=title,
                raw_content=raw_content,
                tags=[base_topic, "similar"],
                **kwargs
            )
            notes.append(note)
            
        return notes

    @staticmethod
    def create_with_hash_collision(db: Session, 
                                 first_content: str = "First note content", 
                                 second_content: str = "Second note with different content",
                                 **kwargs) -> List[Note]:
        """
        Create two notes that would have the same hash to test collision handling
        """
        from unittest.mock import patch
        
        notes = []
        
        # Create first note normally
        first_note = NoteFactory.create(
            db=db, 
            title="First Note", 
            raw_content=first_content, 
            **kwargs
        )
        notes.append(first_note)
        
        # Create a patch for the hash function
        collision_hash = first_note.id
        
        # Use the patch to create the second note
        with patch.object(note_service, '_generate_hash', return_value=collision_hash):
            # Try to create second note with same hash but different content
            try:
                # We need to avoid SQLAlchemy's session caching
                db.commit()
                db.begin()
                
                second_note = note_service.create_note(
                    db=db,
                    title="Second Note",
                    raw_content=second_content,
                    tags=kwargs.get('tags', [])
                )
                notes.append(second_note)
            except Exception as e:
                # If collision handling isn't implemented, this might fail
                print(f"Note creation with collision failed: {e}")
        
        return notes 