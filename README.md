# NoteSync - Markdown Notes with Version History

A modern note-taking application with Markdown support, revision history, and vector similarity search.

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