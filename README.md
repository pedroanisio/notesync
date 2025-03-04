---
filename: README.md
---
# NoteSync - Markdown Notes with Version History

A modern note-taking application with Markdown support, revision history, and vector similarity search.

The primary goal of this project is to create a **robust note-taking system** with built-in **version control**, **inter-note linking**, and **semantic search** capabilities.

1. **Note Storage & Metadata**  
   - Every note is stored in a PostgreSQL database with a unique hash-based ID. This allows each note’s original content, processed content, and associated metadata (e.g., tags, creation/updated timestamps) to be easily managed.
   - Notes can be “soft deleted” by setting an `archived` flag instead of permanently removing them.

2. **Revision Tracking**  
   - Each time a note changes, a “revision” record is created, capturing what changed in both the raw and processed content. This helps users view, compare, or revert to any past version of a note.

3. **Linking & Graph-Like Navigation**  
   - Notes can reference (link to) other notes. The system keeps track of these connections in both directions, enabling a web of interlinked content that users can navigate.

4. **Semantic Search**  
   - By storing vector embeddings (`vector_data`) for each note, the system supports **similarity-based searches**, making it easier to find related topics or connect relevant notes.

5. **Enhanced Features**  
   - Merging multiple notes into one (with optional archiving of originals).  
   - Tagging for organization.  
   - A planned UI/UX that highlights clean layout, real-time feedback (e.g., diff management, concurrency warnings), and a responsive design suitable for desktop or mobile.

Overall, **this project aims to demonstrate a proof-of-concept note application** that goes beyond simple text storage. It incorporates modern data-management practices (revision history, semantic search, relational linking) to give users **greater control** over their information and insights, especially when working with a large volume of interconnected notes.

### Hashs detail

Clarification regarding how note IDs are generated from a hash at creation—and how collisions can be handled:

1. **Hash ID Usage**  
   - **Creation Only**: When a user creates a **new** note, the system generates a hash from the note’s content (e.g., using an SHA-256 or similar algorithm) to serve as the note’s `id`.  
   - **No ID Change on Update**: After the note is created, **subsequent edits do not alter this hash ID**. Instead, updates are tracked via the revision system (`notes_revision`), preserving the note’s identity across its entire lifecycle.

2. **Proposed Collision Handling Method**  
   - **Verification Check**: When a new note’s content produces a hash that already exists, the system first compares the **entire content** of the existing note with the new one.  
     - **If the content is identical**, the system can treat this as the same note (or prompt the user with an option to merge).  
     - **If the content differs**, a collision exists.  
   - **Collision Resolution**: For genuine collisions (different content yielding the same hash), the system can:  
     1. **Append a Random Salt**: Before hashing, append a generated salt (e.g., UUID or timestamp-based seed). This ensures a different hash for truly different content.  
     2. **Fallback to UUID**: If a collision is detected, default to a random `uuid_generate_v4()` value for the `id`.  
     3. **Incremental Suffix**: Alternatively, store a small counter or numeric suffix appended to the content hash until a unique ID is found.

By following the above approach, the system guarantees that every **new** note has a stable, unique identifier, while updates to an existing note never change that identifier. 
This preserves the integrity of revision histories, links, and searches, even if rare collisions occur.

## Features

- **Markdown Support**: Create and edit notes with full Markdown formatting
- **Revision History**: Automatically track changes and revert to previous versions
- **Vector Similarity**: Find similar notes based on content using vector embeddings
- **Bidirectional Linking**: Create connections between notes with automatic backlinks
- **Tags**: Organize notes with tags for easy filtering
- **Merge Notes**: Combine multiple notes into a single note
- **Archive**: Soft delete notes by moving them to an archive

## Tech Stack

### Backend

- **FastAPI**: Modern, high-performance web framework for building APIs
- **PostgreSQL**: Relational database with pgvector extension for similarity search
- **SQLAlchemy**: ORM for database interactions
- **Sentence Transformers**: Generate vector embeddings for notes
- **Diff-Match-Patch**: Handle text differences for revision tracking

### Frontend

- **React**: Component-based UI library
- **Chakra UI**: Accessible and responsive component library
- **React Router**: Handle client-side routing
- **React SimpleMDE**: Markdown editor with live preview
- **Axios**: HTTP client for API requests

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 14+ (for local frontend development)
- Python 3.9+ (for local backend development)

### Running with Docker Compose

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/notesync.git
   cd notesync
   ```

2. Start the application with Docker Compose:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```
   uvicorn app.main:app --reload
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Project Structure

```
notesync/
├── backend/
│   ├── app/
│   │   ├── api/         # API routes and endpoints
│   │   ├── core/        # Core settings and config
│   │   ├── db/          # Database models and session
│   │   ├── services/    # Business logic services
│   │   └── main.py      # Application entry point
│   ├── migrations/      # Alembic migrations
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React context providers
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service functions
│   │   └── styles/      # Global styles and theme
│   └── package.json     # Node.js dependencies
└── docker-compose.yml   # Docker Compose configuration
```

## API Endpoints

### Notes

- `GET /api/v1/notes` - Get all notes
- `POST /api/v1/notes` - Create a new note
- `GET /api/v1/notes/{note_id}` - Get a specific note
- `PUT /api/v1/notes/{note_id}` - Update a note
- `POST /api/v1/notes/{note_id}/archive` - Archive a note
- `GET /api/v1/notes/tags/all` - Get all unique tags
- `GET /api/v1/notes/tag/{tag}` - Get notes by tag
- `POST /api/v1/notes/search` - Search notes by text or tags
- `GET /api/v1/notes/{note_id}/similar` - Get similar notes
- `POST /api/v1/notes/merge` - Merge multiple notes

### Revisions

- `GET /api/v1/notes/{note_id}/revisions` - Get all revisions for a note
- `GET /api/v1/notes/revision/{revision_id}` - Get a specific revision
- `GET /api/v1/notes/revision/{revision_id}/diff` - Get diff view for a revision
- `POST /api/v1/notes/revision/{revision_id}/revert` - Revert to a revision
- `GET /api/v1/notes/{note_id}/revision/{revision_number}/content` - Get note content at a revision

## License

This project is licensed under the MIT License - see the LICENSE file for details.