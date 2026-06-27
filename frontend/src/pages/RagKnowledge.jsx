import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, TextField, Divider, List, ListItem, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSopDocuments } from '../store/index.js';
import axios from 'axios';
import EnterpriseTable from '../components/EnterpriseTable.jsx';

const RagKnowledge = () => {
  const dispatch = useDispatch();
  const { sopDocuments } = useSelector(state => state.app);

  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('General');
  const [docContent, setDocContent] = useState('');

  // Search fields
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    dispatch(fetchSopDocuments());
  }, [dispatch]);

  const handleUpload = async () => {
    if (!docTitle || !docContent) return;
    try {
      await axios.post('/api/sop/upload', {
        title: docTitle,
        category: docCategory,
        content: docContent
      });
      setDocTitle('');
      setDocContent('');
      dispatch(fetchSopDocuments());
      alert('SOP document processed, chunked and vectorized successfully into local DB indexes.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing SOP');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await axios.post('/api/sop/query', { query: searchQuery });
      setSearchResults(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error searching vector DB');
    }
  };

  const sopColumns = [
    { 
      id: 'title', 
      label: 'Document Title', 
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#517891' }}>
          {row.title}
        </Typography>
      )
    },
    { 
      id: 'category', 
      label: 'Category', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['Sales', 'HR', 'BCO', 'Client Service', 'General']
    },
    { 
      id: 'format', 
      label: 'Format', 
      sortable: false,
      render: () => 'TXT (Plain Text)'
    },
    { 
      id: 'filePath', 
      label: 'Vector File ID', 
      sortable: true,
      render: (row) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#6B7280' }}>
          {row.filePath || 'sop_sample.txt'}
        </Typography>
      )
    }
  ];

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ borderBottom: '1px solid #E5E7EB', pb: 1.5, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#517891' }}>
          RAG KNOWLEDGE INDEX (SOPs & SCHEMES)
        </Typography>
        <Typography variant="caption" sx={{ color: '#6B7280' }}>
          Upload PDF/Word manuals, chunk sentences, configure embeddings, and test vector similarity lookups
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        {/* Left Side: Upload manual & search */}
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 1.5 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1 }}>
                SOP DOCUMENT UPLOADS
              </Typography>
              <EnterpriseTable
                data={sopDocuments}
                columns={sopColumns}
                searchPlaceholder="Search indexed SOPs..."
                exportFilename="sop_documents_export"
                rowKey="_id"
              />
            </CardContent>
          </Card>

          {/* RAG Query Simulator */}
          <Card sx={{ border: '1px solid #517891' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1 }}>
                RAG VECTOR SEARCH CONSOLE
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField 
                  fullWidth
                  size="small"
                  placeholder="Ask a staff question (e.g. cleaning procedures, sick leave limits)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="contained" onClick={handleSearch} sx={{ height: '36px' }}>
                  Retrieve Chunks
                </Button>
              </Box>

              <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891', mb: 1, display: 'block' }}>
                SIMILARITY CHUNKS RETRIEVED
              </Typography>
              <Box sx={{ minHeight: 150, border: '1px solid #E5E7EB', borderRadius: '4px', p: 1.5, bgcolor: '#F9FAFB' }}>
                {searchResults.length === 0 ? (
                  <Typography variant="caption" color="textSecondary">
                    Vector search results show here after querying.
                  </Typography>
                ) : (
                  <List dense sx={{ p: 0 }}>
                    {searchResults.map((chunk, idx) => (
                      <ListItem key={idx} sx={{ display: 'block', mb: 1.5, p: 0, borderBottom: '1px solid #E5E7EB', pb: 1, '&:last-child': { borderBottom: 0 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891' }}>
                            File: {chunk.documentTitle} ({chunk.category})
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
                            Score: {chunk.score}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '13px', color: '#4B5563' }}>
                          "...{chunk.text}..."
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Upload Form */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1.5 }}>
                INDEX NEW SOP TEXT DOCUMENT
              </Typography>
              <TextField
                label="Manual / SOP Title"
                fullWidth
                size="small"
                margin="dense"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
              />
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>Category</InputLabel>
                <Select 
                  value={docCategory} 
                  label="Category" 
                  onChange={(e) => setDocCategory(e.target.value)}
                  sx={{ height: '36px' }}
                >
                  {['Sales', 'HR', 'BCO', 'Client Service', 'General'].map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Raw Content Text"
                fullWidth
                size="small"
                margin="dense"
                multiline
                rows={8}
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Paste the full manual text here to simulate sentence chunk indexing..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '13px'
                  }
                }}
              />
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleUpload}
                sx={{ mt: 1.5, height: '36px' }}
              >
                Chunk & Save Embeddings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RagKnowledge;
