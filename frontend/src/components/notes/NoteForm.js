// src/components/notes/NoteForm.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  useToast,
  FormErrorMessage,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Text,
  Flex,
  Heading,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tooltip,
  ScaleFade,
  useDisclosure,
  Badge,
} from '@chakra-ui/react';
import { AddIcon, CheckIcon, CloseIcon, ViewIcon } from '@chakra-ui/icons';
import { useNoteContext } from '../../contexts/NoteContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const NoteForm = ({ initialValues, isEditMode = false }) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [content, setContent] = useState(initialValues?.content || '');
  const [tags, setTags] = useState(initialValues?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNote, editNote } = useNoteContext();
  const navigate = useNavigate();
  const toast = useToast();
  const tagInputRef = useRef(null);
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: true });

  // Visual styling
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tagBg = useColorModeValue('brand.50', 'brand.900');
  const tagColor = useColorModeValue('brand.800', 'brand.100');
  
  useEffect(() => {
    // Animation effect
    onOpen();
  }, [onOpen]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await editNote(initialValues.id, { title, content, tags });
        toast({
          title: 'Note updated',
          description: 'Your note has been successfully updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const newNote = await addNote({ title, content, tags });
        toast({
          title: 'Note created',
          description: 'Your note has been successfully created',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate(`/notes/${newNote.id}`);
        return; // Early return to prevent the navigate below
      }
      
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save note. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
    // Focus back on the tag input
    tagInputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentTag) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <ScaleFade in={isOpen} initialScale={0.95}>
      <Box bg={bgColor} minH="100vh" py={8}>
        <Box maxW="container.lg" mx="auto">
          <VStack spacing={8} align="stretch">
            <Flex 
              justifyContent="space-between" 
              alignItems="center"
              direction={{ base: 'column', md: 'row' }}
              gap={4}
            >
              <Heading 
                as="h1" 
                size="xl" 
                bgGradient="linear(to-r, brand.400, brand.600)"
                bgClip="text"
              >
                {isEditMode ? 'Edit Note' : 'Create New Note'}
              </Heading>
              
              <HStack>
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline"
                  borderRadius="full"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="brand"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  leftIcon={<CheckIcon />}
                  borderRadius="full"
                >
                  {isEditMode ? 'Update' : 'Save'}
                </Button>
              </HStack>
            </Flex>

            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="lg" 
              boxShadow="sm"
              as="form" 
              onSubmit={handleSubmit}
            >
              <VStack spacing={6} align="stretch">
                <FormControl isInvalid={errors.title}>
                  <FormLabel fontWeight="medium">Title</FormLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title"
                    size="lg"
                    bg={inputBg}
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{ borderColor: 'brand.300' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                    borderRadius="md"
                  />
                  <FormErrorMessage>{errors.title}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">Tags</FormLabel>
                  <HStack spacing={2} wrap="wrap" mb={2}>
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        py={1}
                        px={2}
                        borderRadius="full"
                        variant="subtle"
                        colorScheme="brand"
                        textTransform="lowercase"
                      >
                        <TagLabel>#{tag}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                      </Badge>
                    ))}
                  </HStack>
                  <InputGroup size="md">
                    <Input
                      ref={tagInputRef}
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add a tag and press Enter"
                      bg={inputBg}
                      border="1px solid"
                      borderColor={borderColor}
                      _hover={{ borderColor: 'brand.300' }}
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                      borderRadius="md"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="Add tag"
                        icon={<AddIcon />}
                        size="sm"
                        onClick={handleAddTag}
                        variant="ghost"
                        colorScheme="brand"
                        isDisabled={!currentTag.trim()}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Divider />

                <Tabs variant="soft-rounded" colorScheme="brand">
                  <TabList>
                    <Tab>Edit</Tab>
                    <Tab>Preview</Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel px={0}>
                      <FormControl isInvalid={errors.content}>
                        <FormLabel fontWeight="medium">Content</FormLabel>
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Write your note content in Markdown..."
                          size="md"
                          minH="300px"
                          bg={inputBg}
                          border="1px solid"
                          borderColor={borderColor}
                          _hover={{ borderColor: 'brand.300' }}
                          _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                          borderRadius="md"
                          fontFamily="mono"
                        />
                        <FormErrorMessage>{errors.content}</FormErrorMessage>
                      </FormControl>
                    </TabPanel>
                    
                    <TabPanel px={0}>
                      <FormLabel fontWeight="medium">Preview</FormLabel>
                      <Box
                        borderWidth="1px"
                        borderRadius="md"
                        p={4}
                        minH="300px"
                        borderColor={borderColor}
                        className="markdown-content"
                        overflow="auto"
                      >
                        {content ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {content}
                          </ReactMarkdown>
                        ) : (
                          <Text color="gray.500" fontStyle="italic">
                            Your preview will appear here...
                          </Text>
                        )}
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>

                <Flex justify="flex-end">
                  <HStack>
                    <Button 
                      onClick={() => navigate('/')} 
                      variant="outline"
                      borderRadius="full"
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="brand"
                      onClick={handleSubmit}
                      isLoading={isSubmitting}
                      leftIcon={<CheckIcon />}
                      borderRadius="full"
                    >
                      {isEditMode ? 'Update' : 'Save'}
                    </Button>
                  </HStack>
                </Flex>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Box>
    </ScaleFade>
  );
};

export default NoteForm;