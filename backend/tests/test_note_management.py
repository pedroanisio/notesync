import pytest
from fastapi import status
from app.db.models import Note

# Note Management Tests
class TestNoteManagement:
    def test_create_note(self, client):
        """TC-NOTE-001: Create Note"""
        # Arrange
        note_data = {
            "title": "New Test Note",
            "raw_content": "This is a test note content.",
            "tags": ["test", "new"]
        }
        
        # Act
        response = client.post("/api/v1/notes", json=note_data)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == note_data["title"]
        assert data["raw_content"] == note_data["raw_content"]
        assert set(data["tags"]) == set(note_data["tags"])
        assert "id" in data
    
    def test_create_note_with_identical_content(self, client, sample_note):
        """TC-NOTE-002: Create Note with Identical Content"""
        # Arrange
        note_data = {
            "title": sample_note["title"],
            "raw_content": sample_note["raw_content"],
            "tags": sample_note["tags"]
        }
        
        # Act
        response = client.post("/api/v1/notes", json=note_data)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == sample_note["id"]
    
    def test_create_note_with_hash_collision(self, client, mock_hash_collision):
        """TC-NOTE-003: Create Note with Hash Collision"""
        # Arrange
        note_data_1 = {
            "title": "First Note",
            "raw_content": "First content",
            "tags": ["test"]
        }
        note_data_2 = {
            "title": "Second Note",
            "raw_content": "Different content",
            "tags": ["test"]
        }
        
        # Act
        response_1 = client.post("/api/v1/notes", json=note_data_1)
        response_2 = client.post("/api/v1/notes", json=note_data_2)
        
        # Assert
        assert response_1.status_code == status.HTTP_200_OK
        assert response_2.status_code == status.HTTP_200_OK
        
        data_1 = response_1.json()
        data_2 = response_2.json()
        
        # IDs should be different despite the collision
        assert data_1["id"] != data_2["id"]
    
    def test_edit_note(self, client, sample_note):
        """TC-NOTE-004: Edit Note"""
        # Arrange
        update_data = {
            "title": "Updated Title",
            "raw_content": "Updated content for testing.",
            "tags": ["updated", "test"]
        }
        
        # Act
        response = client.put(f"/api/v1/notes/{sample_note['id']}", json=update_data)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["raw_content"] == update_data["raw_content"]
        assert set(data["tags"]) == set(update_data["tags"])
        assert data["id"] == sample_note["id"]  # ID should not change
    
    def test_archive_note(self, client, sample_note):
        """TC-NOTE-005: Delete (Archive) Note"""
        # Act - Archive the note
        response = client.post(f"/api/v1/notes/{sample_note['id']}/archive")
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["archived"] == True
        
        # Act - Get all notes (should not include archived)
        response = client.get("/api/v1/notes")
        
        # Assert - Archived note should not be in the list
        all_notes = response.json()
        assert not any(note["id"] == sample_note["id"] for note in all_notes)
    
    def test_list_notes(self, client, sample_notes):
        """TC-NOTE-006: List Notes"""
        # Act
        response = client.get("/api/v1/notes")
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == len(sample_notes)
        
        # Archive one note
        client.post(f"/api/v1/notes/{sample_notes[0]['id']}/archive")
        
        # Act - Get all notes again
        response = client.get("/api/v1/notes")
        
        # Assert - Should have one less note
        data = response.json()
        assert len(data) == len(sample_notes) - 1
    
    def test_list_notes_including_archived(self, client, sample_notes):
        """TC-NOTE-007: List Notes Including Archived"""
        # Archive one note
        client.post(f"/api/v1/notes/{sample_notes[0]['id']}/archive")
        
        # Act - Get all notes including archived
        response = client.get("/api/v1/notes?include_archived=true")
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == len(sample_notes) 