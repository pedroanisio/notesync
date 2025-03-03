// src/App.js
import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

function App() {
  return (
    <ChakraProvider theme={theme}>
      <NoteProvider>
        <Router>
          <Box minH="100vh">
            <Navbar />
            <Box as="main" p={4}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/notes/create" element={<CreateNote />} />
                <Route path="/notes/:noteId" element={<NoteDetail />} />
                <Route path="/notes/:noteId/edit" element={<EditNote />} />
                <Route path="/notes/:noteId/revisions" element={<RevisionHistory />} />
                <Route path="/archived" element={<ArchiveView />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/merge" element={<MergeNotes />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </NoteProvider>
    </ChakraProvider>
  );
}

export default App;