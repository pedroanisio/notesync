import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAxios } from '../setup';
import Dashboard from '../../src/pages/Dashboard';

describe('Dashboard Integration Flow', () => {
  const mockNotes = [
    {
      id: 'note-1',
      title: 'First Note',
      raw_content: 'First note content',
      tags: ['work', 'important'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 'note-2',
      title: 'Second Note',
      raw_content: 'Second note content',
      tags: ['personal'],
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    mockAxios.reset();
    mockAxios.onGet('/notes?include_archived=false').reply(200, mockNotes);
  });

  test('should display notes and allow filtering by tag', async () => {
    renderWithProviders(<Dashboard />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });
    
    // Filter by tag
    await userEvent.click(screen.getByText(/filter by tag/i));
    await userEvent.click(screen.getByText('work'));
    
    // Only the work-tagged note should be visible
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.queryByText('Second Note')).not.toBeInTheDocument();
    });
  });

  test('should allow changing view mode and sorting', async () => {
    renderWithProviders(<Dashboard />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getAllByText(/note/i).length).toBeGreaterThan(0);
    });
    
    // Switch to list view
    await userEvent.click(screen.getByLabelText(/list view/i));
    
    // Change sort order
    await userEvent.selectOptions(screen.getByLabelText(/sort/i), ['alphabetical']);
    
    // Notes should be sorted alphabetically
    const noteElements = screen.getAllByRole('link');
    expect(noteElements[0]).toHaveTextContent('First Note');
    expect(noteElements[1]).toHaveTextContent('Second Note');
  });
}); 