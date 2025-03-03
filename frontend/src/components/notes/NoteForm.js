// src/components/notes/NoteForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { TagIcon, LinkIcon } from '@chakra-ui/icons';
import ReactMarkdown from 'react-markdown';
import SimpleMDEEditor from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

const NoteForm = ({ initialNote, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

  // Set initial values if editing
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.raw_content || '');
      setTags(initialNote.tags || []);
    }
  }, [initialNote]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      toast({
        title: 'Title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onSubmit({
      title,
      raw_content: content,
      tags,
    });
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Simple MDE options
  const editorOptions = {
    autofocus: true,
    spellChecker: true,
    lineNumbers: false,
    placeholder: 'Write your note content here...',
    status: ['lines', 'words'],
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide',
    ],
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <FormControl isRequired>
          <FormLabel htmlFor="title">Title</FormLabel>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            size="lg"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="tags">Tags</FormLabel>
          <HStack mb={2}>
            <Input
              id="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Add a tag..."
            />
            <Button onClick={handleAddTag}>Add</Button>
          </HStack>
          
          <Flex wrap="wrap" gap={2}>
            {tags.map((tag) => (
              <Tag key={tag} size="md" borderRadius="full" variant="solid" colorScheme="blue">
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveTag(tag)} />
              </Tag>
            ))}
          </Flex>
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="content">Content</FormLabel>
          <Tabs isFitted variant="enclosed" index={activeTab} onChange={setActiveTab}>
            <TabList mb="1em">
              <Tab>Edit</Tab>
              <Tab>Preview</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Box borderWidth={1} borderRadius="md">
                  <SimpleMDEEditor
                    value={content}
                    onChange={setContent}
                    options={editorOptions}
                  />
                </Box>
              </TabPanel>
              <TabPanel>
                <Box
                  p={4}
                  minH="300px"
                  borderWidth={1}
                  borderRadius="md"
                  className="markdown-preview"
                >
                  {content ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    <Text color="gray.500">No content to preview</Text>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </FormControl>

        <HStack spacing={4} justify="flex-end">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            loadingText="Saving"
          >
            Save Note
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default NoteForm;