// src/services/noteService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all notes
export const getNotes = async (includeArchived = false) => {
  try {
    const response = await api.get(`/notes?include_archived=${includeArchived}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

// Get a single note by ID
export const getNote = async (noteId) => {
  try {
    const response = await api.get(`/notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching note ${noteId}:`, error);
    throw error;
  }
};

// Create a new note
export const createNote = async (noteData) => {
  try {
    const response = await api.post('/notes', noteData);
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

// Update an existing note
export const updateNote = async (noteId, noteData) => {
  try {
    const response = await api.put(`/notes/${noteId}`, noteData);
    return response.data;
  } catch (error) {
    console.error(`Error updating note ${noteId}:`, error);
    throw error;
  }
};

// Archive a note
export const archiveNote = async (noteId) => {
  try {
    const response = await api.post(`/notes/${noteId}/archive`);
    return response.data;
  } catch (error) {
    console.error(`Error archiving note ${noteId}:`, error);
    throw error;
  }
};

// Search notes
export const searchNotes = async (searchParams) => {
  try {
    const response = await api.post('/notes/search', searchParams);
    return response.data;
  } catch (error) {
    console.error('Error searching notes:', error);
    throw error;
  }
};

// Get similar notes
export const getSimilarNotes = async (noteId, limit = 5) => {
  try {
    const response = await api.get(`/notes/${noteId}/similar?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting similar notes for ${noteId}:`, error);
    throw error;
  }
};

// Get all tags
export const getAllTags = async () => {
  try {
    const response = await api.get('/notes/tags/all');
    return response.data.tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

// Get notes by tag
export const getNotesByTag = async (tag) => {
  try {
    const response = await api.get(`/notes/tag/${tag}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching notes with tag ${tag}:`, error);
    throw error;
  }
};

// Merge notes
export const mergeNotes = async (noteIds, newTitle, separator = "\n\n---\n\n") => {
  try {
    const response = await api.post('/notes/merge', { note_ids: noteIds, new_title: newTitle, separator });
    return response.data;
  } catch (error) {
    console.error('Error merging notes:', error);
    throw error;
  }
};