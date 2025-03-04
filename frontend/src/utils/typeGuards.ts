import { Note } from '../types/models';
import { ApiError } from '../types/api';

export function isApiError(obj: any): obj is ApiError {
  return obj && 
    typeof obj === 'object' && 
    'error' in obj && 
    'status' in obj &&
    typeof obj.error === 'string';
}

export function isNote(obj: any): obj is Note {
  return obj && 
    typeof obj === 'object' && 
    'id' in obj &&
    'title' in obj &&
    'content' in obj &&
    Array.isArray(obj.tags);
}

export function isNonEmptyArray<T>(arr: T[] | null | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

export function hasProperty<K extends string>(obj: unknown, key: K): obj is { [key in K]: unknown } {
  return typeof obj === 'object' && obj !== null && key in obj;
} 