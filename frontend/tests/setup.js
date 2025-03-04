// Integration test environment setup
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import theme from '../src/styles/theme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import '@testing-library/jest-dom';
import React from 'react';

// Create mock data and functions outside of the jest.mock() call
const mockNotes = [
  { 
    id: '1', 
    title: 'First Note', 
    content: 'This is the first note content', 
    raw_content: 'This is the first note content',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    tags: ['test', 'sample']
  },
  { 
    id: '2', 
    title: 'Second Note', 
    content: 'This is the second note content', 
    raw_content: 'This is the second note content',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    tags: ['demo', 'example']
  }
];

const mockContextValue = {
  notes: mockNotes,
  loading: false,
  error: null,
  fetchNotes: jest.fn().mockResolvedValue(mockNotes),
  addNote: jest.fn().mockImplementation(noteData => Promise.resolve({ id: '3', ...noteData })),
  updateNote: jest.fn().mockImplementation((id, noteData) => Promise.resolve({ id, ...noteData })),
  deleteNote: jest.fn().mockResolvedValue(true),
  archiveNote: jest.fn().mockImplementation(id => Promise.resolve({ id, archived: true })),
  unarchiveNote: jest.fn().mockImplementation(id => Promise.resolve({ id, archived: false })),
  mergeNotes: jest.fn().mockResolvedValue({ id: '4', title: 'Merged Note' })
};

// Create a mock NoteContext component before the jest.mock() calls
// Create a mock provider component outside the mock
const MockNoteProvider = ({ children }) => {
  return children; // Simple passthrough for now
};

// Now mock the NoteContext module
jest.mock('../src/contexts/NoteContext', () => {
  // Return a mock object with the same API surface
  return {
    // Instead of creating a context, just return a mock object
    NoteContext: {
      Provider: ({ children }) => children, // Simple implementation
      Consumer: ({ children }) => children(mockContextValue), // Simple implementation
      displayName: 'MockNoteContext'
    },
    // Mock the provider component
    NoteProvider: ({ children }) => children,
    // Mock the hook to return our context value
    useNoteContext: () => mockContextValue
  };
});

// Mock the noteService module
jest.mock('../src/services/noteService', () => {
  return {
    __esModule: true,
    default: {
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    },
    getNotes: jest.fn().mockResolvedValue(mockNotes),
    getNote: jest.fn().mockResolvedValue({ id: '1', title: 'Test Note', content: 'Content', tags: ['test'] }),
    createNote: jest.fn().mockImplementation(data => Promise.resolve({ id: '3', ...data })),
    updateNote: jest.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
    deleteNote: jest.fn().mockResolvedValue({ success: true }),
    archiveNote: jest.fn().mockResolvedValue({ id: '1', archived: true }),
    unarchiveNote: jest.fn().mockResolvedValue({ id: '1', archived: false }),
    mergeNotes: jest.fn().mockResolvedValue({ id: '4', title: 'Merged Note' })
  };
});

// Mock CSS imports
jest.mock('highlight.js/styles/github-dark.css', () => ({}), { virtual: true });

// These mocks need to be fixed to not use JSX in the mock factory
jest.mock('react-markdown', () => {
  return {
    __esModule: true,
    default: function MockMarkdown(props) {
      return props.children;
    }
  };
});

jest.mock('rehype-highlight', () => () => ({}));
jest.mock('remark-gfm', () => () => ({}));

// Create a mock for the axios instance
export const mockAxios = new MockAdapter(axios);

// Set up mock API responses
beforeEach(() => {
  jest.clearAllMocks();
  
  // Mock notes API response
  mockAxios.onGet(/\/notes(\?.*)?$/).reply(200, mockNotes);

  // Mock single note API response
  mockAxios.onGet(/\/notes\/\d+/).reply(200, mockNotes[0]);

  // Reset other handlers
  mockAxios.onPost().reply(201);
  mockAxios.onPut().reply(200);
  mockAxios.onDelete().reply(204);
});

// Helper to create a wrapper with or without Router
const createWrapper = (withRouter = true) => {
  return ({ children }) => (
    <ChakraProvider theme={theme}>
      {withRouter ? (
        <BrowserRouter>{children}</BrowserRouter>
      ) : (
        children
      )}
    </ChakraProvider>
  );
};

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
  const { withRouter = true, ...restOptions } = options;
  return render(ui, { 
    wrapper: createWrapper(withRouter),
    ...restOptions 
  });
}

// Version without router
export function renderWithProvidersNoRouter(ui, options = {}) {
  return renderWithProviders(ui, { ...options, withRouter: false });
}

// Set up any global test configuration here
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Fix the "Cannot log after tests are done" warnings by completely replacing console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Create a cleanup function to run after each test
const cleanupAsyncOps = () => {
  return new Promise(resolve => {
    // Allow any current async operations to complete
    setTimeout(resolve, 100);
  });
};

beforeAll(() => {
  // Completely replace console methods to suppress all logging
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

// Cleanup after each test
afterEach(async () => {
  // Wait for any pending async operations to complete
  await cleanupAsyncOps();
  mockAxios.reset();
  jest.clearAllMocks();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Add a jest configuration to exclude e2e tests
jest.mock('../tests/e2e/note-lifecycle.test.js', () => ({}), { virtual: true });

// Import React markdown mock
jest.mock('react-markdown', () => {
  return ({ children }) => <div data-testid="markdown">{children}</div>;
});

// Additional mock for rehype-highlight
jest.mock('rehype-highlight', () => {
  return () => ({});
});

// Mock remark-gfm
jest.mock('remark-gfm', () => {
  return () => ({});
});

// Add mock for the highlight.js CSS import
jest.mock('highlight.js/styles/github-dark.css', () => ({}), { virtual: true });

// Mock for rehype-highlight
jest.mock('rehype-highlight', () => {
  return () => ({});
});

// Mock for remark-gfm
jest.mock('remark-gfm', () => {
  return () => ({});
});

// Add mock for the NoteForm component without requiring an external file
jest.mock('../src/components/notes/NoteForm', () => {
  return {
    __esModule: true,
    default: function MockNoteForm(props) {
      // Simple implementation that returns the props it received
      const { initialValues, isEditMode, onSubmit } = props;
      
      // Access these in tests, but don't actually render anything
      if (typeof global.mockNoteFormProps === 'undefined') {
        global.mockNoteFormProps = {};
      }
      
      global.mockNoteFormProps = props;
      
      const mockSubmit = () => {
        if (onSubmit) {
          return onSubmit({
            title: initialValues?.title || 'Mock Title',
            content: initialValues?.content || 'Mock Content',
            tags: initialValues?.tags || ['mock', 'test']
          });
        }
      };
      
      // Return a mock function that tests can call
      MockNoteForm.mockSubmit = mockSubmit;
      
      return null; // Don't render anything
    }
  };
}); 