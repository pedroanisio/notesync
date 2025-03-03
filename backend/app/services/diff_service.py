# services/diff_service.py
import diff_match_patch as dmp_module
from typing import Dict, Any, Tuple

class DiffService:
    def __init__(self):
        self.dmp = dmp_module.diff_match_patch()
    
    def create_diff(self, old_text: str, new_text: str) -> str:
        """Create a diff patch between old and new text"""
        # Calculate the diff
        patches = self.dmp.patch_make(old_text, new_text)
        # Convert to text representation
        return self.dmp.patch_toText(patches)
    
    def apply_diff(self, text: str, patch_text: str) -> str:
        """Apply a diff patch to text"""
        # Convert from text representation
        patches = self.dmp.patch_fromText(patch_text)
        # Apply patches
        result, _ = self.dmp.patch_apply(patches, text)
        return result
    
    def revert_diff(self, text: str, patch_text: str) -> str:
        """Revert a diff (apply it backwards)"""
        # For our simple purposes, we'll create a diff in the other direction
        # This is a simplification - a more robust approach would parse and invert the diff
        old_text = self.apply_diff(text, patch_text)
        return self.create_diff(text, old_text)
    
    def render_diff(self, old_text: str, new_text: str) -> Dict[str, Any]:
        """Render a human-readable diff between old and new text"""
        # Calculate the diff
        diffs = self.dmp.diff_main(old_text, new_text)
        # Cleanup semantic differences
        self.dmp.diff_cleanupSemantic(diffs)
        
        # Generate unified diff
        unified_diff = self.dmp.diff_prettyHtml(diffs)
        
        # For side-by-side, we'll return the raw diffs which the frontend can render
        return {
            "before": old_text,
            "after": new_text,
            "unified_diff": unified_diff,
            "raw_diffs": diffs  # Frontend can render this for side-by-side view
        }
    
    def extract_linked_notes(self, content: str) -> list:
        """Extract links to other notes from content using a simple Markdown link pattern"""
        # This is a simplified implementation - would need more robust parsing
        import re
        # Look for [[ ]] style wiki links which might link to other notes
        # For POC purposes, this is a simplified approach
        links = re.findall(r'\[\[(.*?)\]\]', content)
        return links

# Singleton instance
diff_service = DiffService()