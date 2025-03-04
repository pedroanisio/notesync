// Mock implementation of noteService.js
export const getNotes = jest.fn().mockResolvedValue([
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

export const getNote = jest.fn().mockResolvedValue({
  id: '1',
  title: 'First Note',
  content: 'This is the first note content',
  raw_content: 'This is the first note content',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  tags: ['test', 'sample']
});

export const createNote = jest.fn().mockResolvedValue({ id: '3', title: 'New Note' });
export const updateNote = jest.fn().mockResolvedValue({ id: '1', title: 'Updated Note' });
export const deleteNote = jest.fn().mockResolvedValue({ success: true });
export const archiveNote = jest.fn().mockResolvedValue({ id: '1', archived: true });
export const unarchiveNote = jest.fn().mockResolvedValue({ id: '1', archived: false });
export const mergeNotes = jest.fn().mockResolvedValue({ id: '3', title: 'Merged Note' }); 