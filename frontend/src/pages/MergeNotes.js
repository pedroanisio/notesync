// src/pages/MergeNotes.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Checkbox,
  Input,
  FormControl,
  FormLabel,
  Divider,
  Select,
  Textarea,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Spinner,
  Flex,
  Badge,
  Tag,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useNotes } from '../contexts/NoteContext';
import { mergeNotes, getNotes } from '../services/noteService';

const MergeNotes = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [availableNotes, setAvailableNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [separator, setSeparator] = useState('\n\n---\n\n');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [merging, setMerging] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  // Load available notes
  useEffect(() => {
    const fetchAvailableNotes = async () => {
      setLoading(true);
      try {
        const notesData = await getNotes();
        setAvailableNotes(notesData);
        setFilteredNotes(notesData);
        setError(null);
      } catch (err) {
        setError('Error loading notes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableNotes();
  }, []);

  // Filter notes when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotes(availableNotes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = availableNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
      setFilteredNotes(filtered);
    }
  }, [searchQuery, availableNotes]);

  // Generate preview content when selected notes change
  useEffect(() => {
    if (selectedNotes.length === 0) {
      setPreviewContent('');
      return;
    }
    
    const preview = selectedNotes
      .map((noteId) => {
        const note = availableNotes.find((n) => n.id === noteId);
        if (!note) return '';
        
        return `# ${note.title}\n\n${note.raw_content}`;
      })
      .join(separator);
    
    setPreviewContent(preview);
  }, [selectedNotes, separator, availableNotes]);

  const handleSelectNote = (noteId) => {
    if (selectedNotes.includes(noteId)) {
      setSelectedNotes(selectedNotes.filter((id) => id !== noteId));
    } else {
      setSelectedNotes([...selectedNotes, noteId]);
    }
  };

  const handleMerge = async () => {
    if (selectedNotes.length < 2) {
      toast({
        title: 'Select at least two notes',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!newTitle.trim()) {
      toast({
        title: 'Title is required',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setMerging(true);
    try {
      const merged = await mergeNotes(selectedNotes, newTitle, separator);
      toast({
        title: 'Notes merged successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate(`/notes/${merged.id}`);
    } catch (err) {
      toast({
        title: 'Error merging notes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setMerging(false);
    }
  };

  const handleOpenPreview = () => {
    if (selectedNotes.length > 0) {
      onOpen();
    } else {
      toast({
        title: 'Select at least one note',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
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
    <Container maxW="container.lg" py={5}>
      <Heading as="h1" mb={6}>
        Merge Notes
      </Heading>

      <Box p={6} borderWidth={1} borderRadius="lg" shadow="md" bg="white">
        <FormControl mb={4}>
          <FormLabel>New Note Title</FormLabel>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter title for the merged note"
          />
        </FormControl>

        <FormControl mb={6}>
          <FormLabel>Separator</FormLabel>
          <Select
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
          >
            <option value="\n\n---\n\n">Horizontal line (---)</option>
            <option value="\n\n\n\n">Double line break</option>
            <option value="\n\n#\n\n">Hash separator (#)</option>
            <option value="\n\n***\n\n">Asterisk separator (***)</option>
          </Select>
        </FormControl>

        <Divider my={6} />

        <Heading size="md" mb={4}>
          Select Notes to Merge
        </Heading>

        <HStack mb={4}>
          <Input
            placeholder="Search notes by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            flex="1"
          />
          <IconButton icon={<SearchIcon />} aria-label="Search notes" />
        </HStack>

        <Text mb={2}>
          {selectedNotes.length} of {availableNotes.length} notes selected
        </Text>

        {loading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" />
          </Flex>
        ) : error ? (
          <Box textAlign="center" p={5} color="red.500">
            {error}
          </Box>
        ) : filteredNotes.length === 0 ? (
          <Box textAlign="center" p={5}>
            No notes found matching your search.
          </Box>
        ) : (
          <VStack
            align="stretch"
            spacing={3}
            maxH="400px"
            overflowY="auto"
            borderWidth={1}
            borderRadius="md"
            p={2}
          >
            {filteredNotes.map((note) => (
              <Flex
                key={note.id}
                p={3}
                borderWidth={1}
                borderRadius="md"
                align="center"
                justify="space-between"
                bg={selectedNotes.includes(note.id) ? 'blue.50' : 'white'}
              >
                <HStack spacing={4} flex="1">
                  <Checkbox
                    isChecked={selectedNotes.includes(note.id)}
                    onChange={() => handleSelectNote(note.id)}
                    colorScheme="blue"
                    size="lg"
                  />
                  <Box>
                    <Text fontWeight="bold">{note.title}</Text>
                    <HStack mt={1}>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(note.updated_at)}
                      </Text>
                      {note.tags.slice(0, 3).map((tag) => (
                        <Tag key={tag} size="sm" colorScheme="blue">
                          {tag}
                        </Tag>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge colorScheme="gray">+{note.tags.length - 3}</Badge>
                      )}
                    </HStack>
                  </Box>
                </HStack>
              </Flex>
            ))}
          </VStack>
        )}

        <Divider my={6} />

        <HStack spacing={4} justify="flex-end">
          <Button
            variant="outline"
            onClick={handleOpenPreview}
            isDisabled={selectedNotes.length === 0}
          >
            Preview Merged Content
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleMerge}
            isLoading={merging}
            loadingText="Merging"
            isDisabled={selectedNotes.length < 2 || !newTitle.trim()}
          >
            Merge Selected Notes
          </Button>
        </HStack>
      </Box>

      {/* Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview Merged Content</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="md"
              whiteSpace="pre-wrap"
              fontFamily="monospace"
              overflowX="auto"
              maxHeight="500px"
              overflowY="auto"
            >
              {previewContent}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MergeNotes;