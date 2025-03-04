// src/types/common.ts
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type SortDirection = 'asc' | 'desc';

export interface PaginationOptions {
  page: number;
  limit: number;
}

// Utility type for form events
export type FormInputEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>; 