// src/pages/ArchiveView.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Grid,
  Button,
  Text,
  Flex,
  useColorModeValue,
  useToast,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useNotes } from '../contexts/NoteContext';
import { getNotes, updateNote } from '../services/noteService';

const ArchiveView = () => {
  const toast = useToast();
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  // Load archived notes
  useEffect(() => {
    const fetchArchivedNotes = async () => {
      setLoading(true);
      try {
        const notes = await getNotes(true); // Include archived notes
        const archived = notes.filter(note => note.archived);
        setArchivedNotes(archived);
        setFilteredNotes(archived);
        setError(null);
      } catch (err) {
        setError('Error loading archived notes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedNotes();
  }, []);

  // Filter notes when search text changes
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredNotes(archivedNotes);
    } else {
      const query = searchText.toLowerCase();
      const filtered = archivedNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.raw_content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
      setFilteredNotes(filtered);
    }
  }, [searchText, archivedNotes]);

  // Restore a note (unarchive)
  const handleRestore = async (noteId) => {
    setRestoringId(noteId);
    try {
      await updateNote(noteId, { archived: false });
      setArchivedNotes(archivedNotes.filter(note => note.id !== noteId));
      
      toast({
        title: 'Note restored',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error restoring note',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRestoringId(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box maxW="1200px" mx="auto">
      <Heading as="h1" size="xl" mb={6}>
        Archived Notes
      </Heading>

      <InputGroup mb={6}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search archived notes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </InputGroup>

      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Box textAlign="center" p={5} color="red.500">
          {error}
        </Box>
      ) : filteredNotes.length === 0 ? (
        <Box
          textAlign="center"
          p={10}
          borderWidth={1}
          borderRadius="lg"
          bg={useColorModeValue('gray.50', 'gray.700')}
        >
          <Text fontSize="lg">No archived notes found.</Text>
        </Box>
      ) : (
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
        >
          {filteredNotes.map((note) => (
            <Box
              key={note.id}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              bg={useColorModeValue('white', 'gray.800')}
              opacity={0.8}
            >
              <Heading fontSize="xl" mb={2} isTruncated>
                {note.title}
              </Heading>
              
              <Text fontSize="sm" color="gray.500" mb={2}>
                Archived: {formatDate(note.updated_at)}
              </Text>
              
              <Text noOfLines={3} mb={4}>
                {note.raw_content
                  ? note.raw_content.replace(/[#*`]/g, '').substring(0, 100) +
                    (note.raw_content.length > 100 ? '...' : '')
                  : ''}
              </Text>
              
              <Flex mt={4} justify="flex-end">
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => handleRestore(note.id)}
                  isLoading={restoringId === note.id}
                  loadingText="Restoring"
                >
                  Restore
                </Button>
              </Flex>
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ArchiveView;