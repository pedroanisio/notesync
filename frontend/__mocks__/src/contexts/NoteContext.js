import React from 'react';

// Mock data
const mockNotes = [
  { 
    id: '1', 
    title: 'First Note', 
    content: 'This is the first note content', 
    raw_content: 'This is the first note content',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    tags: ['test', 'sample']
  },
  { 
    id: '2', 
    title: 'Second Note', 
    content: 'This is the second note content', 
    raw_content: 'This is the second note content',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    tags: ['demo', 'example']
  }
];

// Mock context value
const mockContextValue = {
  notes: mockNotes,
  loading: false,
  error: null,
  fetchNotes: jest.fn().mockResolvedValue(mockNotes),
  addNote: jest.fn().mockImplementation(noteData => Promise.resolve({ id: '3', ...noteData })),
  updateNote: jest.fn().mockImplementation((id, noteData) => Promise.resolve({ id, ...noteData })),
  deleteNote: jest.fn().mockResolvedValue(true),
  archiveNote: jest.fn().mockImplementation(id => Promise.resolve({ id, archived: true })),
  unarchiveNote: jest.fn().mockImplementation(id => Promise.resolve({ id, archived: false })),
  mergeNotes: jest.fn().mockResolvedValue({ id: '4', title: 'Merged Note' })
};

// Mock context
export const NoteContext = React.createContext(mockContextValue);

// Mock provider component
export const NoteProvider = ({ children }) => {
  return (
    <NoteContext.Provider value={mockContextValue}>
      {children}
    </NoteContext.Provider>
  );
};

// Mock hook
export const useNoteContext = () => {
  return mockContextValue;
}; 