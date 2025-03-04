// Complete mock for noteService.js
export const getNotes = jest.fn().mockImplementation(() => {
  return Promise.resolve([
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
  ]);
});

export const getNote = jest.fn().mockImplementation((id) => {
  return Promise.resolve({ 
    id: id || '1', 
    title: 'Test Note', 
    content: 'This is a test note content', 
    raw_content: 'This is a test note content',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    tags: ['test']
  });
});

export const createNote = jest.fn().mockImplementation((noteData) => {
  return Promise.resolve({ id: '3', ...noteData });
});

export const updateNote = jest.fn().mockImplementation((id, noteData) => {
  return Promise.resolve({ id, ...noteData });
});

export const deleteNote = jest.fn().mockImplementation(() => {
  return Promise.resolve({ success: true });
});

export const archiveNote = jest.fn().mockImplementation((id) => {
  return Promise.resolve({ id, archived: true });
});

export const unarchiveNote = jest.fn().mockImplementation((id) => {
  return Promise.resolve({ id, archived: false });
});

export const mergeNotes = jest.fn().mockImplementation(() => {
  return Promise.resolve({ id: '4', title: 'Merged Note' });
});

// Mock interceptor
const api = {
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
};

export default api; 