# app/schemas/__init__.py
from .note import Note, NoteCreate, NoteUpdate, NoteSearchQuery, SimilarNoteResult, TagList
from .revision import Revision, RevisionCreate, DiffView