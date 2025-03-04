---
filename: PLAN.md
---
Postgres
Notes
  - id: HASH             // Primary key using content hash
  - RAW Content          // Original markdown content
  - Title                // Note title
  - Content              // Processed content
  - Created_at           // Creation timestamp
  - Updated_at           // Last update timestamp
  - Archived FLAG        // Soft delete/archive flag
  - Tags Array           // Array of tags
  - Links_TO: [Hashs]    // Outgoing links to other notes
  - Links_FROM: [Hashs]  // Incoming links from other notes
  - VectorData: [Vector] // Vector embedding for similarity search
   
--- 
NotesRevision
   - note_id             // Reference to the parent note (FK to Notes.id)
   - revision_id         // Unique identifier for this revision
   - content_raw_diff    // Diff of the raw content
   - content_diff        // Diff of the processed content
   - created_at          // Timestamp when revision was created
   - revision_name       // Optional name for this revision
   - revision_note       // Optional note about changes in this revision
   

--

-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- For UUID generation

-- Notes table
CREATE TABLE notes (
    id TEXT PRIMARY KEY,                       -- Content hash as ID
    raw_content TEXT NOT NULL,                 -- Original markdown
    title TEXT NOT NULL,                       -- Note title
    content TEXT NOT NULL,                     -- Processed content
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN NOT NULL DEFAULT FALSE,   -- Soft delete flag
    tags TEXT[] DEFAULT '{}',                  -- Array of tags
    links_to TEXT[] DEFAULT '{}',              -- Outgoing links
    links_from TEXT[] DEFAULT '{}',            -- Incoming links
    vector_data VECTOR(1536)                   -- Embedding vector
);

-- Revisions table
CREATE TABLE notes_revision (
    note_id TEXT NOT NULL REFERENCES notes(id), -- Reference to parent note
    revision_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Unique revision ID
    content_raw_diff TEXT NOT NULL,            -- Diff of raw content
    content_diff TEXT NOT NULL,                -- Diff of processed content
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revision_name TEXT,                        -- Optional revision name
    revision_note TEXT,                        -- Optional note about changes
    
    -- Additional helpful fields
    revision_number SERIAL,                    -- Sequential revision number
    parent_revision_id UUID REFERENCES notes_revision(revision_id) -- For revision hierarchy
);

-- Create indexes for efficient querying
CREATE INDEX ON notes USING ivfflat (vector_data vector_cosine_ops);
CREATE INDEX ON notes USING GIN (tags);
CREATE INDEX ON notes_revision (note_id, created_at);
CREATE INDEX ON notes_revision (parent_revision_id);

---

### 1. Create Note
- Generate a hash from the content
- Insert record into `notes` table with details
- Generate vector embedding for the content
- Store initial tags and detect any links

### 2. Search Note
- Full-text search on `title` and `content`
- Tag-based filtering using the `tags` array
- Semantic search using vector similarity on `vector_data`

### 3. Edit Note
- Update content in the `notes` table
- Update `updated_at` timestamp

### 4. Save Revision
- Before updating a note, create a diff between old and new content
- Store diff in `notes_revision` table with appropriate metadata
- Assign new revision number and link to parent revision

### 5. Revert Revision
- Retrieve specific revision's diffs
- Apply reverse patches to current content
- Save as a new revision (marking it as a reversion)
- Update the note with the reverted content

### 6. View Revision History
- Query `notes_revision` table for all revisions of a specific note
- Sort by `created_at` or `revision_number`
- Display metadata like revision name, notes, and timestamps

### 7. View Note
- Retrieve full note details including content, metadata, and tags
- Optionally load linked notes (those in `links_to` array)

### 8. View Similar Notes
- Use vector similarity search on `vector_data`
- Query notes with similar vector embeddings using cosine similarity

### 9. Merge Notes
- Create a new note combining content from multiple notes
- Generate new hash for combined content
- Update or create links as needed
- Optionally mark original notes as archived

### 10. Archive Notes
- Set `archived` flag to true
- Notes remain in database but are filtered out from default views

### 11. View Notes Links_FROM
- Query all notes where the current note's ID appears in their `links_to` array
- Alternatively, directly use the `links_from` array if kept in sync

---

Below is version **1.1** of the UI/UX 

## Revised UI/UX Plan (Version 1.1)

Below is the updated design and wireframes with the integrated improvements:

---

### 1. Overall Design Principles

- **Simplicity & Clarity:**  
  Minimal, clean interface with emphasis on content.
