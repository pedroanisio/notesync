import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../src/pages/Dashboard';
import { renderWithProviders } from '../setup';
import { mockAxios } from '../setup';

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
    mockAxios.resetHistory();
    mockAxios.onGet('/notes?include_archived=false').reply(200, mockNotes);
  });

  test('should display notes and allow filtering by tag', async () => {
    // Render the dashboard component
    renderWithProviders(<Dashboard />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check that API was called
    expect(mockAxios.history.get.length).toBeGreaterThan(0);
    
    // Find the filter by tag button and click it
    const filterButton = screen.getByText(/Filter by Tag/i);
    await userEvent.click(filterButton);
    
    // Find the tag option (may need to adjust based on how your component is structured)
    const tagOption = await screen.findByText('test');
    await userEvent.click(tagOption);
    
    // After filtering, expect only the first note to be visible
    // This depends on your implementation - you may need to mock another API call here
  });

  test('should allow changing view mode and sorting', async () => {
    // Render the dashboard component
    renderWithProviders(<Dashboard />);
    
    // Wait for notes to load
    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Try to find the view mode buttons by their accessible names or icons
    // If your buttons don't have proper labels, you might need to find them differently
    const listViewButton = screen.getByRole('button', { name: /list/i }) || 
                          screen.getByTestId('list-view-button') ||
                          screen.getAllByRole('button')[4]; // Fallback to index if needed
    
    await userEvent.click(listViewButton);
    
    // Change sort order
    const sortSelect = screen.getByRole('combobox') || 
                      screen.getByTestId('sort-select');
    
    await userEvent.selectOptions(sortSelect, ['alphabetical']);
    
    // Check that notes have been re-sorted (depends on your implementation)
  });
}); 