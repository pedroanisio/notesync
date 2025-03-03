// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  SimpleGrid,
  Container,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Flex,
  Icon,
  InputGroup,
  Input,
  InputRightElement,
  Tag,
  TagLabel,
  useDisclosure,
  ScaleFade,
  Skeleton,
  SkeletonText,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
} from '@chakra-ui/react';
import { ChevronDownIcon, AddIcon, SearchIcon } from '@chakra-ui/icons';
import { BsGrid, BsList } from 'react-icons/bs';
import { useNoteContext } from '../contexts/NoteContext';
import NoteCard from '../components/notes/NoteCard';

const Dashboard = () => {
  const { notes, loading, fetchNotes } = useNoteContext();
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState('newest');
  const [filterTag, setFilterTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: true });

  useEffect(() => {
    fetchNotes();
    // Show animation on initial load
    onOpen();
  }, [fetchNotes]);

  useEffect(() => {
    if (notes) {
      let result = [...notes];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(note => 
          note.title.toLowerCase().includes(query) || 
          note.content.toLowerCase().includes(query)
        );
      }
      
      // Apply tag filter
      if (filterTag) {
        result = result.filter(note => 
          note.tags && note.tags.some(tag => tag.toLowerCase() === filterTag.toLowerCase())
        );
      }
      
      // Apply sorting
      switch (sortOption) {
        case 'newest':
          result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'oldest':
          result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case 'alphabetical':
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'updated':
          result.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
          break;
        default:
          break;
      }
      
      setFilteredNotes(result);
    }
  }, [notes, searchQuery, filterTag, sortOption]);

  // Get all unique tags across notes
  const allTags = React.useMemo(() => {
    if (!notes) return [];
    const tagSet = new Set();
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => tagSet.add(tag.toLowerCase()));
      }
    });
    return Array.from(tagSet);
  }, [notes]);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <Skeleton height="40px" width="200px" />
            <HStack>
              <Skeleton height="36px" width="120px" />
              <Skeleton height="36px" width="120px" />
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Box key={i} p={5} boxShadow="md" rounded="md" bg={cardBg}>
                  <SkeletonText mt="4" noOfLines={4} spacing="4" />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <ScaleFade in={isOpen} initialScale={0.9}>
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <Flex 
              justify="space-between" 
              align="center" 
              wrap={{ base: 'wrap', md: 'nowrap' }}
              gap={4}
            >
              <Heading 
                as="h1" 
                size="xl" 
                mb={{ base: 2, md: 0 }}
                bgGradient="linear(to-r, brand.400, brand.600)"
                bgClip="text"
                fontWeight="bold"
              >
                My Notes
              </Heading>
              
              <HStack spacing={3} ml="auto">
                <Button
                  as={RouterLink}
                  to="/notes/create"
                  colorScheme="brand"
                  leftIcon={<AddIcon />}
                  size="sm"
                  borderRadius="full"
                >
                  New Note
                </Button>
              </HStack>
            </Flex>

            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align={{ base: 'stretch', md: 'center' }}
              gap={4}
              py={2}
            >
              {/* Search Bar */}
              <InputGroup maxW={{ base: '100%', md: '320px' }}>
                <Input
                  placeholder="Search in notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={cardBg}
                  borderRadius="full"
                  size="sm"
                />
                <InputRightElement>
                  <Icon as={SearchIcon} color="gray.500" />
                </InputRightElement>
              </InputGroup>

              <HStack spacing={3}>
                {/* Tag Filter */}
                <Menu closeOnSelect={true}>
                  <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />}
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                  >
                    {filterTag ? `Tag: ${filterTag}` : 'Filter by Tag'}
                  </MenuButton>
                  <MenuList maxH="200px" overflowY="auto">
                    <MenuItem onClick={() => setFilterTag('')}>All Tags</MenuItem>
                    {allTags.map(tag => (
                      <MenuItem key={tag} onClick={() => setFilterTag(tag)}>
                        {tag}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Sort Options */}
                <Select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  size="sm"
                  width="auto"
                  borderRadius="full"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="updated">Recently Updated</option>
                </Select>

                {/* View Mode Toggle */}
                <HStack 
                  spacing={1} 
                  bg={useColorModeValue('gray.200', 'gray.700')} 
                  borderRadius="full" 
                  p={1}
                >
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    borderRadius="full"
                    colorScheme={viewMode === 'grid' ? 'brand' : undefined}
                    p={2}
                  >
                    <Icon as={BsGrid} />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'solid' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    borderRadius="full"
                    colorScheme={viewMode === 'list' ? 'brand' : undefined}
                    p={2}
                  >
                    <Icon as={BsList} />
                  </Button>
                </HStack>
              </HStack>
            </Flex>

            {filteredNotes.length === 0 ? (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                py={12}
                bg={cardBg}
                borderRadius="lg"
                boxShadow="sm"
              >
                <Text 
                  fontSize="xl" 
                  color="gray.500" 
                  fontWeight="medium"
                  mb={4}
                >
                  No notes found
                </Text>
                {filterTag || searchQuery ? (
                  <Button 
                    onClick={() => {
                      setFilterTag('');
                      setSearchQuery('');
                    }}
                    colorScheme="brand"
                    size="sm"
                    borderRadius="full"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    as={RouterLink}
                    to="/notes/create"
                    colorScheme="brand"
                    leftIcon={<AddIcon />}
                    size="sm"
                    borderRadius="full"
                  >
                    Create Your First Note
                  </Button>
                )}
              </Flex>
            ) : (
              viewMode === 'grid' ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredNotes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </SimpleGrid>
              ) : (
                <VStack spacing={4} align="stretch">
                  {filteredNotes.map((note) => (
                    <NoteCard key={note.id} note={note} isListView={true} />
                  ))}
                </VStack>
              )
            )}
          </VStack>
        </Container>
      </Box>
    </ScaleFade>
  );
};

export default Dashboard;