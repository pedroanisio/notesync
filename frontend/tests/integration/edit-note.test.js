import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAxios } from '../setup';
import EditNote from '../../src/pages/EditNote';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('Edit Note Integration Flow', () => {
  const noteId = 'test-note-id';
  const mockNote = {
    id: noteId,
    title: 'Original Title',
    raw_content: 'Original content',
    tags: ['original'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    mockAxios.reset();
    mockAxios.onGet(`/notes/${noteId}`).reply(200, mockNote);
  });

  test('should load, edit and save a note', async () => {
    // Mock API response for note update
    mockAxios.onPut(`/notes/${noteId}`).reply(200, {
      ...mockNote,
      title: 'Updated Title',
      raw_content: 'Updated content',
      tags: ['original', 'updated'],
      updated_at: new Date().toISOString()
    });

    renderWithProviders(
      <MemoryRouter initialEntries={[`/notes/${noteId}/edit`]}>
        <Routes>
          <Route path="/notes/:noteId/edit" element={<EditNote />} />
          <Route path="/notes/:noteId" element={<div>Note Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Wait for note to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
    });
    
    // Edit the note
    await userEvent.clear(screen.getByLabelText(/title/i));
    await userEvent.type(screen.getByLabelText(/title/i), 'Updated Title');
    await userEvent.clear(screen.getByTestId('editor'));
    await userEvent.type(screen.getByTestId('editor'), 'Updated content');
    
    // Add a new tag
    const tagInput = screen.getByPlaceholderText(/add tag/i);
    await userEvent.type(tagInput, 'updated');
    await userEvent.keyboard('{enter}');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Verify redirect and success toast
    await waitFor(() => {
      expect(mockAxios.history.put.length).toBe(1);
      expect(mockAxios.history.put[0].data).toContain('Updated Title');
      expect(screen.getByText(/note updated/i)).toBeInTheDocument();
      expect(screen.getByText('Note Detail Page')).toBeInTheDocument();
    });
  });
}); 