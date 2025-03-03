import { extendTheme } from '@chakra-ui/react';

// Modern color palette
const colors = {
  brand: {
    50: '#e6f7ff',
    100: '#b3e0ff',
    200: '#80c9ff',
    300: '#4db3ff',
    400: '#1a9cff',
    500: '#0080ff', // Primary brand color
    600: '#0066cc',
    700: '#004d99',
    800: '#003366',
    900: '#001a33',
  },
  accent: {
    50: '#fff8e6',
    100: '#ffeab3',
    200: '#ffdd80',
    300: '#ffcf4d',
    400: '#ffc21a',
    500: '#ffb400', // Accent color
    600: '#cc9000',
    700: '#996c00',
    800: '#664800',
    900: '#332400',
  },
  success: {
    500: '#38b2ac',
  },
  warning: {
    500: '#dd6b20',
  },
  error: {
    500: '#e53e3e',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Typography styles
const fonts = {
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  mono: '"Fira Code", SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 500,
      borderRadius: 'md',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'blue' ? 'brand.500' : `${props.colorScheme}.500`,
        color: 'white',
        _hover: {
          bg: props.colorScheme === 'blue' ? 'brand.600' : `${props.colorScheme}.600`,
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        },
        _active: {
          bg: props.colorScheme === 'blue' ? 'brand.700' : `${props.colorScheme}.700`,
          transform: 'translateY(0)',
        },
      }),
      outline: {
        borderWidth: '1px',
        transition: 'all 200ms ease',
        _hover: {
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        },
        _active: {
          transform: 'translateY(0)',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'md',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        _hover: {
          boxShadow: 'lg',
          transform: 'translateY(-4px)',
        },
      },
    },
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: 'md',
      },
    },
    variants: {
      outline: {
        field: {
          borderColor: 'gray.300',
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          },
        },
      },
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
  },
};

// Global styles
const styles = {
  global: {
    body: {
      bg: 'gray.50',
      color: 'gray.800',
    },
    a: {
      color: 'brand.500',
      _hover: {
        textDecoration: 'none',
        color: 'brand.600',
      },
    },
  },
};

// Custom config
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Breakpoints
const breakpoints = {
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
};

// Extension
const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  config,
  breakpoints,
});

export default theme;