- **Responsiveness:**  
  Adaptive layouts for desktop, tablet, and mobile.
- **Accessibility:**  
  High-contrast colors, legible typography, keyboard navigation.
- **Consistency:**  
  Uniform design elements for predictability.
- **Feedback & Guidance:**  
  Real-time loaders, error messages, confirmations, and tooltips.

---

### 2. Key User Flows and Screens

#### A. Revised Dashboard / Home Screen

**Concept Overview:**

- **Left Side Panel (Dense Note Listing):**  
  A vertical, scrollable panel on the left displays a compact list of notes (titles, snippets, tags). It supports inline actions like quick-edit or archive.
- **Main Content Area:**  
  Displays detailed views such as note previews, activity feeds, or search results.
- **Top Navigation:**  
  A global horizontal menu (e.g., Home, Create Note, Archived, Merge, Settings).

**Updated ASCII Wireframe:**

```
+---------------------------------------------------------------------------------+
| Top Navigation: [Home] [Create Note] [Archived] [Merge] [Settings]               |
+---------------------------------------------------------------------------------+
|                   |                                                            |
| Left Side Panel   |    Main Content Area                                       |
| (Dense Note List) |                                                            |
|                   |  +------------------------------------------------------+  |
| +---------------+ |  |                                                      |  |
| | Note 1        | |  |    [Detailed Note Preview / Activity Feed /         |  |
| | - Title       | |  |     Search Results display area]                    |  |
| | - Tags        | |  |                                                      |  |
| +---------------+ |  +------------------------------------------------------+  |
| | Note 2        | |                                                            |
| | - Title       | |                                                            |
| | - Tags        | |                                                            |
| +---------------+ |                                                            |
| | Note 3        | |                                                            |
| | - Title       | |                                                            |
| | - Tags        | |                                                            |
| +---------------+ |                                                            |
| | ...           | |                                                            |
| +---------------+ |                                                            |
+---------------------------------------------------------------------------------+
```

---

#### B. Note Creation & Editing

##### Create Note Screen

- **Editor Interface:**  
  Split view with a markdown editor (with real-time conflict indicators) and a live preview.
- **Metadata Panel:**  
  Fields for title, tags, and inline suggestions for auto-detecting links.
- **Background Processes:**  
  Content hash generation and vector embedding occur with progress indicators. If multiple editors are detected, a merge resolution prompt appears.

**ASCII Wireframe:**

```
+---------------------------------------------------------------+
| Navigation: [Home] [Create Note] [Archived] [Settings]         |
+---------------------------------------------------------------+
| Title: [______________________________]                       |
| Tags:  [ tag1, tag2, ... ]                                      |
+---------------------------------------------------------------+
| Editor Panel                | Live Preview Panel              |
| +-------------------------+ | +-----------------------------+ |
| | Markdown Editor         | | | Rendered Markdown Content   | |
| | (editable area)         | | | (read-only preview)         | |
| | [Conflict Warning if    | | |                             | |
| | concurrent edit detected]| | |                             | |
| +-------------------------+ | +-----------------------------+ |
+---------------------------------------------------------------+
| [Save]  [Auto-Save Revision]  [Cancel]                         |
+---------------------------------------------------------------+
```

##### Edit Note Screen

- Similar to Create Note, pre-populated with existing content and integrated conflict resolution if concurrent editing is detected.

---

#### C. Revision Management

- **Revision History Screen:**  
  Displays all revisions with revision numbers, dates, and brief descriptions.
- **Diff Viewer:**  
  Provides side-by-side or unified diff views with inline color-coded highlighting for additions and deletions. A toggle allows switching between raw and rendered diffs.
- **Revert Functionality:**  
  A “Revert” button per revision, with a confirmation modal.

**ASCII Wireframe:**

```
+---------------------------------------------------------------+
| Navigation: [Home] [Note Detail] [Revision History]            |
+---------------------------------------------------------------+
| Revision History for "Note Title"                              |
| +-----------------------------------------------------------+  |
| | Rev 1: [Date] - "Initial creation"  [View Diff] [Revert]  |  |
| +-----------------------------------------------------------+  |
| +-----------------------------------------------------------+  |
| | Rev 2: [Date] - "Updated content"     [View Diff] [Revert]|  |
| +-----------------------------------------------------------+  |
| ...                                                           |
+---------------------------------------------------------------+
```

---

#### D. Note Viewing

