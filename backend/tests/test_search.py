import pytest
from fastapi import status

class TestSearch:
    def test_full_text_search(self, client, similar_notes):
        """TC-SEARCH-001: Full-Text Search"""
        # Get a term that should be in all the similar notes
        search_term = "python"
        
        # Act
        response = client.post(
            "/api/v1/notes/search", 
            json={"query": search_term, "semantic": False}
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        results = response.json()
        
        # Should find all the similar notes
        assert len(results) == len(similar_notes)
        
        # Each result should have the note and a similarity score
        for result in results:
            assert "note" in result
            assert "similarity_score" in result
    
    def test_semantic_search(self, client, similar_notes):
        """TC-SEARCH-002: Semantic Search"""
        # Search for a semantically related term
        search_term = "coding language guide"
        
        # Act
        response = client.post(
            "/api/v1/notes/search", 
            json={"query": search_term, "semantic": True}
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        results = response.json()
        
        # Should find some results
        assert len(results) > 0
        
        # Each result should have the note and a similarity score
        for result in results:
            assert "note" in result
            assert "similarity_score" in result
            
            # The similarity score should be between 0 and 1
            assert 0 <= result["similarity_score"] <= 1
    
    def test_similar_notes(self, client, similar_notes):
        """TC-SEARCH-003: Similar Notes"""
        # Get the ID of the first note
        note_id = similar_notes[0]["id"]
        
        # Act
        response = client.get(f"/api/v1/notes/{note_id}/similar")
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        results = response.json()
        
        # Should find some results
        assert len(results) > 0
        
        # Each result should have the note and a similarity score
        for result in results:
            assert "note" in result
            assert "similarity_score" in result
            
            # The similarity score should be between 0 and 1
            assert 0 <= result["similarity_score"] <= 1
            
            # The result should not be the same note
            assert result["note"]["id"] != note_id 