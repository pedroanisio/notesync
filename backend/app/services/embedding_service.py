# services/embedding_service.py
import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.models import Note

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate vector embedding for the given text"""
        # Combine title and content for better semantic representation
        embedding = self.model.encode(text, show_progress_bar=False)
        return embedding
    
    def find_similar_notes(self, db: Session, note_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Find notes similar to the specified note using vector similarity"""
        # Get the source note
        source_note = db.query(Note).filter(Note.id == note_id).first()
        if not source_note or source_note.vector_data is None:
            return []
        
        # Use PostgreSQL's vector similarity search
        similar_notes = db.execute(
            f"""
            SELECT id, title, similarity(vector_data, '{source_note.vector_data}') as score 
            FROM notes 
            WHERE id != '{note_id}' AND archived = false
            ORDER BY vector_data <=> '{source_note.vector_data}' 
            LIMIT {limit}
            """
        ).fetchall()
        
        # Format results
        results = []
        for note in similar_notes:
            note_data = db.query(Note).filter(Note.id == note.id).first()
            results.append({
                "note": note_data,
                "similarity_score": float(note.score)
            })
        
        return results
    
    def semantic_search(self, db: Session, query_text: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for notes semantically using vector similarity to query"""
        # Generate embedding for the query text
        query_embedding = self.generate_embedding(query_text)
        
        # Use PostgreSQL's vector similarity search
        similar_notes = db.execute(
            f"""
            SELECT id, title, similarity(vector_data, '{query_embedding}') as score 
            FROM notes 
            WHERE archived = false
            ORDER BY vector_data <=> '{query_embedding}' 
            LIMIT {limit}
            """
        ).fetchall()
        
        # Format results
        results = []
        for note in similar_notes:
            note_data = db.query(Note).filter(Note.id == note.id).first()
            results.append({
                "note": note_data,
                "similarity_score": float(note.score)
            })
        
        return results

# Singleton instance
embedding_service = EmbeddingService()