// src/App.js
import React, { useEffect } from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { 
  Route, 
  Routes,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom';
import { NoteProvider } from './contexts/NoteContext';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import NoteDetail from './pages/NoteDetail';
import CreateNote from './pages/CreateNote';
import EditNote from './pages/EditNote';
import RevisionHistory from './pages/RevisionHistory';
import ArchiveView from './pages/ArchiveView';
import SearchResults from './pages/SearchResults';
import MergeNotes from './pages/MergeNotes';
import theme from './styles/theme';

// API URL from environment or fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://10.10.10.187:8000/api/v1';

// Layout component that includes the Navbar and main content area
const AppLayout = () => {
  return (
    <Box minH="100vh">
      <Navbar />
      <Box as="main" p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};

// Create a router with future flags enabled
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/notes/create" element={<CreateNote />} />
      <Route path="/notes/:noteId" element={<NoteDetail />} />
      <Route path="/notes/:noteId/edit" element={<EditNote />} />
      <Route path="/notes/:noteId/revisions" element={<RevisionHistory />} />
      <Route path="/archived" element={<ArchiveView />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/merge" element={<MergeNotes />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  console.log('🔍 App component rendering');

  useEffect(() => {
    console.log('🔍 App component mounted');
    
    // Log environment info
    console.log('🔍 Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      PUBLIC_URL: process.env.PUBLIC_URL,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      API_URL: API_URL
    });

    // Log error handler
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('🔴 Global error caught:', { message, source, lineno, colno, error });
      return false;
    };

    // Check API connection
    const checkApi = async () => {
      console.log('🔍 Checking API connection to:', API_URL);
      try {
        const response = await fetch(`${API_URL}/health-check`);
        
        // Check if response is ok before parsing JSON
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API connection successful:', data);
      } catch (error) {
        console.error('🔴 API connection failed:', error.message);
        console.warn('⚠️ Make sure the backend API is running at:', API_URL);
        // Don't show an error UI here - the app can still work with stale data or retry later
      }
    };

    checkApi();

    return () => {
      console.log('🔍 App component unmounting');
      window.onerror = null;
    };
  }, []);

  try {
    console.log('🔍 Rendering App layout');
    return (
      <ChakraProvider theme={theme}>
        <NoteProvider>
          <RouterProvider router={router} />
        </NoteProvider>
      </ChakraProvider>
    );
  } catch (error) {
    console.error('🔴 Error rendering App:', error);
    return (
      <ChakraProvider theme={theme}>
        <Box p={5} textAlign="center">
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
        </Box>
      </ChakraProvider>
    );
  }
}

export default App;