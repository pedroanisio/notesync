import React, { createContext, useState, useEffect, useContext, useCallback, useRef, ReactNode } from 'react';
import { Note, NoteCreateInput, NoteUpdateInput } from '../types/models';
import { NoteContextType, SearchOptions } from '../types/contexts';
import { getNotes, getNote, createNote, updateNote, archiveNote, searchNotes, SearchParams } from '../services/noteService';

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const useNotes = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};

// Add the new hook name that our modern components are using
export const useNoteContext = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
};

interface NoteProviderProps {
  children: ReactNode;
}

export const NoteProvider: React.FC<NoteProviderProps> = ({ children }) => {
  console.log('🔍 NoteProvider initializing');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  
  // Create refs to track current noteId and prevent duplicate fetches
  const currentNoteIdRef = useRef<string | null>(null);
  const isInitialMount = useRef<boolean>(true);

  // Fetch all notes
  const fetchNotes = useCallback(async (includeArchived = false): Promise<Note[] | undefined> => {
    console.log('🔍 fetchNotes called', { includeArchived });
    setLoading(true);
    try {
      console.log('🔍 Attempting to fetch notes from API...');
      const data = await getNotes(includeArchived);
      console.log('✅ Fetched notes successfully:', data.length, 'notes');
      setNotes(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('🔴 Error fetching notes:', err);
      setError('Error fetching notes. Please try again.');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single note
  const fetchNote = useCallback(async (noteId: string): Promise<Note | null> => {
    // Skip duplicate fetches for the same noteId
    if (currentNoteIdRef.current === noteId && currentNote && currentNote.id === noteId) {
      console.log('🔍 Skipping duplicate fetch for note:', noteId);
      return currentNote;
    }
    
    console.log('🔍 fetchNote called', { noteId });
    setLoading(true);
    try {
      console.log('🔍 Attempting to fetch note from API...');
      const data = await getNote(noteId);
      console.log('✅ Fetched note successfully:', data);
      setCurrentNote(data);
      currentNoteIdRef.current = noteId;
      setError(null);
      return data;
    } catch (err) {
      console.error('🔴 Error fetching note:', err);
      setError('Error fetching note. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentNote]);

  // Create a new note
  const addNote = useCallback(async (noteData: NoteCreateInput): Promise<Note | null> => {
    console.log('🔍 addNote called', { noteData });
    setLoading(true);
    try {
      console.log('🔍 Attempting to create note...');
      const newNote = await createNote(noteData);
      console.log('✅ Created note successfully:', newNote);
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setError(null);
      return newNote;
    } catch (err) {
      console.error('🔴 Error creating note:', err);
      setError('Error creating note. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Edit an existing note
  const editNote = useCallback(async (noteId: string, noteData: NoteUpdateInput): Promise<Note | null> => {
    console.log('🔍 editNote called', { noteId, noteData });
    setLoading(true);
    try {
      console.log('🔍 Attempting to update note...');
      const updatedNote = await updateNote(noteId, noteData);
      console.log('✅ Updated note successfully:', updatedNote);
      
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === noteId ? updatedNote : note))
      );
      
      if (currentNote && currentNote.id === noteId) {
        setCurrentNote(updatedNote);
      }
      
      setError(null);
      return updatedNote;
    } catch (err) {
      console.error('🔴 Error updating note:', err);
      setError('Error updating note. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentNote]);

  // Archive a note
  const archiveNoteById = useCallback(async (noteId: string): Promise<boolean> => {
    console.log('🔍 archiveNoteById called', { noteId });
    setLoading(true);
    try {
      console.log('🔍 Attempting to archive note...');
      await archiveNote(noteId);
      console.log('✅ Archived note successfully');
      
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      
      if (currentNote && currentNote.id === noteId) {
        setCurrentNote(null);
        currentNoteIdRef.current = null;
      }
      
      setError(null);
      return true;
    } catch (err) {
      console.error('🔴 Error archiving note:', err);
      setError('Error archiving note. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentNote]);

  // Search notes
  const search = useCallback(async (query: string, options: SearchOptions = {}): Promise<Note[]> => {
    console.log('🔍 search called', { query, options });
    setLoading(true);
    try {
      console.log('🔍 Attempting to search notes...');
      const searchParams: SearchParams = { 
        query,
        tags: options.tags,
        includeArchived: options.includeArchived
      };
      const results = await searchNotes(searchParams);
      console.log('✅ Search successful:', results.length, 'results');
      setError(null);
      return results;
    } catch (err) {
      console.error('🔴 Error searching notes:', err);
      setError('Error searching notes. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notes on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      console.log('🔍 NoteProvider useEffect running - initial data fetch');
      fetchNotes().then(data => {
        console.log('✅ Initial notes fetch complete:', data ? data.length : 0, 'notes loaded');
      }).catch(err => {
        console.error('🔴 Error in initial notes fetch:', err);
      });
      isInitialMount.current = false;
    }
  }, [fetchNotes]);

  const value: NoteContextType = {
    notes,
    loading,
    error,
    currentNote,
    fetchNotes,
    fetchNote,
    addNote,
    editNote,
    archiveNoteById,
    search,
  };

  console.log('🔍 NoteProvider rendering with context value:', { 
    notesCount: notes.length, 
    hasCurrentNote: !!currentNote, 
    isLoading: loading, 
    hasError: !!error 
  });

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
};

export default NoteContext; 