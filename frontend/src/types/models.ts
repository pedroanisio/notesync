// src/types/models.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  raw_content?: string;
  tags: string[];
  created_at: string;
  updated_at?: string | null;
  is_archived?: boolean;
}

export interface NoteCreateInput {
  title: string;
  raw_content: string;
  tags?: string[];
}

export interface NoteUpdateInput {
  title?: string;
  raw_content?: string;
  tags?: string[];
} 