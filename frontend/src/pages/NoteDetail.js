// src/pages/NoteDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Flex,
  Stack,
  Tag,
  Button,
  IconButton,
  Tooltip,
  useToast,
  Spinner,
  Divider,
  HStack,
  VStack,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, TimeIcon, LinkIcon } from '@chakra-ui/icons';
import { useNotes } from '../contexts/NoteContext';
import { getNote, getSimilarNotes } from '../services/noteService';
import ReactMarkdown from 'react-markdown';

const NoteDetail = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { archiveNoteById } = useNotes();
  
  const [note, setNote] = useState(null);
  const [similarNotes, setSimilarNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNoteData = async () => {
      setLoading(true);
      try {
        const noteData = await getNote(noteId);
        setNote(noteData);
        
        // Get similar notes
        const similar = await getSimilarNotes(noteId);
        setSimilarNotes(similar);
        
        setError(null);
      } catch (err) {
        setError('Error loading note. It may have been deleted or you may not have permission to view it.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNoteData();
  }, [noteId]);

  const handleArchive = async () => {
    try {
      await archiveNoteById(noteId);
      toast({
        title: 'Note archived',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (err) {
      toast({
        title: 'Error archiving note',
        status: 'error',
        description: 'There was an error archiving this note.',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error || !note) {
    return (
      <Box textAlign="center" p={5} color="red.500">
        <Heading size="md" mb={4}>
          {error || 'Note not found'}
        </Heading>
        <Button as={RouterLink} to="/" colorScheme="blue">
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto">
      <Box mb={6}>
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 4, md: 0 }}
        >
          <Heading as="h1" size="xl" mb={{ base: 2, md: 0 }}>
            {note.title}
          </Heading>
          
          <HStack spacing={2}>
            <Tooltip label="Edit Note">
              <IconButton
                as={RouterLink}
                to={`/notes/${note.id}/edit`}
                aria-label="Edit note"
                icon={<EditIcon />}
                colorScheme="blue"
              />
            </Tooltip>
            
            <Tooltip label="View Revision History">
              <IconButton
                as={RouterLink}
                to={`/notes/${note.id}/revisions`}
                aria-label="View revisions"
                icon={<TimeIcon />}
                variant="outline"
              />
            </Tooltip>
            
            <Tooltip label="Archive Note">
              <IconButton
                aria-label="Archive note"
                icon={<DeleteIcon />}
                colorScheme="red"
                onClick={handleArchive}
              />
            </Tooltip>
          </HStack>
        </Flex>
        
        <HStack mt={3} color="gray.500" fontSize="sm">
          <Text>Created: {formatDate(note.created_at)}</Text>
          <Text>•</Text>
          <Text>Updated: {formatDate(note.updated_at)}</Text>
        </HStack>
        
        <Stack direction="row" mt={4} spacing={2} flexWrap="wrap">
          {note.tags.map((tag) => (
            <Tag key={tag} colorScheme="blue" size="md">
              {tag}
            </Tag>
          ))}
        </Stack>
      </Box>
      
      <Divider mb={6} />
      
      <Box
        p={6}
        bg={useColorModeValue('white', 'gray.800')}
        shadow="md"
        borderRadius="lg"
        className="markdown-content"
      >
        <ReactMarkdown>{note.raw_content}</ReactMarkdown>
      </Box>
      
      {(note.links_to.length > 0 || note.links_from.length > 0) && (
        <Box mt={8}>
          <Heading size="md" mb={4}>
            Linked Notes
          </Heading>
          
          <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
            {note.links_to.length > 0 && (
              <Box flex="1">
                <Heading size="sm" mb={2}>
                  <HStack>
                    <LinkIcon />
                    <Text>Outgoing Links</Text>
                  </HStack>
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {note.links_to.map((linkId) => (
                    <Button
                      key={linkId}
                      as={RouterLink}
                      to={`/notes/${linkId}`}
                      variant="outline"
                      justifyContent="flex-start"
                      leftIcon={<LinkIcon />}
                      size="sm"
                    >
                      {linkId}
                    </Button>
                  ))}
                </VStack>
              </Box>
            )}
            
            {note.links_from.length > 0 && (
              <Box flex="1">
                <Heading size="sm" mb={2}>
                  <HStack>
                    <LinkIcon />
                    <Text>Incoming Links</Text>
                  </HStack>
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {note.links_from.map((linkId) => (
                    <Button
                      key={linkId}
                      as={RouterLink}
                      to={`/notes/${linkId}`}
                      variant="outline"
                      justifyContent="flex-start"
                      leftIcon={<LinkIcon />}
                      size="sm"
                    >
                      {linkId}
                    </Button>
                  ))}
                </VStack>
              </Box>
            )}
          </Flex>
        </Box>
      )}
      
      {similarNotes.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={4}>
            Similar Notes
          </Heading>
          
          <VStack align="stretch" spacing={3}>
            {similarNotes.map((item) => (
              <Flex
                key={item.note.id}
                p={3}
                borderWidth={1}
                borderRadius="md"
                align="center"
                justify="space-between"
                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              >
                <Box>
                  <Heading size="sm" as={RouterLink} to={`/notes/${item.note.id}`}>
                    {item.note.title}
                  </Heading>
                  <HStack mt={1}>
                    <Badge colorScheme="blue">
                      {Math.round(item.similarity_score * 100)}% similar
                    </Badge>
                    {item.note.tags.slice(0, 3).map((tag) => (
                      <Tag key={tag} size="sm">
                        {tag}
                      </Tag>
                    ))}
                  </HStack>
                </Box>
                <Button
                  as={RouterLink}
                  to={`/notes/${item.note.id}`}
                  size="sm"
                  variant="ghost"
                >
                  View
                </Button>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default NoteDetail;