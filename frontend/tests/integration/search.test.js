import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAxios } from '../setup';
import App from '../../src/App';
import { MemoryRouter } from 'react-router-dom';

describe('Search Integration Flow', () => {
  const mockSearchResults = [
    {
      id: 'note-1',
      title: 'Result One',
      raw_content: 'Content with search term',
      tags: ['search', 'test'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      similarity: 0.85
    },
    {
      id: 'note-2',
      title: 'Result Two',
      raw_content: 'Another content with search',
      tags: ['test'],
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      similarity: 0.75
    }
  ];

  beforeEach(() => {
    mockAxios.reset();
    // Mock initial notes load
    mockAxios.onGet('/notes?include_archived=false').reply(200, []);
    // Mock search API response
    mockAxios.onPost('/notes/search').reply(200, mockSearchResults);
  });

  test('should perform search and display results', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/my notes/i)).toBeInTheDocument();
    });
    
    // Perform search from navbar
    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'test search');
    await userEvent.keyboard('{enter}');
    
    // Verify we navigated to search results
    await waitFor(() => {
      expect(screen.getByText(/results for/i)).toBeInTheDocument();
      expect(screen.getByText('Result One')).toBeInTheDocument();
      expect(screen.getByText('Result Two')).toBeInTheDocument();
    });
  });
}); 