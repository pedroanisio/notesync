// Integration test environment setup
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { NoteProvider } from '../src/contexts/NoteContext';
import { BrowserRouter } from 'react-router-dom';
import theme from '../src/styles/theme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

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