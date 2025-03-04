import { Note, NoteCreateInput, NoteUpdateInput } from './models';

export interface SearchOptions {
  tags?: string[];
  includeArchived?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface NoteContextType {
  notes: Note[];
  loading: boolean;
  error: string | null;
  currentNote: Note | null;
  fetchNotes: (includeArchived?: boolean) => Promise<Note[] | undefined>;
  fetchNote: (noteId: string) => Promise<Note | null>;
  addNote: (noteData: NoteCreateInput) => Promise<Note | null>;
  editNote: (noteId: string, noteData: NoteUpdateInput) => Promise<Note | null>;
  archiveNoteById: (noteId: string) => Promise<boolean>;
  search: (query: string, options?: SearchOptions) => Promise<Note[]>;
} 