- **Note Detail Page:**  
  Displays the note title, rendered content, metadata, and tags.
- **Linked Notes Panel:**  
  Shows outgoing (“Links_TO”) and incoming (“Links_FROM”) note connections.
- **Revision & Similar Notes Buttons:**  
  Quick-access buttons to open revision history or display similar notes (using vector similarity).

**ASCII Wireframe:**

```
+---------------------------------------------------------------+
| Navigation: [Home] [Edit Note] [Revision History] [Search]     |
+---------------------------------------------------------------+
| Title: Note Title                                              |
| Tags: [tag1] [tag2]                                            |
| Created: [Date]   |   Updated: [Date]                          |
+---------------------------------------------------------------+
| Note Content (rendered markdown):                              |
| "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."   |
+---------------------------------------------------------------+
| Outgoing Links: [Link 1] [Link 2]                               |
| Incoming Links: [Note A] [Note B]                               |
| [View Similar Notes]                                            |
+---------------------------------------------------------------+
```

---

#### E. Search & Similarity Features

- **Search Modal/Screen:**  
  Advanced filtering for full-text search, tag filtering, and semantic (vector similarity) search. Results are displayed in a ranked list with similarity scores.
- **Similar Notes Section:**  
  After selecting a note, a carousel or list displays similar notes with interactive details.

---

#### F. Merge & Archive

##### Merge Notes Wizard

- **Selection Phase:**  
  Users can select multiple notes via list or search.
- **Preview & Combine:**  
  A pre-merge preview allows users to reorder, edit, or omit sections before finalizing the merge.
- **Post-Merge Options:**  
  Users can choose to archive the original notes, with clear confirmation steps.

##### Archive Feature

- **Archiving Mechanism:**  
  A toggle or button in the note detail view marks the note as archived.
- **Archived View:**  
  A dedicated page lists archived notes, with options to restore them.

---

#### G. Backup & Import/Export

- **Backup & Export:**  
  Available in settings, users can export notes in JSON or Markdown formats.
- **Import Flow:**  
  An “Import” interface supports file uploads, validates data, and previews content before import.

---

### 3. Interaction & Microinteractions

- **Real-time Updates:**  
  Use loaders/progress bars during intensive operations (embedding, saving revisions).
- **Undo/Redo Capabilities:**  
  Integrated into the editor.
- **Tooltips & Help:**  
  Provide hover-over tooltips for interactive elements (edit, revert, merge) and inline help text.
- **Confirmation & Notifications:**  
  Use modal confirmations for destructive actions and toast messages for successful operations.

---

### 4. Navigation & Layout

- **Persistent Navigation:**  
  Top or side navigation is available on every screen:
  - Home/Dashboard, Create Note, Search, Archived Notes, Settings.
- **Breadcrumbs:**  
  Provide breadcrumbs for deeper navigation paths (e.g., revision history).
- **Responsive Layouts:**  
  On mobile, the dense left panel collapses into a drawer; note detail views are optimized for vertical scrolling.

---

### 5. Visual Style & Components

- **Color Palette:**  
  Neutral backgrounds with accent colors (blue for primary, red for destructive actions).
- **Typography:**  
  Legible fonts with clear emphasis on headers and body text.
- **Icons & Illustrations:**  
  Simple icons for editing, merging, revising, and navigation.
- **Card-Based Design:**  
  Modular card layouts are used for note previews, revisions, and similar notes.

---

### 6. Additional Considerations

- **Performance:**  
  Optimize UI for handling large volumes of notes and revisions.
- **Onboarding:**  
  An interactive tour introduces key features (e.g., note creation, editing, merging).
- **Customization:**  
  Options for dark/light mode and grid vs. list layouts.
- **Security:**  
  Clear confirmation prompts prevent accidental data loss during destructive actions.

---

# Note-Taking Application POC Plan

I'll outline a plan for building a Proof of Concept (POC) of this note-taking solution.

## 1. POC Scope

### Core Features (Must-Have)
- Note creation and editing with Markdown support
- Basic storage and retrieval of notes
- Simple tag functionality
- Note revision history with basic diff viewing
- Vector embeddings for similarity search (limited scale)
- Minimal UI with responsive design

### Excluded from POC
- Advanced conflict resolution
- Comprehensive merge functionality
- Full backup/restore system
- Advanced search capabilities beyond basic proof of concept
- Performance optimization for large datasets

## 2. Technology Stack

