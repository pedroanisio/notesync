// src/services/revisionService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all revisions for a note
export const getNoteRevisions = async (noteId) => {
  try {
    const response = await api.get(`/notes/${noteId}/revisions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching revisions for note ${noteId}:`, error);
    throw error;
  }
};

// Get a specific revision
export const getRevision = async (revisionId) => {
  try {
    const response = await api.get(`/notes/revision/${revisionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching revision ${revisionId}:`, error);
    throw error;
  }
};

// Get diff view for a revision
export const getRevisionDiff = async (revisionId) => {
  try {
    const response = await api.get(`/notes/revision/${revisionId}/diff`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching diff for revision ${revisionId}:`, error);
    throw error;
  }
};

// Revert to a revision
export const revertToRevision = async (revisionId, revisionName = null, revisionNote = null) => {
  try {
    const params = {};
    if (revisionName) params.revision_name = revisionName;
    if (revisionNote) params.revision_note = revisionNote;
    
    const response = await api.post(`/notes/revision/${revisionId}/revert`, null, { params });
    return response.data;
  } catch (error) {
    console.error(`Error reverting to revision ${revisionId}:`, error);
    throw error;
  }
};

// Get note content at a specific revision
export const getNoteAtRevision = async (noteId, revisionNumber) => {
  try {
    const response = await api.get(`/notes/${noteId}/revision/${revisionNumber}/content`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching note ${noteId} at revision ${revisionNumber}:`, error);
    throw error;
  }
};