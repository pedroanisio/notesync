// src/pages/EditNote.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Container,
  useToast,
  Spinner,
  Flex,
  Text,
  Button,
} from '@chakra-ui/react';
import NoteForm from '../components/notes/NoteForm';
import { useNotes } from '../contexts/NoteContext';

const EditNote = () => {
  const { noteId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState(null);
  
  const { fetchNote, editNote } = useNotes();
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch the note
  useEffect(() => {
    const loadNote = async () => {
      setIsLoading(true);
      try {
        const noteData = await fetchNote(noteId);
        if (!noteData) {
          setError('Note not found');
        } else {
          setNote(noteData);
        }
      } catch (err) {
        setError('Error loading note');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNote();
  }, [noteId, fetchNote]);

  const handleSubmit = async (noteData) => {
    setIsSubmitting(true);
    try {
      const updatedNote = await editNote(noteId, noteData);
      toast({
        title: 'Note updated',
        description: 'Your note has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate(`/notes/${updatedNote.id}`);
    } catch (err) {
      toast({
        title: 'Error updating note',
        description: err.message || 'There was an error updating your note.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error || !note) {
    return (
      <Container maxW="container.lg" py={5}>
        <Box textAlign="center" p={5}>
          <Heading size="md" mb={4} color="red.500">
            {error || 'Note not found'}
          </Heading>
          <Button onClick={() => navigate('/')} colorScheme="blue">
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={5}>
      <Heading as="h1" mb={6}>
        Edit Note
      </Heading>
      <Box
        p={6}
        bg="white"
        shadow="md"
        borderRadius="lg"
      >
        <NoteForm
          initialValues={note}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditMode={true}
        />
      </Box>
    </Container>
  );
};

export default EditNote;