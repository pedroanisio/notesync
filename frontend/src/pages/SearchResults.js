// src/pages/SearchResults.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  Flex,
  Divider,
  useToast,
  Spinner,
  Grid,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { searchNotes } from '../services/noteService';
import NoteCard from '../components/notes/NoteCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const toast = useToast();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const searchData = await searchNotes({
          query: searchQuery,
          semantic: true,
          tags: [],
        });
        setResults(searchData);
        setError(null);
      } catch (err) {
        console.error('Error searching notes:', err);
        setError('Failed to load search results. Please try again.');
        toast({
          title: 'Search Error',
          description: 'Failed to retrieve search results',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, toast]);

  const handleArchiveNote = async (noteId) => {
    // This would typically call the archiveNote function from noteService
    toast({
      title: 'Note archived',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    // Remove the archived note from results
    setResults(results.filter(note => note.id !== noteId));
  };

  return (
    <Container maxW="container.lg" py={5}>
      <Flex align="center" mb={6}>
        <IconButton
          icon={<ChevronLeftIcon />}
          as={RouterLink}
          to="/"
          mr={3}
          aria-label="Back to dashboard"
          variant="ghost"
        />
        <Heading size="lg">Search Results</Heading>
      </Flex>

      <Box mb={6}>
        <Text fontSize="xl" fontWeight="medium">
          Results for: "{searchQuery}"
        </Text>
        <Text color="gray.500" mt={1}>
          {results.length} {results.length === 1 ? 'note' : 'notes'} found
        </Text>
      </Box>

      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Box textAlign="center" p={5} color="red.500">
          {error}
        </Box>
      ) : results.length === 0 ? (
        <Box
          textAlign="center"
          p={10}
          borderWidth={1}
          borderRadius="lg"
          bg={useColorModeValue('gray.50', 'gray.700')}
        >
          <Text fontSize="lg" mb={4}>No results found for "{searchQuery}"</Text>
          <Button as={RouterLink} to="/" colorScheme="blue">
            Back to Dashboard
          </Button>
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
          {results.map((note) => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onArchive={handleArchiveNote} 
            />
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SearchResults;
