// src/pages/RevisionHistory.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { ChevronLeftIcon, RepeatIcon, TimeIcon } from '@chakra-ui/icons';
import { useNotes } from '../contexts/NoteContext';
import { getNoteRevisions, getRevisionDiff, revertToRevision } from '../services/revisionService';
import { getNote } from '../services/noteService';

const RevisionHistory = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [note, setNote] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [diffView, setDiffView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revertLoading, setRevertLoading] = useState(false);

  // Fetch the note and its revisions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get the note
        const noteData = await getNote(noteId);
        setNote(noteData);
        
        // Get revisions
        const revisionsData = await getNoteRevisions(noteId);
        setRevisions(revisionsData);
        
        setError(null);
      } catch (err) {
        setError('Error loading revisions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [noteId]);

  // Handle viewing a revision diff
  const handleViewDiff = async (revision) => {
    setSelectedRevision(revision);
    
    try {
      const diff = await getRevisionDiff(revision.revision_id);
      setDiffView(diff);
      onOpen();
    } catch (err) {
      toast({
        title: 'Error loading diff',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle reverting to a revision
  const handleRevert = async (revision) => {
    setRevertLoading(true);
    try {
      await revertToRevision(revision.revision_id);
      toast({
        title: 'Note reverted',
        description: `Successfully reverted to revision #${revision.revision_number}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate(`/notes/${noteId}`);
    } catch (err) {
      toast({
        title: 'Error reverting note',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRevertLoading(false);
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
      <Flex justify="space-between" align="center" mb={6}>
        <HStack>
          <IconButton
            icon={<ChevronLeftIcon />}
            onClick={() => navigate(`/notes/${noteId}`)}
            aria-label="Back to note"
          />
          <Heading as="h1" size="lg">
            Revision History
          </Heading>
        </HStack>
        <Text fontWeight="medium">{note.title}</Text>
      </Flex>

      {revisions.length === 0 ? (
        <Box p={8} textAlign="center" borderWidth={1} borderRadius="lg">
          <Text fontSize="lg" mb={4}>
            No revisions found for this note.
          </Text>
          <Text color="gray.500">
            Revisions are created automatically when you edit a note.
          </Text>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {revisions.map((revision) => (
            <Box
              key={revision.revision_id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              shadow="sm"
            >
              <Flex justify="space-between" align="center">
                <HStack>
                  <TimeIcon />
                  <Text fontWeight="bold">
                    Revision #{revision.revision_number}
                  </Text>
                  <Badge colorScheme="blue">
                    {formatDate(revision.created_at)}
                  </Badge>
                </HStack>
                <HStack>
                  <Button
                    size="sm"
                    onClick={() => handleViewDiff(revision)}
                    variant="outline"
                  >
                    View Changes
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<RepeatIcon />}
                    onClick={() => handleRevert(revision)}
                    isLoading={revertLoading}
                    loadingText="Reverting"
                  >
                    Revert to This Version
                  </Button>
                </HStack>
              </Flex>

              {revision.revision_name && (
                <Text fontWeight="medium" mt={2}>
                  {revision.revision_name}
                </Text>
              )}

              {revision.revision_note && (
                <Text color="gray.600" mt={1}>
                  {revision.revision_note}
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      )}

      {/* Diff View Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Revision #{selectedRevision?.revision_number || ''}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {diffView ? (
              <Box>
                <Accordion defaultIndex={[0]} allowToggle>
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          Unified Diff View
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Box
                        p={3}
                        borderWidth={1}
                        borderRadius="md"
                        fontFamily="monospace"
                        dangerouslySetInnerHTML={{ __html: diffView.unified_diff }}
                      />
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          Before / After
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                        <Box flex="1">
                          <Text fontWeight="bold" mb={2}>
                            Before
                          </Text>
                          <Box
                            p={3}
                            borderWidth={1}
                            borderRadius="md"
                            fontFamily="monospace"
                            whiteSpace="pre-wrap"
                            height="300px"
                            overflowY="auto"
                          >
                            {diffView.before}
                          </Box>
                        </Box>
                        <Box flex="1">
                          <Text fontWeight="bold" mb={2}>
                            After
                          </Text>
                          <Box
                            p={3}
                            borderWidth={1}
                            borderRadius="md"
                            fontFamily="monospace"
                            whiteSpace="pre-wrap"
                            height="300px"
                            overflowY="auto"
                          >
                            {diffView.after}
                          </Box>
                        </Box>
                      </Flex>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Box>
            ) : (
              <Flex justify="center" align="center" h="200px">
                <Spinner />
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                if (selectedRevision) {
                  handleRevert(selectedRevision);
                  onClose();
                }
              }}
              isLoading={revertLoading}
            >
              Revert to This Version
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default RevisionHistory;