### Backend
- **Language**: Python (Fast development, rich ecosystem)
- **Framework**: FastAPI (Modern, async, great for APIs)
- **Database**: PostgreSQL (As specified in requirements)
- **ORM**: SQLAlchemy (For database interaction)
- **Vector Embeddings**: Sentence Transformers (For generating embeddings)
- **Diff Library**: python-diff-match-patch (Google's implementation)

### Frontend
- **Framework**: React (Component-based, widespread adoption)
- **UI Library**: Chakra UI (Accessible, responsive components)
- **State Management**: React Context API (Simpler than Redux for POC)
- **Markdown Editor**: React-SimpleMDE (Simple yet feature-rich)
- **HTTP Client**: Axios (For API calls)

### DevOps/Infrastructure
- **Containerization**: Docker and Docker Compose (For easy setup)
- **Version Control**: Git
- **API Documentation**: FastAPI's built-in Swagger UI

## 3. Project Structure

```
note-taking-poc/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── notes.py
│   │   │   │   ├── revisions.py
│   │   │   │   └── search.py
│   │   │   └── dependencies.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── models.py
│   │   │   └── session.py
│   │   ├── services/
│   │   │   ├── note_service.py
│   │   │   ├── revision_service.py
│   │   │   ├── embedding_service.py
│   │   │   └── diff_service.py
│   │   └── main.py
│   ├── migrations/
│   │   └── versions/
│   ├── tests/
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── notes/
│   │   │   ├── revisions/
│   │   │   └── search/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 4. Class Diagrams

### Backend Models

```
+------------------+       +----------------------+
|      Note        |       |    NoteRevision      |
+------------------+       +----------------------+
| id: str (PK)     |       | revision_id: UUID (PK)|
| raw_content: str |       | note_id: str (FK)     |
| title: str       |<----->| content_raw_diff: str|
| content: str     |       | content_diff: str    |
| created_at: dt   |       | created_at: dt       |
| updated_at: dt   |       | revision_name: str   |
| archived: bool   |       | revision_note: str   |
| tags: List[str]  |       | revision_number: int |
| links_to: List   |       | parent_rev_id: UUID  |
| links_from: List |       +----------------------+
| vector_data: vec |
+------------------+
```

### Service Layer

```
+--------------------+      +---------------------+
|   NoteService      |      |  RevisionService    |
+--------------------+      +---------------------+
| create_note()      |      | save_revision()     |
| get_note()         |<---->| get_revisions()     |
| update_note()      |      | revert_to_revision()|
| archive_note()     |      | get_diff()          |
| get_linked_notes() |      +---------------------+
+--------------------+           ^
        ^                        |
        |                        |
+--------------------+      +---------------------+
| EmbeddingService   |      |    DiffService      |
+--------------------+      +---------------------+
| generate_embedding()|     | create_diff()       |
| find_similar()     |      | apply_diff()        |
+--------------------+      | render_diff()       |
                           +---------------------+
```

## 5. Acceptable Technical Debt for POC

1. **Authentication**: Simple API key or token-based auth rather than full OAuth/JWT
2. **Error Handling**: Basic error handling without comprehensive logging
3. **Vector Storage**: Basic PostgreSQL vector extension without optimization for large-scale deployments
4. **Test Coverage**: Focus on critical path testing, not comprehensive coverage
5. **UI Polish**: Functional UI prioritized over aesthetic refinement
6. **Concurrent Editing**: Basic locking mechanism rather than real-time collaboration
7. **Mobile Optimization**: Responsive design but not fully optimized for mobile experience

## 6. Phased Approach

### Phase 1: Foundation
- Set up project structure and infrastructure
- Implement basic database models
- Create simple CRUD API for notes
- Build minimal UI for note creation and viewing

### Phase 2: Core Functionality
- Implement revision history and diff viewing
- Add tag functionality
- Create vector embedding generation
- Develop basic similarity search

### Phase 3: Enhanced Features
- Add markdown editor with preview
- Implement bidirectional linking
- Create basic merge functionality
- Add archived notes view

### Phase 4: Polish and Evaluation
- Improve UI/UX based on testing
- Address critical bugs and issues
- Document limitations and learnings
- Prepare recommendations for production version

## 7. Evaluation Criteria for POC Success

1. Core functionality works as expected
2. System handles basic use cases without critical errors
3. Vector embedding similarity search demonstrates value
4. Revision history effectively tracks changes
5. UI is functional and responsive
6. Architecture proves scalable for future development

