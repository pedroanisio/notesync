# Backend Test Cases

This document outlines all test cases that need to be implemented to verify the backend functionality against the requirements specified in REQUIREMENTS.md.

## Note Management Tests

### TC-NOTE-001: Create Note
**Covers Requirements**: REQ-FUNC-001, REQ-TECH-010, REQ-TECH-020
- **Description**: Verify that a note can be created successfully
- **Preconditions**: Database is accessible
- **Test Steps**:
  1. Send POST request to `/api/v1/notes` with valid title and content
  2. Verify response status code is 200
  3. Verify response contains the created note with correct data
  4. Verify note ID is generated using the specified hashing algorithm
- **Expected Results**: Note is created successfully and stored in the database with a hash-based ID

### TC-NOTE-002: Create Note with Identical Content
**Covers Requirements**: REQ-TECH-011
- **Description**: Verify that creating a note with identical content returns the existing note
- **Preconditions**: A note already exists in the database
- **Test Steps**:
  1. Send POST request to `/api/v1/notes` with the same title and content as an existing note
  2. Verify response status code is 200
  3. Verify response contains the existing note's ID
- **Expected Results**: Existing note is returned without creating a duplicate

### TC-NOTE-003: Create Note with Hash Collision
**Covers Requirements**: REQ-TECH-011, REQ-TECH-012
- **Description**: Verify that hash collisions are properly handled
- **Preconditions**: Test environment configured to simulate a hash collision
- **Test Steps**:
  1. Create a mock that forces a hash collision scenario
  2. Send POST request to `/api/v1/notes` with content that would generate the same hash
  3. Verify response status code is 200
  4. Verify the note is created with a modified ID using one of the collision resolution strategies
- **Expected Results**: Note is created with a unique ID despite the hash collision

### TC-NOTE-004: Edit Note
**Covers Requirements**: REQ-FUNC-002
- **Description**: Verify that an existing note can be edited
- **Preconditions**: A note exists in the database
- **Test Steps**:
  1. Send PUT request to `/api/v1/notes/{note_id}` with updated content
  2. Verify response status code is 200
  3. Verify response contains the updated note data
  4. Verify note ID remains unchanged
- **Expected Results**: Note is updated successfully while preserving its original ID

### TC-NOTE-005: Delete (Archive) Note
**Covers Requirements**: REQ-FUNC-003
- **Description**: Verify that a note can be archived (soft-deleted)
- **Preconditions**: A note exists in the database
- **Test Steps**:
  1. Send POST request to `/api/v1/notes/{note_id}/archive`
  2. Verify response status code is 200
  3. Verify the note's archived flag is set to true
  4. Verify the note doesn't appear in normal note listings
- **Expected Results**: Note is archived successfully and excluded from default note listings

### TC-NOTE-006: List Notes
**Covers Requirements**: REQ-FUNC-004
- **Description**: Verify that all non-archived notes can be retrieved
- **Preconditions**: Multiple notes exist in the database (some archived, some not)
- **Test Steps**:
  1. Send GET request to `/api/v1/notes`
  2. Verify response status code is 200
  3. Verify only non-archived notes are returned
- **Expected Results**: All non-archived notes are retrieved successfully

### TC-NOTE-007: List Notes Including Archived
**Covers Requirements**: REQ-FUNC-004
- **Description**: Verify that all notes including archived ones can be retrieved
- **Preconditions**: Multiple notes exist in the database (some archived, some not)
- **Test Steps**:
  1. Send GET request to `/api/v1/notes?include_archived=true`
  2. Verify response status code is 200
  3. Verify all notes including archived ones are returned
- **Expected Results**: All notes are retrieved successfully

## Note Linking Tests

### TC-LINK-001: Automatic Link Detection
**Covers Requirements**: REQ-FUNC-010
- **Description**: Verify that links are automatically detected in note content
- **Preconditions**: Multiple notes exist in the database
- **Test Steps**:
  1. Create a note with content containing links using `[[note-id]]` syntax
  2. Verify the links_to array contains the referenced note IDs
- **Expected Results**: Links are correctly detected and stored in the links_to array

