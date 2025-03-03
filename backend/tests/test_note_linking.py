import pytest
from fastapi import status

# Note Linking Tests
class TestNoteLinking:
    def test_automatic_link_detection(self, client, sample_note):
        """TC-LINK-001: Automatic Link Detection"""
        # Arrange
        note_data = {
            "title": "Note with Link",
            "raw_content": f"This references [[{sample_note['id']}]] in content.",
            "tags": ["link"]
        }
        
        # Act
        response = client.post("/api/v1/notes", json=note_data)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert sample_note["id"] in data["links_to"]
    
    def test_bidirectional_link_maintenance(self, client, linked_notes):
        """TC-LINK-002: Bidirectional Link Maintenance"""
        # Arrange
        note1_id = linked_notes[0]["id"]
        note2_id = linked_notes[1]["id"]
        
        # Act - Get first note
        response1 = client.get(f"/api/v1/notes/{note1_id}")
        
        # Act - Get second note
        response2 = client.get(f"/api/v1/notes/{note2_id}")
        
        # Assert
        assert response1.status_code == status.HTTP_200_OK
        assert response2.status_code == status.HTTP_200_OK
        
        note1_data = response1.json()
        note2_data = response2.json()
        
        # Note 1 links to Note 2
        assert note2_id in note1_data["links_to"]
        
        # Note 2 is linked from Note 1
        assert note1_id in note2_data["links_from"]
        
        # Also check the reverse direction
        assert note1_id in note2_data["links_to"]
        assert note2_id in note1_data["links_from"]
    
    def test_link_update_on_content_change(self, client, linked_notes):
        """TC-LINK-003: Link Update on Content Change"""
        note1_id = linked_notes[0]["id"]
        note2_id = linked_notes[1]["id"]
        
        # Act - Update note1 to remove the link to note2
        update_data = {
            "raw_content": "This content no longer links to the other note."
        }
        response = client.put(f"/api/v1/notes/{note1_id}", json=update_data)
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        
        # Check that note1 no longer links to note2
        response1 = client.get(f"/api/v1/notes/{note1_id}")
        note1_data = response1.json()
        assert note2_id not in note1_data["links_to"]
        
        # Check that note2 is no longer linked from note1
        response2 = client.get(f"/api/v1/notes/{note2_id}")
        note2_data = response2.json()
        assert note1_id not in note2_data["links_from"] 