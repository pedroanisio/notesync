import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Flex,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { SettingsIcon, ViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';

const NoteCard = ({ note, onArchive }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate preview text (first 150 chars)
  const previewText = note.raw_content.length > 150
    ? `${note.raw_content.substring(0, 150)}...`
    : note.raw_content;

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={cardBg}
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
    >
      <Box p={4}>
        <Flex justify="space-between" align="flex-start" mb={2}>
          <Heading as="h3" size="md" noOfLines={1}>
            <Link to={`/notes/${note.id}`}>{note.title}</Link>
          </Heading>
          
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<SettingsIcon />}
              variant="ghost"
              size="sm"
              aria-label="Note options"
            />
            <MenuList>
              <MenuItem
                icon={<ViewIcon />}
                as={Link}
                to={`/notes/${note.id}`}
              >
                View
              </MenuItem>
              <MenuItem
                icon={<EditIcon />}
                as={Link}
                to={`/notes/${note.id}/edit`}
              >
                Edit
              </MenuItem>
              <MenuItem
                icon={<DeleteIcon />}
                onClick={() => onArchive(note.id)}
                color="red.500"
              >
                Archive
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        
        <Text fontSize="sm" color="gray.500" mb={2}>
          Updated {formatDate(note.updated_at)}
        </Text>
        
        <Text noOfLines={3} fontSize="md" mb={3}>
          {previewText}
        </Text>
        
        <Flex wrap="wrap" mt={2}>
          {note.tags && note.tags.map((tag) => (
            <Badge
              key={tag}
              mr={2}
              mb={2}
              colorScheme="teal"
              variant="subtle"
              px={2}
              py={1}
              borderRadius="full"
            >
              {tag}
            </Badge>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export default NoteCard;
