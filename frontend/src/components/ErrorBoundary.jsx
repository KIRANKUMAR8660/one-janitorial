import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
          <Paper sx={{ p: 4, maxWidth: 520, textAlign: 'center' }}>
            <ErrorOutlineIcon sx={{ fontSize: 48, color: '#845EC2', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Something went wrong</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
            </Typography>
            <Button variant="contained" onClick={this.handleReset} sx={{ backgroundColor: '#845EC2' }}>
              Return to Dashboard
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