### TC-LINK-002: Bidirectional Link Maintenance
**Covers Requirements**: REQ-FUNC-011
- **Description**: Verify that bidirectional links are maintained
- **Preconditions**: Multiple notes exist in the database
- **Test Steps**:
  1. Create a note with content containing links to other notes
  2. Verify the linked notes' links_from arrays contain the new note's ID
- **Expected Results**: Bidirectional links are correctly maintained

### TC-LINK-003: Link Update on Content Change
**Covers Requirements**: REQ-FUNC-010, REQ-FUNC-013
- **Description**: Verify that links are updated when note content changes
- **Preconditions**: A note exists with links to other notes
- **Test Steps**:
  1. Update a note to add, remove, or change links
  2. Verify the links_to array is updated accordingly
  3. Verify the links_from arrays of affected notes are updated accordingly
- **Expected Results**: Links are correctly updated in both directions

## Tagging Tests

### TC-TAG-001: Add Tags to Note
**Covers Requirements**: REQ-FUNC-020
- **Description**: Verify that tags can be added to a note
- **Preconditions**: A note exists in the database
- **Test Steps**:
  1. Update a note with new tags
  2. Verify the tags are correctly stored in the database
- **Expected Results**: Tags are correctly assigned to the note

### TC-TAG-002: Find Notes by Tag
**Covers Requirements**: REQ-FUNC-021
- **Description**: Verify that notes can be filtered by tag
- **Preconditions**: Multiple notes exist with different tags
- **Test Steps**:
  1. Send GET request to `/api/v1/notes/tag/{tag}`
  2. Verify only notes with the specified tag are returned
- **Expected Results**: Correct subset of notes is returned based on the tag

### TC-TAG-003: List All Tags
**Covers Requirements**: REQ-FUNC-022
- **Description**: Verify that all unique tags can be retrieved
- **Preconditions**: Multiple notes exist with various tags
- **Test Steps**:
  1. Send GET request to `/api/v1/notes/tags/all`
  2. Verify all unique tags are returned without duplicates
- **Expected Results**: Complete list of unique tags is returned

## Search Tests

### TC-SEARCH-001: Full-Text Search
**Covers Requirements**: REQ-FUNC-030
- **Description**: Verify that notes can be found using text search
- **Preconditions**: Multiple notes exist with different content
- **Test Steps**:
  1. Send POST request to `/api/v1/notes/search` with text query
  2. Verify notes containing the query text are returned
- **Expected Results**: Relevant notes are returned based on text content

### TC-SEARCH-002: Semantic Search
**Covers Requirements**: REQ-FUNC-031, REQ-TECH-022
- **Description**: Verify that semantic search works using vector embeddings
- **Preconditions**: Multiple notes exist with vector embeddings
- **Test Steps**:
  1. Send POST request to `/api/v1/notes/search` with semantic=true
  2. Verify semantically related notes are returned
  3. Verify results include similarity scores
- **Expected Results**: Semantically relevant notes are returned with similarity scores

### TC-SEARCH-003: Similar Notes
**Covers Requirements**: REQ-FUNC-031
- **Description**: Verify that similar notes can be found for a given note
- **Preconditions**: Multiple notes exist with varying degrees of similarity
- **Test Steps**:
  1. Send GET request to `/api/v1/notes/{note_id}/similar`
  2. Verify similar notes are returned with similarity scores
- **Expected Results**: Notes similar to the target note are returned with scores

## Revision History Tests

### TC-REVISION-001: Revision Creation on Update
**Covers Requirements**: REQ-FUNC-002
- **Description**: Verify that revisions are created when notes are updated
- **Preconditions**: A note exists in the database
- **Test Steps**:
  1. Update a note multiple times
  2. Verify a new revision is created for each update
  3. Verify revision contains the correct diff information
- **Expected Results**: Revisions are correctly created and stored

### TC-REVISION-002: List Revisions
**Covers Requirements**: REQ-FUNC-002
- **Description**: Verify that all revisions for a note can be retrieved
- **Preconditions**: A note exists with multiple revisions
- **Test Steps**:
  1. Send GET request to `/api/v1/notes/{note_id}/revisions`
  2. Verify all revisions are returned in reverse chronological order
- **Expected Results**: Complete revision history is returned

