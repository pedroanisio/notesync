// Mock implementation for NoteForm component
import React from 'react';

const NoteForm = ({ initialValues, isEditMode, onSubmit }) => {
  return (
    <div className="note-form-mock" data-testid="note-form">
      <h2>{isEditMode ? 'Edit Note' : 'Create Note'}</h2>
      <div>
        <button onClick={() => onSubmit({
          title: initialValues?.title || 'Mock Title',
          content: initialValues?.content || 'Mock Content',
          tags: initialValues?.tags || ['mock', 'test']
        })}>
          {isEditMode ? 'Save' : 'Create'}
        </button>
      </div>
    </div>
  );
};

export default NoteForm; 