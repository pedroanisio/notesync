import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAxios } from '../setup';
import RevisionHistory from '../../src/pages/RevisionHistory';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('Revision History Integration Flow', () => {
  const noteId = 'test-note-id';
  const mockNote = {
    id: noteId,
    title: 'Test Note',
    raw_content: 'Current content',
    tags: ['test'],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-03T00:00:00Z'
  };
  
  const mockRevisions = [
    {
      revision_id: 'rev-1',
      revision_number: 1,
      created_at: '2023-01-01T00:00:00Z'
    },
    {
      revision_id: 'rev-2',
      revision_number: 2,
      revision_name: 'Important update',
      revision_note: 'Fixed typos',
      created_at: '2023-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    mockAxios.reset();
    mockAxios.onGet(`/notes/${noteId}`).reply(200, mockNote);
    mockAxios.onGet(`/notes/${noteId}/revisions`).reply(200, mockRevisions);
  });

  test('should display revision history and revert to a revision', async () => {
    // Mock revision diff
    mockAxios.onGet(`/revisions/rev-2/diff`).reply(200, {
      unified_diff: '<span class="diff-added">Added content</span>',
      before: 'Original content',
      after: 'Updated content'
    });
    
    // Mock revert operation
    mockAxios.onPost(`/revisions/rev-2/revert`).reply(200, {
      success: true
    });

    renderWithProviders(
      <MemoryRouter initialEntries={[`/notes/${noteId}/revisions`]}>
        <Routes>
          <Route path="/notes/:noteId/revisions" element={<RevisionHistory />} />
          <Route path="/notes/:noteId" element={<div>Note Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Wait for revisions to load
    await waitFor(() => {
      expect(screen.getByText('Revision #2')).toBeInTheDocument();
      expect(screen.getByText('Important update')).toBeInTheDocument();
    });
    
    // View diff
    await userEvent.click(screen.getByText('View Changes'));
    
    // Verify diff modal shows up
    await waitFor(() => {
      expect(screen.getByText('Before')).toBeInTheDocument();
      expect(screen.getByText('After')).toBeInTheDocument();
    });
    
    // Revert to this revision
    await userEvent.click(screen.getByText('Revert to This Version'));
    
    // Verify we navigate back to note detail
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(screen.getByText('Note Detail Page')).toBeInTheDocument();
    });
  });
}); 