import pytest
from fastapi import status

class TestRevisions:
    def test_revision_creation_on_update(self, client, notes_with_revisions):
        """TC-REVISION-001: Revision Creation on Update"""
        # Get the note ID
        note_id = notes_with_revisions["id"]
        
        # Act - Get the revisions for this note
        response = client.get(f"/api/v1/notes/{note_id}/revisions")
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        revisions = response.json()
        
        # Should have 3 revisions (we created a note with 3 revisions)
        assert len(revisions) == 3
        
        # Revisions should have proper data
        for revision in revisions:
            assert "revision_id" in revision
            assert "note_id" in revision
            assert "created_at" in revision
            assert "revision_number" in revision
            assert revision["note_id"] == note_id
    
    def test_list_revisions(self, client, notes_with_revisions):
        """TC-REVISION-002: List Revisions"""
        # Get the note ID
        note_id = notes_with_revisions["id"]
        
        # Act - Get the revisions for this note
        response = client.get(f"/api/v1/notes/{note_id}/revisions")
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        revisions = response.json()
        
        # Revisions should be in reverse chronological order (newest first)
        revision_numbers = [rev["revision_number"] for rev in revisions]
        assert revision_numbers == sorted(revision_numbers, reverse=True)
    
    def test_revert_to_revision(self, client, notes_with_revisions):
        """TC-REVISION-003: Revert to Revision"""
        # Get the note ID
        note_id = notes_with_revisions["id"]
        
        # Get an older revision to revert to
        response = client.get(f"/api/v1/notes/{note_id}/revisions")
        revisions = response.json()
        
        # Get the second revision (not the most recent one)
        older_revision = revisions[1]
        
        # Act - Revert to the older revision
        response = client.post(
            f"/api/v1/notes/revision/{older_revision['revision_id']}/revert",
            json={"revision_name": "Revert Test", "revision_note": "Testing revert"}
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        reverted_note = response.json()
        
        # Check that a new revision was created for the revert
        response = client.get(f"/api/v1/notes/{note_id}/revisions")
        new_revisions = response.json()
        
        # Should have one more revision now
        assert len(new_revisions) == len(revisions) + 1
        
        # The newest revision should have our revision name
        assert new_revisions[0]["revision_name"] == "Revert Test"
    
    def test_get_note_at_specific_revision(self, client, notes_with_revisions):
        """TC-REVISION-004: Get Note at Specific Revision"""
        # Get the note ID
        note_id = notes_with_revisions["id"]
        
        # Get the revisions
        response = client.get(f"/api/v1/notes/{note_id}/revisions")
        revisions = response.json()
        
        # Get the content at revision 1 (the oldest one)
        revision_number = min(rev["revision_number"] for rev in revisions)
        
        # Act
        response = client.get(f"/api/v1/notes/{note_id}/revision/{revision_number}/content")
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        content = response.json()
        
        # Should have content and it should be different from the current content
        assert "raw_content" in content
        assert content["raw_content"] != notes_with_revisions["raw_content"]
        
        # The older revision should be shorter (since we kept adding content in each revision)
        assert len(content["raw_content"]) < len(notes_with_revisions["raw_content"]) 