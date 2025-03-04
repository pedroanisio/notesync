import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Note, NoteCreateInput, NoteUpdateInput } from '../types/models';
import { ApiResponse, NotesResponse, NoteResponse, ApiError, isApiError } from '../types/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://10.10.10.187:8000/api/v1';

console.log('🔍 noteService initializing with API_URL:', API_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    console.log(`🔍 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
    return config;
  },
  (error: any): Promise<never> => {
    console.error('🔴 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, 
      response.data ? (Array.isArray(response.data) ? `(${response.data.length} items)` : response.data) : 'No data');
    return response;
  },
  (error: any): Promise<never> => {
    console.error('🔴 API Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      method: error.config?.method,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// Get all notes
export const getNotes = async (includeArchived = false): Promise<Note[]> => {
  console.log('🔍 getNotes called', { includeArchived });
  try {
    const response = await api.get<NotesResponse>(`/notes?include_archived=${includeArchived}`);
    return response.data.data;
  } catch (error) {
    console.error('🔴 Error fetching notes:', error);
    throw error;
  }
};

// Get a single note by ID
export const getNote = async (noteId: string): Promise<Note> => {
  console.log('🔍 getNote called', { noteId });
  try {
    const response = await api.get<NoteResponse>(`/notes/${noteId}`);
    return response.data.data;
  } catch (error) {
    console.error(`🔴 Error fetching note ${noteId}:`, error);
    throw error;
  }
};

// Create a new note
export const createNote = async (noteData: NoteCreateInput): Promise<Note> => {
  console.log('🔍 createNote called', { noteData });
  try {
    const response = await api.post<NoteResponse>('/notes', noteData);
    return response.data.data;
  } catch (error) {
    console.error('🔴 Error creating note:', error);
    throw error;
  }
};

// Update an existing note
export const updateNote = async (noteId: string, noteData: NoteUpdateInput): Promise<Note> => {
  console.log('🔍 updateNote called', { noteId, noteData });
  try {
    const response = await api.put<NoteResponse>(`/notes/${noteId}`, noteData);
    return response.data.data;
  } catch (error) {
    console.error(`🔴 Error updating note ${noteId}:`, error);
    throw error;
  }
};

// Archive a note
export const archiveNote = async (noteId: string): Promise<void> => {
  console.log('🔍 archiveNote called', { noteId });
  try {
    await api.post(`/notes/${noteId}/archive`);
  } catch (error) {
    console.error(`🔴 Error archiving note ${noteId}:`, error);
    throw error;
  }
};

// Search notes
export interface SearchParams {
  query: string;
  tags?: string[];
  includeArchived?: boolean;
  limit?: number;
}

export const searchNotes = async (searchParams: SearchParams): Promise<Note[]> => {
  console.log('🔍 searchNotes called', { searchParams });
  try {
    const response = await api.post<NotesResponse>('/notes/search', searchParams);
    return response.data.data;
  } catch (error) {
    console.error('🔴 Error searching notes:', error);
    throw error;
  }
};

// Get similar notes
export const getSimilarNotes = async (noteId: string, limit = 5): Promise<Note[]> => {
  console.log('🔍 getSimilarNotes called', { noteId, limit });
  try {
    const response = await api.get<NotesResponse>(`/notes/${noteId}/similar?limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error(`🔴 Error getting similar notes for ${noteId}:`, error);
    throw error;
  }
};

// Get all tags
export const getAllTags = async (): Promise<string[]> => {
  console.log('🔍 getAllTags called');
  try {
    const response = await api.get<{ tags: string[] }>('/notes/tags/all');
    return response.data.tags;
  } catch (error) {
    console.error('🔴 Error fetching tags:', error);
    throw error;
  }
};

// Get notes by tag
export const getNotesByTag = async (tag: string): Promise<Note[]> => {
  console.log('🔍 getNotesByTag called', { tag });
  try {
    const response = await api.get<NotesResponse>(`/notes/tag/${tag}`);
    return response.data.data;
  } catch (error) {
    console.error(`🔴 Error fetching notes with tag ${tag}:`, error);
    throw error;
  }
};

// Merge notes
export interface MergeNotesParams {
  note_ids: string[];
  new_title: string;
  separator?: string;
}

export const mergeNotes = async (noteIds: string[], newTitle: string, separator = "\n\n---\n\n"): Promise<Note> => {
  console.log('🔍 mergeNotes called', { noteIds, newTitle, separator });
  try {
    const response = await api.post<NoteResponse>('/notes/merge', { 
      note_ids: noteIds, 
      new_title: newTitle, 
      separator 
    });
    return response.data.data;
  } catch (error) {
    console.error('🔴 Error merging notes:', error);
    throw error;
  }
}; 