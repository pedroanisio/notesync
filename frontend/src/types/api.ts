import { Note } from './models';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

export type NotesResponse = ApiResponse<Note[]>;
export type NoteResponse = ApiResponse<Note>;

export function isApiError(obj: any): obj is ApiError {
  return obj && typeof obj === 'object' && 'error' in obj && 'status' in obj;
} 