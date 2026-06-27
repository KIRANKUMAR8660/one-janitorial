import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password rules checks
  const rules = {
    length: newPassword.length >= 12,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  };

  const isPasswordStrong = Object.values(rules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordStrong) {
      setError('Please satisfy all password security requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await axios.post('/api/auth/reset-password', {
        token,
        newPassword
      });
      setSuccess(res.data.message || 'Password updated successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F3F4F6', py: 4, px: 2 }}>
      <Card sx={{ width: 460, border: '1px solid #E5E7EB', borderRadius: '4px', backgroundColor: '#FFFFFF', boxShadow: 'none' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box component="img" src="/logo.jpeg" alt="Logo" sx={{ height: 60, borderRadius: '4px', border: '1px solid #E5E7EB' }} />
          </Box>
          
          <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 700, color: '#517891', fontSize: '20px' }}>
            CREATE NEW PASSWORD
          </Typography>
          <Typography variant="caption" display="block" align="center" sx={{ mb: 3, color: '#4B5563' }}>
            Set a secure passcode for your One Janitorial staff account
          </Typography>

          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '4px' }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '4px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="New Password"
              type="password"
              variant="outlined"
              fullWidth
              size="small"
              margin="dense"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { height: '36px' } }}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              variant="outlined"
              fullWidth
              size="small"
              margin="dense"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { height: '36px' } }}
            />

            {/* Password strength requirement logs list */}
            <Box sx={{ mt: 2.5, mb: 1.5, p: 1.5, border: '1px solid #E5E7EB', borderRadius: '4px', bgcolor: '#F9FAFB' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891', display: 'block', mb: 1 }}>
                PASSWORD REQUIREMENTS:
              </Typography>
              <List dense sx={{ p: 0 }}>
                {[
                  { key: 'length', text: 'Minimum 12 characters' },
                  { key: 'upper', text: 'At least one uppercase letter (A-Z)' },
                  { key: 'lower', text: 'At least one lowercase letter (a-z)' },
                  { key: 'number', text: 'At least one number (0-9)' },
                  { key: 'special', text: 'At least one special character (!@#$%^&*)' }
                ].map((item) => {
                  const met = rules[item.key];
                  return (
                    <ListItem key={item.key} sx={{ p: 0, mb: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24, color: met ? '#10B981' : '#9CA3AF' }}>
                        {met ? <CheckBoxIcon sx={{ fontSize: '16px' }} /> : <CheckBoxOutlineBlankIcon sx={{ fontSize: '16px' }} />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                          variant: 'caption', 
                          sx: { fontWeight: met ? 600 : 500, color: met ? '#10B981' : '#4B5563' } 
                        }} 
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || !isPasswordStrong}
              sx={{ mt: 1.5, height: '36px', borderRadius: '4px' }}
            >
              {loading ? 'Updating Password...' : 'Save & Invalidate Active Sessions'}
            </Button>
          </form>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button 
              size="small" 
              variant="text" 
              onClick={() => navigate('/login')}
              sx={{ fontSize: '0.80rem', color: '#57B9FF', fontWeight: 700 }}
            >
              Back to Sign In
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
