// src/contexts/NoteContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getNotes, getNote, createNote, updateNote, archiveNote, searchNotes } from '../services/noteService';

const NoteContext = createContext();

export const useNotes = () => useContext(NoteContext);

export const NoteProvider = ({ children }) => {
  console.log('🔍 NoteProvider initializing');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);

  // Fetch all notes
  const fetchNotes = async (includeArchived = false) => {
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single note
  const fetchNote = async (noteId) => {
    console.log('🔍 fetchNote called', { noteId });
    setLoading(true);
    try {
      console.log('🔍 Attempting to fetch note from API...');
      const data = await getNote(noteId);
      console.log('✅ Fetched note successfully:', data);
      setCurrentNote(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('🔴 Error fetching note:', err);
      setError('Error fetching note. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const addNote = async (noteData) => {
    console.log('🔍 addNote called', { noteData });
    setLoading(true);
    try {
      console.log('🔍 Attempting to create note...');
      const newNote = await createNote(noteData);
      console.log('✅ Created note successfully:', newNote);
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      setError(null);
      return newNote;
    } catch (err) {
      console.error('🔴 Error creating note:', err);
      setError('Error creating note. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing note
  const editNote = async (noteId, noteData) => {
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
  };

  // Archive a note
  const archiveNoteById = async (noteId) => {
    console.log('🔍 archiveNoteById called', { noteId });
    setLoading(true);
    try {
      console.log('🔍 Attempting to archive note...');
      const archivedNote = await archiveNote(noteId);
      console.log('✅ Archived note successfully:', archivedNote);
      setNotes((prevNotes) =>
        prevNotes.filter((note) => note.id !== noteId)
      );
      if (currentNote && currentNote.id === noteId) {
        setCurrentNote(null);
      }
      setError(null);
      return archivedNote;
    } catch (err) {
      console.error('🔴 Error archiving note:', err);
      setError('Error archiving note. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Search notes
  const search = async (query, tags = [], semantic = false) => {
    console.log('🔍 search called', { query, tags, semantic });
    setLoading(true);
    try {
      console.log('🔍 Attempting to search notes...');
      const results = await searchNotes({ query, tags, semantic });
      console.log('✅ Search completed successfully:', results.length, 'results');
      setError(null);
      return results;
    } catch (err) {
      console.error('🔴 Error searching notes:', err);
      setError('Error searching notes. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load notes on initial mount
  useEffect(() => {
    console.log('🔍 NoteProvider useEffect running - initial data fetch');
    fetchNotes().then(data => {
      console.log('✅ Initial notes fetch complete:', data ? data.length : 0, 'notes loaded');
    }).catch(err => {
      console.error('🔴 Error in initial notes fetch:', err);
    });
  }, []);

  const value = {
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