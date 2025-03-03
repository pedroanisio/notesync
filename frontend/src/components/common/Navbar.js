// src/components/common/Navbar.js
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useDisclosure,
  Input,
  InputGroup,
  InputRightElement,
  Container,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  CloseIcon, 
  ChevronDownIcon, 
  ChevronRightIcon, 
  SearchIcon, 
  SunIcon, 
  MoonIcon,
  AddIcon,
} from '@chakra-ui/icons';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const navTextColor = useColorModeValue('gray.600', 'gray.200');
  const logoColor = useColorModeValue('brand.600', 'brand.400');

  return (
    <Box position="sticky" top={0} zIndex={10}>
      <Flex
        bg={bgColor}
        color={navTextColor}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={borderColor}
        align={'center'}
        boxShadow="sm"
      >
        <Container maxW="container.xl">
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}
          >
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
              }
              variant={'ghost'}
              aria-label={'Toggle Navigation'}
            />
          </Flex>
          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align="center">
            <Text
              as={RouterLink}
              to="/"
              textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
              fontFamily={'heading'}
              fontWeight={700}
              fontSize="xl"
              color={logoColor}
              letterSpacing="-0.4px"
              _hover={{
                textDecoration: 'none',
                color: 'brand.500',
              }}
            >
              NoteSync
            </Text>

            <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>

          <HStack spacing={3}>
            <form onSubmit={handleSearch} style={{ display: 'flex' }}>
              <InputGroup size="sm" w={{ base: '120px', md: '200px' }}>
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="full"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{
                    bg: useColorModeValue('white', 'gray.800'),
                    borderColor: 'brand.400',
                  }}
                />
                <InputRightElement>
                  <IconButton
                    type="submit"
                    aria-label="Search"
                    icon={<SearchIcon />}
                    size="xs"
                    variant="ghost"
                    colorScheme="brand"
                  />
                </InputRightElement>
              </InputGroup>
            </form>

            <Tooltip label="Toggle color mode">
              <IconButton
                size="sm"
                variant="ghost"
                onClick={toggleColorMode}
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                aria-label="Toggle color mode"
              />
            </Tooltip>
            
            <Tooltip label="Create new note">
              <Button
                as={RouterLink}
                to="/notes/create"
                colorScheme="brand"
                size="sm"
                leftIcon={<AddIcon />}
                borderRadius="full"
                fontWeight={500}
              >
                New Note
              </Button>
            </Tooltip>
          </HStack>
        </Container>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('brand.500', 'brand.400');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const popoverBorderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                p={2}
                href={navItem.href ?? '#'}
                as={RouterLink}
                to={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
                {navItem.children && (
                  <Icon
                    as={ChevronDownIcon}
                    transition={'all .25s ease-in-out'}
                    w={4}
                    h={4}
                    ml={1}
                    mt={-1}
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={1}
                borderStyle={'solid'}
                borderColor={popoverBorderColor}
                p={4}
                rounded={'md'}
                boxShadow={'lg'}
                bg={popoverContentBgColor}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  const hoverBg = useColorModeValue('brand.50', 'gray.700');

  return (
    <Link
      as={RouterLink}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: hoverBg }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'brand.500' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'} color="gray.500">{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'brand.500'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} as={RouterLink} to={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Archived Notes',
    href: '/archived',
  },
  {
    label: 'Advanced',
    children: [
      {
        label: 'Merge Notes',
        href: '/merge',
        subLabel: 'Combine multiple notes',
      },
    ],
  },
];

export default Navbar;