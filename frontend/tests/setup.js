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

// Suppress console errors/warnings during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}); 