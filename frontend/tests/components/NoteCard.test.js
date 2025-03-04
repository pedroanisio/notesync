/**
 * NoteCard component tests
 * Starting with non-rendering tests to avoid React version conflicts
 */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../setup';
import NoteCard from '../../src/components/notes/NoteCard';

// Mock note data
const mockNote = {
  id: '123',
  title: 'Test Note Title',
  content: 'This is a test note content with enough text to test the preview functionality of the NoteCard component.',
  raw_content: 'This is the raw content that might be different from the processed content.',
  created_at: '2023-03-04T12:00:00Z',
  tags: ['test', 'mock', 'jest']
};

describe('NoteCard Component', () => {
  test('renders note title and preview', () => {
    renderWithProviders(<NoteCard note={mockNote} />);
    
    // Check that the title is displayed
    expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    
    // Check that the content preview is displayed
    expect(screen.getByText(/This is the raw content/)).toBeInTheDocument();
  });
  
  test('renders formatted date', () => {
    renderWithProviders(<NoteCard note={mockNote} />);
    
    // The date should be formatted as per the formatDate function in NoteCard
    // This will depend on the locale, but should include part of the date
    const date = new Date('2023-03-04T12:00:00Z');
    const formattedDatePart = date.toLocaleDateString().split('/')[0]; // Get part of the date
    
    expect(screen.getByText(new RegExp(formattedDatePart))).toBeInTheDocument();
  });
  
  test('renders tags when provided', () => {
    renderWithProviders(<NoteCard note={mockNote} />);
    
    // Check that all tags are displayed
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#mock')).toBeInTheDocument();
    expect(screen.getByText('#jest')).toBeInTheDocument();
  });
  
  test('shows similarity badge when showSimilarity is true', () => {
    renderWithProviders(
      <NoteCard 
        note={mockNote} 
        showSimilarity={true} 
        similarity={0.85} 
      />
    );
    
    // Check for the similarity badge
    expect(screen.getByText('85% similar')).toBeInTheDocument();
  });
  
  test('toggles content preview when "Show more" is clicked', () => {
    // Create a long content note to ensure "Show more" appears
    const longContentNote = {
      ...mockNote,
      raw_content: 'A'.repeat(200) // Create a string longer than 150 chars
    };
    
    renderWithProviders(<NoteCard note={longContentNote} />);
    
    // Find and click the "Show more" button
    const showMoreButton = screen.getByText(/Show more/);
    fireEvent.click(showMoreButton);
    
    // Now it should show "Show less"
    expect(screen.getByText(/Show less/)).toBeInTheDocument();
  });
}); 