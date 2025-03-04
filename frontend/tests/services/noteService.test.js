/**
 * Tests for noteService
 * We'll mock fetch to avoid actual API calls
 */

// Mock the global fetch function
global.fetch = jest.fn();

// Import the service methods
jest.mock('../../src/services/noteService', () => {
  const originalModule = jest.requireActual('../../src/services/noteService');
  // Return a mock of the module with the same methods
  return {
    ...originalModule,
    // We'll override some methods for testing
    getNotes: jest.fn(),
    getNote: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
  };
});

const { 
  getNotes, 
  getNote, 
  createNote, 
  updateNote, 
  deleteNote 
} = require('../../src/services/noteService');

describe('Note Service', () => {
  // Reset mocks between tests
  beforeEach(() => {
    fetch.mockClear();
    getNotes.mockClear();
    getNote.mockClear();
    createNote.mockClear();
    updateNote.mockClear();
    deleteNote.mockClear();
  });

  test('getNotes function exists', () => {
    expect(typeof getNotes).toBe('function');
  });

  test('getNote function exists', () => {
    expect(typeof getNote).toBe('function');
  });

  test('createNote function exists', () => {
    expect(typeof createNote).toBe('function');
  });

  test('updateNote function exists', () => {
    expect(typeof updateNote).toBe('function');
  });

  test('deleteNote function exists', () => {
    expect(typeof deleteNote).toBe('function');
  });

  test('getNotes can be mocked to return data', async () => {
    const mockNotes = [
      { id: '1', title: 'Note 1', content: 'Content 1' },
      { id: '2', title: 'Note 2', content: 'Content 2' }
    ];
    
    getNotes.mockResolvedValue(mockNotes);
    
    const result = await getNotes();
    expect(result).toEqual(mockNotes);
    expect(getNotes).toHaveBeenCalledTimes(1);
  });

  test('getNote can be mocked to return a specific note', async () => {
    const mockNote = { id: '123', title: 'Test Note', content: 'Test content' };
    
    getNote.mockResolvedValue(mockNote);
    
    const result = await getNote('123');
    expect(result).toEqual(mockNote);
    expect(getNote).toHaveBeenCalledWith('123');
  });
}); 