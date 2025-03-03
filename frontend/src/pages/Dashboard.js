// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Grid,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Text,
  useColorModeValue,
  useToast,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import NoteCard from '../components/notes/NoteCard';
import { useNotes } from '../contexts/NoteContext';
import { getAllTags } from '../services/noteService';

const Dashboard = () => {
  const { notes, loading, error, fetchNotes, archiveNoteById } = useNotes();
  const [allTags, setAllTags] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [sortOption, setSortOption] = useState('updated');
  const toast = useToast();

  // Load all tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTags();
        setAllTags(tags);
      } catch (err) {
        toast({
          title: 'Error loading tags',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    loadTags();
  }, [toast]);

  // Handle archiving a note
  const handleArchive = async (noteId) => {
    try {
      await archiveNoteById(noteId);
      toast({
        title: 'Note archived',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error archiving note',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Filter and sort notes
  useEffect(() => {
    if (!notes) return;

    let filtered = [...notes];

    // Filter by tag if active
    if (activeTag) {
      filtered = filtered.filter((note) => note.tags.includes(activeTag));
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.raw_content.toLowerCase().includes(searchLower)
      );
    }

    // Sort notes
    if (sortOption === 'updated') {
      filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } else if (sortOption === 'created') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortOption === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredNotes(filtered);
  }, [notes, activeTag, searchText, sortOption]);

  return (
    <Box>
      <Flex direction="column" maxW="1200px" mx="auto">
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
        >
          <Heading as="h1" size="xl">
            All Notes
          </Heading>

          <HStack spacing={4}>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
                {activeTag ? `Tag: ${activeTag}` : 'Filter by Tag'}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setActiveTag(null)}>All Tags</MenuItem>
                {allTags.map((tag) => (
                  <MenuItem key={tag} onClick={() => setActiveTag(tag)}>
                    {tag}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Select
              size="sm"
              w={{ base: 'full', md: '150px' }}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Title (A-Z)</option>
            </Select>
          </HStack>
        </Flex>

        <InputGroup mb={6}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Filter notes..."
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
            <Text fontSize="lg">No notes found. Create your first note!</Text>
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
              <NoteCard key={note.id} note={note} onArchive={handleArchive} />
            ))}
          </Grid>
        )}
      </Flex>
    </Box>
  );
};

export default Dashboard;