import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setSuccess(res.data.message || 'Recovery email sent. Check logs if SMTP is offline.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request recovery. Confirm email exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F3F4F6', p: 2 }}>
      <Card sx={{ width: 420, border: '1px solid #E5E7EB', borderRadius: '4px', backgroundColor: '#FFFFFF', boxShadow: 'none' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo placeholder */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box component="img" src="/logo.jpeg" alt="Logo" sx={{ height: 60, borderRadius: '4px', border: '1px solid #E5E7EB' }} />
          </Box>
          
          <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 700, color: '#517891', fontSize: '20px' }}>
            PASSWORD RECOVERY
          </Typography>
          <Typography variant="caption" display="block" align="center" sx={{ mb: 3, color: '#4B5563' }}>
            Enter your company email to receive a secure reset link
          </Typography>

          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '4px' }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '4px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Company Email Address"
              variant="outlined"
              fullWidth
              size="small"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '36px'
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, height: '36px', borderRadius: '4px' }}
            >
              {loading ? 'Sending Request...' : 'Send Recovery Email'}
            </Button>
          </form>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              size="small" 
              variant="text" 
              onClick={() => navigate('/login')}
              sx={{ fontSize: '0.80rem', color: '#57B9FF', fontWeight: 700 }}
            >
              ← Back to Sign In
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
