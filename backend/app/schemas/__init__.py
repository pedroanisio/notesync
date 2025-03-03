# app/schemas/__init__.py
from .notes import Note, NoteCreate, NoteUpdate, NoteSearchQuery, SimilarNoteResult, TagList
from .revisions import Revision, RevisionCreate, DiffView