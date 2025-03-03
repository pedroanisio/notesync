// src/pages/CreateNote.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Container,
  useToast,
} from '@chakra-ui/react';
import NoteForm from '../components/notes/NoteForm';
import { useNotes } from '../contexts/NoteContext';

const CreateNote = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNote } = useNotes();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (noteData) => {
    setIsSubmitting(true);
    try {
      const newNote = await addNote(noteData);
      toast({
        title: 'Note created',
        description: 'Your note has been successfully created.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate(`/notes/${newNote.id}`);
    } catch (error) {
      toast({
        title: 'Error creating note',
        description: error.message || 'There was an error creating your note.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.lg" py={5}>
      <Heading as="h1" mb={6}>
        Create New Note
      </Heading>
      <Box
        p={6}
        bg="white"
        shadow="md"
        borderRadius="lg"
      >
        <NoteForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Box>
    </Container>
  );
};

export default CreateNote;