### TC-REVISION-003: Revert to Revision
**Covers Requirements**: REQ-FUNC-002
- **Description**: Verify that a note can be reverted to a previous revision
- **Preconditions**: A note exists with multiple revisions
- **Test Steps**:
  1. Send POST request to `/api/v1/notes/revision/{revision_id}/revert`
  2. Verify the note's content is reverted to the specified revision
  3. Verify a new revision is created for the revert operation
- **Expected Results**: Note is reverted successfully and a new revision is created

### TC-REVISION-004: Get Note at Specific Revision
**Covers Requirements**: REQ-FUNC-002
- **Description**: Verify that a note's content at a specific revision can be retrieved
- **Preconditions**: A note exists with multiple revisions
- **Test Steps**:
  1. Send GET request to `/api/v1/notes/{note_id}/revision/{revision_number}/content`
  2. Verify the correct content for that revision is returned
- **Expected Results**: Note content at the specified revision is returned

## Merge Notes Tests

### TC-MERGE-001: Merge Multiple Notes
**Covers Requirements**: REQ-FUNC-001, REQ-TECH-010
- **Description**: Verify that multiple notes can be merged into a new note
- **Preconditions**: Multiple notes exist in the database
- **Test Steps**:
  1. Send POST request to `/api/v1/notes/merge` with note IDs and new title
  2. Verify response status code is 200
  3. Verify new note contains combined content of source notes
  4. Verify new note has combined tags from source notes
- **Expected Results**: Notes are successfully merged into a new note

## Technical Implementation Tests

### TC-TECH-001: Markdown Processing
**Covers Requirements**: REQ-TECH-020, REQ-TECH-021
- **Description**: Verify that Markdown is correctly processed to HTML
- **Preconditions**: None
- **Test Steps**:
  1. Create a note with various Markdown formatting
  2. Verify the processed content field contains correct HTML
- **Expected Results**: Markdown is correctly converted to HTML

### TC-TECH-002: Vector Embedding Generation
**Covers Requirements**: REQ-TECH-022
- **Description**: Verify that vector embeddings are generated for notes
- **Preconditions**: None
- **Test Steps**:
  1. Create a note with content
  2. Verify a vector embedding is generated and stored
  3. Verify the embedding has the correct dimensionality
- **Expected Results**: Vector embedding is correctly generated

### TC-TECH-003: API Response Format
**Covers Requirements**: REQ-TECH-030, REQ-TECH-031
- **Description**: Verify that API responses follow correct format
- **Preconditions**: None
- **Test Steps**:
  1. Make requests to various endpoints
  2. Verify responses follow consistent JSON format
  3. Verify responses include appropriate metadata
- **Expected Results**: API responses are consistently formatted

### TC-TECH-004: Error Handling
**Covers Requirements**: REQ-TECH-032, REQ-NFUNC-022
- **Description**: Verify that API errors are correctly handled
- **Preconditions**: None
- **Test Steps**:
  1. Send invalid requests to various endpoints
  2. Verify appropriate status codes are returned
  3. Verify error messages are descriptive
- **Expected Results**: Errors are handled gracefully with appropriate status codes and messages

## Performance Tests (AFTER POC)

### TC-PERF-001: Response Time
**Covers Requirements**: REQ-NFUNC-001
- **Description**: Verify that API endpoints respond within acceptable time
- **Preconditions**: Multiple notes exist in the database
- **Test Steps**:
  1. Measure response time for typical API calls
  2. Verify all responses complete within 500ms
- **Expected Results**: API responses are consistently fast

### TC-PERF-002: Concurrent Access
**Covers Requirements**: REQ-NFUNC-002
- **Description**: Verify that the API can handle concurrent requests
- **Preconditions**: Database is accessible
- **Test Steps**:
  1. Simulate multiple concurrent requests to various endpoints
  2. Verify all requests are processed correctly
  3. Verify no race conditions or locking issues occur
- **Expected Results**: API handles concurrent access correctly

## Security Tests

### TC-SEC-001: Input Validation
**Covers Requirements**: REQ-NFUNC-012
- **Description**: Verify that user input is properly validated
- **Preconditions**: None
- **Test Steps**:
  1. Send requests with malicious or invalid input
  2. Verify input is properly sanitized or rejected
  3. Verify no injection attacks are possible
- **Expected Results**: All input is properly validated and sanitized 