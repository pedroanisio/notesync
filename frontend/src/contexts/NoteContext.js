// src/contexts/NoteContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getNotes, getNote, createNote, updateNote, archiveNote, searchNotes } from '../services/noteService';

const NoteContext = createContext();

export const useNotes = () => useContext(NoteContext);

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);

  // Fetch all notes
  const fetchNotes = async (includeArchived = false) => {
    setLoading(true);
    try {
      const data = await getNotes(includeArchived);
      setNotes(data);
      setError(null);
    } catch (err) {
      setError('Error fetching notes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single note
  const fetchNote = async (noteId) => {
    setLoading(true);
    try {
      const data = await getNote(noteId);
      setCurrentNote(data);
      setError(null);
      return data;
    } catch (err) {
      setError('Error fetching note. Please try again.');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const addNote = async (noteData) => {
    setLoading(true);
    try {
      const newNote = await createNote(noteData);
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      setError(null);
      return newNote;
    } catch (err) {
      setError('Error creating note. Please try again.');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing note
  const editNote = async (noteId, noteData) => {
    setLoading(true);
    try {
      const updatedNote = await updateNote(noteId, noteData);
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === noteId ? updatedNote : note))
      );
      if (currentNote && currentNote.id === noteId) {
        setCurrentNote(updatedNote);
      }
      setError(null);
      return updatedNote;
    } catch (err) {
      setError('Error updating note. Please try again.');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Archive a note
  const archiveNoteById = async (noteId) => {
    setLoading(true);
    try {
      const archivedNote = await archiveNote(noteId);
      setNotes((prevNotes) =>
        prevNotes.filter((note) => note.id !== noteId)
      );
      if (currentNote && currentNote.id === noteId) {
        setCurrentNote(null);
      }
      setError(null);
      return archivedNote;
    } catch (err) {
      setError('Error archiving note. Please try again.');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Search notes
  const search = async (query, tags = [], semantic = false) => {
    setLoading(true);
    try {
      const results = await searchNotes({ query, tags, semantic });
      setError(null);
      return results;
    } catch (err) {
      setError('Error searching notes. Please try again.');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load notes on initial mount
  useEffect(() => {
    fetchNotes();
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

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
};

export default NoteContext;