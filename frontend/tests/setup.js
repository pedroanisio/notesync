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
  mockAxios.onGet(/\/notes(\?.*)?$/).reply(200, [
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
  ]);

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
  console.error = jest.fn();
  console.warn = jest.fn();
  // Only filter logs in CI environment
  if (process.env.CI) {
    console.log = jest.fn();
  }
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
}); 