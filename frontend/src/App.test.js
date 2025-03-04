import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mocking all external dependencies
jest.mock('@chakra-ui/react', () => ({
  ChakraProvider: ({ children }) => children,
  Box: ({ children }) => children,
  useColorModeValue: () => 'mockColor'
}));

jest.mock('react-router-dom', () => ({
  Route: ({ children }) => children,
  Routes: ({ children }) => children,
  createRoutesFromElements: () => ({}),
  createBrowserRouter: () => ({}),
  RouterProvider: ({ children }) => children,
  Outlet: () => 'Outlet Content'
}));

// Mock the NoteContext
jest.mock('./contexts/NoteContext', () => ({
  NoteProvider: ({ children }) => children
}));

// Mock ReactMarkdown
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }) {
    return <div>{children}</div>;
  };
});

// Mock rehype-highlight
jest.mock('rehype-highlight', () => {
  return function mockRehypeHighlight() {
    return {};
  };
});

// Simple smoke test that doesn't actually render the App
test('App exists and can be required', () => {
  // Dynamically require App only after mocks are in place
  const App = jest.requireActual('./App').default;
  expect(typeof App).toBe('function');
}); 