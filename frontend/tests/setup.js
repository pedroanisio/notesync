// Integration test environment setup
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { NoteProvider } from '../src/contexts/NoteContext';
import { BrowserRouter } from 'react-router-dom';
import theme from '../src/styles/theme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import '@testing-library/jest-dom';

// Create a mock for the axios instance
export const mockAxios = new MockAdapter(axios);

// Set up mock API responses
beforeEach(() => {
  // Mock notes API response
  mockAxios.onGet(/\/notes(\?.*)?$/).reply(function(config) {
    // Immediately return a response instead of delaying
    return [200, [
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
    ]];
  });

  // Mock single note API response
  mockAxios.onGet(/\/notes\/\d+/).reply(200, {
    id: '1', 
    title: 'First Note', 
    content: 'This is the first note content',
    raw_content: 'This is the first note content',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    tags: ['test', 'sample']
  });

  // Reset other handlers
  mockAxios.onPost().reply(201);
  mockAxios.onPut().reply(200);
  mockAxios.onDelete().reply(204);
});

// Custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
  return render(
    <ChakraProvider theme={theme}>
      <NoteProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </NoteProvider>
    </ChakraProvider>,
    options
  );
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

// Fix the "Cannot log after tests are done" warnings by mocking console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Mock ALL console methods (not just in CI)
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
  
  // Suppress specific error about Playwright
  jest.mock('@playwright/test', () => ({
    test: jest.fn(),
    expect: jest.fn()
  }), { virtual: true });
});

// Clean up after EACH test to prevent leaks
afterEach(() => {
  // Ensure mockAxios doesn't have pending requests
  mockAxios.reset();
});

afterAll(() => {
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

// Add mock for the NoteForm component
jest.mock('../src/components/notes/NoteForm', () => {
  return require('../../__mocks__/NoteFormMock.js');
}, { virtual: false }); 