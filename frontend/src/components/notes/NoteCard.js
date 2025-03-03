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
  HStack,
  Spacer,
  useDisclosure,
  Collapse,
  Tooltip,
} from '@chakra-ui/react';
import { 
  SettingsIcon, 
  ViewIcon, 
  EditIcon, 
  DeleteIcon, 
  TimeIcon, 
  StarIcon,
  ChevronDownIcon
} from '@chakra-ui/icons';

const NoteCard = ({ note, onArchive }) => {
  const { isOpen, onToggle } = useDisclosure();
  
  // Modern color scheme
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const metaColor = useColorModeValue('gray.500', 'gray.400');
  
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
      borderColor={cardBorder}
      bg={cardBg}
      boxShadow="sm"
      transition="all 0.3s"
      position="relative"
      overflow="hidden"
      _hover={{ 
        transform: 'translateY(-4px)',
        boxShadow: 'md',
        borderColor: 'brand.300'
      }}
    >
      {/* Colored top accent bar */}
      <Box 
        h="4px" 
        bg="brand.500" 
        position="absolute" 
        top={0} 
        left={0} 
        right={0}
      />
      
      <Box p={5}>
        <Flex justify="space-between" align="flex-start" mb={2}>
          <Heading 
            as="h3" 
            size="md" 
            noOfLines={1}
            color={headingColor}
            fontWeight="700"
            transition="color 0.2s"
            _hover={{ color: 'brand.500' }}
          >
            <Link to={`/notes/${note.id}`}>{note.title}</Link>
          </Heading>
          
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<SettingsIcon />}
              variant="ghost"
              size="sm"
              aria-label="Note options"
              color={metaColor}
              _hover={{ color: 'brand.500', bg: cardHoverBg }}
            />
            <MenuList shadow="lg">
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
        
        <HStack spacing={2} mb={3} color={metaColor} fontSize="sm">
          <TimeIcon fontSize="xs" />
          <Text>{formatDate(note.updated_at)}</Text>
        </HStack>
        
        <Text 
          noOfLines={isOpen ? undefined : 3} 
          fontSize="md" 
          mb={3}
          color={textColor}
          lineHeight="tall"
        >
          {previewText}
        </Text>
        
        {note.raw_content.length > 150 && (
          <Text
            fontSize="sm"
            color="brand.500"
            cursor="pointer"
            onClick={onToggle}
            mb={3}
            fontWeight="medium"
            _hover={{ textDecoration: 'underline' }}
          >
            {isOpen ? 'Show less' : 'Show more'}
          </Text>
        )}
        
        <Flex wrap="wrap" mt={4} gap={2}>
          {note.tags && note.tags.map((tag) => (
            <Badge
              key={tag}
              colorScheme="brand"
              variant="subtle"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="medium"
              letterSpacing="0.4px"
              textTransform="lowercase"
            >
              #{tag}
            </Badge>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export default NoteCard;
