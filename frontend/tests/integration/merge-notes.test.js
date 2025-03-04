import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAxios } from '../setup';
import MergeNotes from '../../src/pages/MergeNotes';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('Merge Notes Integration Flow', () => {
  const mockNotes = [
    {
      id: 'note-1',
      title: 'First Note',
      raw_content: 'First note content',
      tags: ['merge'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 'note-2',
      title: 'Second Note',
      raw_content: 'Second note content',
      tags: ['merge'],
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    mockAxios.reset();
    mockAxios.onGet('/notes').reply(200, mockNotes);
  });

  test('should merge selected notes', async () => {
    const mergedNote = {
      id: 'merged-note',
      title: 'Merged Note',
      raw_content: 'First note content\n\n---\n\nSecond note content',
      tags: ['merge'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockAxios.onPost('/notes/merge').reply(201, mergedNote);

    renderWithProviders(
      <MemoryRouter initialEntries={['/merge']}>
        <Routes>
          <Route path="/merge" element={<MergeNotes />} />
          <Route path="/notes/:noteId" element={<div>Note Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });
    
    // Enter merged note title
    await userEvent.type(screen.getByLabelText(/new note title/i), 'Merged Note');
    
    // Select notes to merge
    await userEvent.click(screen.getAllByRole('checkbox')[0]);
    await userEvent.click(screen.getAllByRole('checkbox')[1]);
    
    // Click merge button
    await userEvent.click(screen.getByRole('button', { name: /merge selected notes/i }));
    
    // Verify API call and redirect
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(JSON.parse(mockAxios.history.post[0].data).note_ids).toContain('note-1');
      expect(JSON.parse(mockAxios.history.post[0].data).note_ids).toContain('note-2');
      expect(screen.getByText('Note Detail Page')).toBeInTheDocument();
    });
  });
}); 