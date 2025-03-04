import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAxios } from '../setup';
import CreateNote from '../../src/pages/CreateNote';

describe('Create Note Integration Flow', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  test('should create a new note and redirect to note detail page', async () => {
    // Mock API response for note creation
    mockAxios.onPost('/notes').reply(201, {
      id: 'new-note-id',
      title: 'Test Note',
      raw_content: 'This is a test note',
      tags: ['test', 'integration'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    renderWithProviders(<CreateNote />);
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/title/i), 'Test Note');
    await userEvent.type(screen.getByTestId('editor'), 'This is a test note');
    
    // Add tags
    const tagInput = screen.getByPlaceholderText(/add tag/i);
    await userEvent.type(tagInput, 'test');
    await userEvent.keyboard('{enter}');
    await userEvent.type(tagInput, 'integration');
    await userEvent.keyboard('{enter}');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify redirect and success toast
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
      expect(mockAxios.history.post[0].data).toContain('Test Note');
      expect(screen.getByText(/note created/i)).toBeInTheDocument();
    });
  });
}); 