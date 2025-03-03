# services/embedding_service.py
import numpy as np
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.models import Note
from sqlalchemy import text

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
        
        # Convert vector to string format with square brackets for pgvector
        vector_str = str(source_note.vector_data.tolist()) if hasattr(source_note.vector_data, 'tolist') else str(source_note.vector_data)
        
        # Use PostgreSQL's vector similarity search
        similar_notes = db.execute(
            text(f"""
            SELECT id, title, 1 - (vector_data <=> '{vector_str}'::vector) as score 
            FROM notes 
            WHERE id != '{note_id}' AND archived = false
            ORDER BY vector_data <=> '{vector_str}'::vector 
            LIMIT {limit}
            """)
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
        
        # Convert the embedding to a string format with square brackets for pgvector
        embedding_str = str(query_embedding.tolist())  # Already has square brackets
        
        # Build the SQL query
        sql_query = f"""
            SELECT id, title, 1 - (vector_data <=> '{embedding_str}'::vector) as score 
            FROM notes 
            WHERE archived = false
            ORDER BY vector_data <=> '{embedding_str}'::vector 
            LIMIT {limit}
        """
        
        # Use text() to declare this as a textual SQL expression
        similar_notes = db.execute(text(sql_query)).fetchall()
        
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