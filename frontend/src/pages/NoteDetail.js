// src/pages/NoteDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  Divider,
  Skeleton,
  SkeletonText,
  useToast,
  Tooltip,
  ScaleFade,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useBreakpointValue,
  Code,
} from '@chakra-ui/react';
import { ChevronRightIcon, EditIcon, ArrowBackIcon, DeleteIcon, StarIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { BiArchive, BiLinkExternal, BiShareAlt } from 'react-icons/bi';
import ReactMarkdown from 'react-markdown';
import { useNoteContext } from '../contexts/NoteContext';
import NoteCard from '../components/notes/NoteCard';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { note, loading, error, fetchNote } = useNoteContext();
  const [similarNotes, setSimilarNotes] = useState([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: true });
  
  // Visual styling
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const fetchSimilarNotes = useCallback(async () => {
    if (!note || !note.id) return;

    setIsLoadingSimilar(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/notes/${note.id}/similar`);
      if (!response.ok) throw new Error('Failed to fetch similar notes');
      
      const data = await response.json();
      setSimilarNotes(data || []);
    } catch (err) {
      console.error('Error fetching similar notes:', err);
      // Don't show a toast for this as it's not critical
    } finally {
      setIsLoadingSimilar(false);
    }
  }, [note]);

  useEffect(() => {
    // Load note data
    if (id) {
      fetchNote(id);
      onOpen(); // Trigger entry animation
    }
  }, [id, fetchNote, onOpen]);

  useEffect(() => {
    // Load similar notes when the current note loads
    if (note && note.id) {
      fetchSimilarNotes();
    }
  }, [note, fetchSimilarNotes]);

  const handleArchive = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/v1/notes/${id}/archive`, {
        method: 'PUT'
      });
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
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }
    
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/v1/notes/${id}`, {
        method: 'DELETE'
      });
      toast({
        title: 'Note deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (err) {
      toast({
        title: 'Error deleting note',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.lg">
          <VStack spacing={6} align="stretch">
            <HStack>
              <Skeleton height="40px" width="40px" />
              <Skeleton height="20px" width="200px" />
            </HStack>
            <Skeleton height="40px" width="70%" />
            <HStack>
              <Skeleton height="24px" width="80px" />
              <Skeleton height="24px" width="80px" />
              <Skeleton height="24px" width="80px" />
            </HStack>
            <Skeleton height="300px" width="100%" />
            <SkeletonText mt={4} noOfLines={10} spacing={4} />
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.lg">
          <VStack spacing={6} align="center" p={8}>
            <Text fontSize="xl" color="red.500">Error: {error}</Text>
            <Button colorScheme="brand" onClick={() => navigate('/')} leftIcon={<ArrowBackIcon />}>
              Back to Dashboard
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!note) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.lg">
          <VStack spacing={6} align="center" p={8}>
            <Text fontSize="xl" color={subtitleColor}>Note not found</Text>
            <Button colorScheme="brand" onClick={() => navigate('/')} leftIcon={<ArrowBackIcon />}>
              Back to Dashboard
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <ScaleFade in={isOpen} initialScale={0.95}>
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.lg">
          <VStack spacing={6} align="stretch">
            {/* Breadcrumb Navigation */}
            <Breadcrumb 
              spacing="8px" 
              separator={<ChevronRightIcon color="gray.500" />}
              fontSize="sm"
            >
              <BreadcrumbItem>
                <BreadcrumbLink as={RouterLink} to="/" color={subtitleColor}>
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color={subtitleColor} fontWeight="medium">
                  {note.title.length > 30 
                    ? `${note.title.substring(0, 30)}...` 
                    : note.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            {/* Note Header */}
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="lg" 
              boxShadow="sm"
              borderLeft="4px solid"
              borderLeftColor="brand.500"
            >
              <Flex 
                justifyContent="space-between" 
                alignItems="flex-start"
                direction={{ base: 'column', md: 'row' }}
                gap={4}
              >
                <VStack align="flex-start" spacing={3}>
                  <Heading 
                    as="h1" 
                    size="xl"
                    color={textColor}
                    wordBreak="break-word"
                  >
                    {note.title}
                  </Heading>
                  
                  <HStack spacing={4}>
                    <Text fontSize="sm" color={subtitleColor}>
                      Created: {new Date(note.created_at).toLocaleDateString()}
                    </Text>
                    {note.updated_at && (
                      <Text fontSize="sm" color={subtitleColor}>
                        Updated: {new Date(note.updated_at).toLocaleDateString()}
                      </Text>
                    )}
                  </HStack>

                  {note.tags && note.tags.length > 0 && (
                    <HStack spacing={2} wrap="wrap">
                      {note.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          colorScheme="brand"
                          variant="subtle"
                          px={2}
                          py={1}
                          borderRadius="full"
                          textTransform="lowercase"
                          fontSize="xs"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </HStack>
                  )}
                </VStack>

                <HStack spacing={2}>
                  <Tooltip label="Edit note">
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit note"
                      onClick={() => navigate(`/notes/${id}/edit`)}
                      colorScheme="brand"
                      variant="outline"
                      size={isMobile ? "sm" : "md"}
                      borderRadius="full"
                    />
                  </Tooltip>
                  
                  <Menu>
                    <Tooltip label="More options">
                      <MenuButton
                        as={IconButton}
                        icon={<ChevronDownIcon />}
                        variant="outline"
                        size={isMobile ? "sm" : "md"}
                        borderRadius="full"
                      />
                    </Tooltip>
                    <MenuList>
                      <MenuItem 
                        icon={<BiArchive />} 
                        onClick={handleArchive}
                      >
                        Archive Note
                      </MenuItem>
                      <MenuItem 
                        icon={<BiShareAlt />}
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: 'Link copied to clipboard',
                            status: 'success',
                            duration: 2000,
                          });
                        }}
                      >
                        Copy Link
                      </MenuItem>
                      <MenuItem 
                        icon={<DeleteIcon />} 
                        onClick={handleDelete}
                        color="red.500"
                      >
                        Delete Note
                      </MenuItem>
                    </MenuList>
                  </Menu>
                  
                  <Button
                    leftIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    variant="ghost"
                    size={isMobile ? "sm" : "md"}
                    borderRadius="full"
                  >
                    Back
                  </Button>
                </HStack>
              </Flex>
            </Box>

            {/* Note Content and Related Notes in Tabs */}
            <Tabs variant="soft-rounded" colorScheme="brand">
              <TabList>
                <Tab>Note Content</Tab>
                <Tab>Similar Notes {similarNotes.length > 0 && `(${similarNotes.length})`}</Tab>
              </TabList>
              
              <TabPanels>
                {/* Content Tab */}
                <TabPanel px={0}>
                  <Box 
                    bg={cardBg} 
                    p={6} 
                    borderRadius="lg" 
                    boxShadow="sm"
                    className="markdown-content"
                    overflow="hidden"
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        h1: props => <Heading as="h1" size="xl" my={4} {...props} />,
                        h2: props => <Heading as="h2" size="lg" my={4} {...props} />,
                        h3: props => <Heading as="h3" size="md" my={3} {...props} />,
                        h4: props => <Heading as="h4" size="sm" my={2} {...props} />,
                        p: props => <Text my={2} lineHeight="tall" {...props} />,
                        ul: props => <Box as="ul" pl={4} my={2} {...props} />,
                        ol: props => <Box as="ol" pl={4} my={2} {...props} />,
                        li: props => <Box as="li" pb={1} {...props} />,
                        blockquote: props => (
                          <Box
                            borderLeftWidth={4}
                            borderLeftColor="brand.300"
                            pl={4}
                            py={2}
                            my={4}
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            borderRadius="md"
                            {...props}
                          />
                        ),
                        code: ({node, inline, className, children, ...props}) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline ? (
                            <Box 
                              position="relative" 
                              bg="gray.900" 
                              borderRadius="md" 
                              my={3}
                              overflow="hidden"
                            >
                              <Flex 
                                bg="gray.800" 
                                px={4} 
                                py={2} 
                                color="gray.300"
                                fontSize="xs"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Text>{match && match[1] ? match[1] : "code"}</Text>
                                <Tooltip label="Copy to clipboard">
                                  <IconButton
                                    icon={<BiLinkExternal size="14px" />}
                                    aria-label="Copy code"
                                    size="xs"
                                    onClick={() => {
                                      navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                      toast({
                                        title: 'Code copied to clipboard',
                                        status: 'success',
                                        duration: 2000,
                                      });
                                    }}
                                    variant="ghost"
                                  />
                                </Tooltip>
                              </Flex>
                              <Box p={4} overflowX="auto">
                                <pre className={className} {...props}>
                                  {children}
                                </pre>
                              </Box>
                            </Box>
                          ) : (
                            <Code 
                              className={className} 
                              colorScheme="brand" 
                              fontSize="0.9em"
                              px={2}
                              py={0.5}
                              borderRadius="md"
                              {...props}
                            >
                              {children}
                            </Code>
                          );
                        },
                        table: props => (
                          <Box overflowX="auto" my={4}>
                            <Box 
                              as="table" 
                              width="full" 
                              borderWidth="1px" 
                              borderRadius="md" 
                              borderColor={borderColor}
                              {...props} 
                            />
                          </Box>
                        ),
                        th: props => (
                          <Box 
                            as="th" 
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            p={2} 
                            textAlign="left"
                            fontWeight="semibold"
                            borderBottomWidth="1px"
                            borderColor={borderColor}
                            {...props} 
                          />
                        ),
                        td: props => (
                          <Box 
                            as="td" 
                            p={2} 
                            borderBottomWidth="1px"
                            borderColor={borderColor}
                            {...props} 
                          />
                        ),
                        hr: props => <Divider my={4} {...props} />,
                        a: props => (
                          <RouterLink
                            color="brand.500"
                            textDecoration="underline"
                            textDecorationColor="brand.200"
                            _hover={{ color: 'brand.600' }}
                            {...props}
                          />
                        ),
                      }}
                    >
                      {note.content}
                    </ReactMarkdown>
                  </Box>
                </TabPanel>
                
                {/* Similar Notes Tab */}
                <TabPanel px={0}>
                  <Box 
                    bg={cardBg} 
                    p={6} 
                    borderRadius="lg" 
                    boxShadow="sm"
                  >
                    {isLoadingSimilar ? (
                      <VStack spacing={4} align="stretch">
                        {[1, 2, 3].map((i) => (
                          <Box key={i} p={4} borderWidth="1px" borderRadius="md">
                            <SkeletonText noOfLines={3} spacing="4" />
                          </Box>
                        ))}
                      </VStack>
                    ) : similarNotes.length === 0 ? (
                      <VStack py={8} textAlign="center">
                        <Text color={subtitleColor}>No similar notes found</Text>
                      </VStack>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {similarNotes.map((similarNote) => (
                          <NoteCard 
                            key={similarNote.id} 
                            note={similarNote} 
                            isListView={true}
                            showSimilarity={true}
                            similarity={similarNote.similarity}
                          />
                        ))}
                      </VStack>
                    )}
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Container>
      </Box>
    </ScaleFade>
  );
};

export default NoteDetail;