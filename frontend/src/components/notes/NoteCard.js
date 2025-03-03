import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  HStack,
  Badge,
  useColorModeValue,
  Link,
  Flex,
  Spacer,
  Icon,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { TimeIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

const NoteCard = ({ note, isListView = false, showSimilarity = false, similarity = null }) => {
  const { isOpen, onToggle } = useDisclosure();
  const [isHovered, setIsHovered] = useState(false);
  
  const noteContent = note.raw_content || note.content || '';
  const preview = noteContent.length > 150 ? `${noteContent.substring(0, 150)}...` : noteContent;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Styled components with useColorModeValue
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const headingHoverColor = useColorModeValue('brand.600', 'brand.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const accentColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <Box
      as={RouterLink}
      to={`/notes/${note.id}`}
      p={5}
      borderRadius="lg"
      boxShadow="sm"
      bg={cardBg}
      borderTop="4px solid"
      borderTopColor={accentColor}
      transition="all 0.3s"
      _hover={{
        boxShadow: "md",
        transform: "translateY(-2px)",
        bg: cardHoverBg
      }}
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      display="block"
      textDecoration="none"
      h={isListView ? "auto" : "100%"}
      maxW={isListView ? "100%" : "none"}
    >
      <HStack mb={2} spacing={2}>
        <Heading
          as="h3"
          size={isListView ? "md" : "lg"}
          noOfLines={2}
          mb={1}
          color={headingColor}
          transition="color 0.2s"
          _groupHover={{ color: headingHoverColor }}
          flex="1"
          wordBreak="break-word"
        >
          {note.title}
        </Heading>
        <Spacer />
      </HStack>

      <Flex align="center" mb={3}>
        <HStack color={textColor} fontSize="sm" spacing={3}>
          <HStack>
            <Icon as={TimeIcon} color={accentColor} />
            <Text>{formatDate(note.created_at)}</Text>
          </HStack>
          
          {showSimilarity && similarity !== null && (
            <Badge colorScheme="brand" fontSize="xs">
              {Math.round(similarity * 100)}% similar
            </Badge>
          )}
        </HStack>
      </Flex>

      <Text 
        color={textColor}
        noOfLines={isOpen ? undefined : 2}
        mb={2}
        fontSize={isListView ? "sm" : "md"}
      >
        {preview}
      </Text>
      
      {noteContent.length > 150 && (
        <Text
          color="brand.500"
          fontWeight="medium"
          fontSize="sm"
          cursor="pointer"
          onClick={(e) => {
            e.preventDefault();
            onToggle();
          }}
          display="inline-flex"
          alignItems="center"
        >
          {isOpen ? 'Show less' : 'Show more'} 
          <Icon as={isOpen ? ChevronUpIcon : ChevronDownIcon} ml={1} />
        </Text>
      )}

      {note.tags && note.tags.length > 0 && (
        <HStack mt={3} spacing={2} flexWrap="wrap">
          {note.tags.map((tag, index) => (
            <Badge
              key={index}
              colorScheme="brand"
              variant="subtle"
              textTransform="lowercase"
              fontSize="xs"
              py={0.5}
              px={2}
              borderRadius="full"
            >
              #{tag}
            </Badge>
          ))}
        </HStack>
      )}
    </Box>
  );
};

export default NoteCard;
