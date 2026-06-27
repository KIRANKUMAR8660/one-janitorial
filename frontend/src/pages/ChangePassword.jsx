import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, LinearProgress } from '@mui/material';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password rules validation logic
  const rules = {
    length: newPassword.length >= 12,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  };

  const score = Object.values(rules).filter(Boolean).length;
  const isPasswordStrong = score === 5;

  const getStrengthLabel = () => {
    switch (score) {
      case 0: return { label: 'Empty', color: '#9CA3AF' };
      case 1:
      case 2: return { label: 'Weak', color: '#EF4444' };
      case 3: return { label: 'Fair', color: '#F59E0B' };
      case 4: return { label: 'Good', color: '#57B9FF' };
      case 5: return { label: 'Strong & Secured', color: '#10B981' };
      default: return { label: 'Empty', color: '#9CA3AF' };
    }
  };

  const { label: strengthLabel, color: strengthColor } = getStrengthLabel();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordStrong) {
      setError('New password must satisfy all strength guidelines.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    // Retrieve active token from storage to pass auth
    const token = localStorage.getItem('accessToken');

    try {
      const res = await axios.post(
        '/api/auth/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data.message || 'Password changed successfully. Other active sessions terminated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Validate current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 1 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #E5E7EB', pb: 1.5, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#517891' }}>
          USER SECURITY PROFILE
        </Typography>
        <Typography variant="caption" sx={{ color: '#6B7280' }}>
          Update account credentials, monitor password health, and terminate remote device sessions
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1.5 }}>
            CHANGE ACCOUNT PASSWORD
          </Typography>

          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '4px' }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '4px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Current Password"
              type="password"
              variant="outlined"
              fullWidth
              size="small"
              margin="dense"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={loading}
            />
            <TextField
              label="New Secure Password"
              type="password"
              variant="outlined"
              fullWidth
              size="small"
              margin="dense"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            
            {/* Strength Meter */}
            {newPassword && (
              <Box sx={{ mt: 1, mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#4B5563' }}>
                    Password Strength:
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: strengthColor }}>
                    {strengthLabel}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(score / 5) * 100} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 2, 
                    bgcolor: '#E5E7EB',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: strengthColor
                    }
                  }} 
                />
              </Box>
            )}

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
            />

            {/* Checklist Guidelines */}
            <Box sx={{ mt: 2, mb: 2, p: 1.5, border: '1px solid #E5E7EB', borderRadius: '4px', bgcolor: '#F9FAFB' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891', display: 'block', mb: 0.5 }}>
                PASSWORD REQUIREMENTS:
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: rules.length ? '#10B981' : '#4B5563', fontWeight: rules.length ? 700 : 500 }}>
                • {rules.length ? '✓' : '✗'} Minimum 12 characters length (Currently: {newPassword.length})
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: rules.upper ? '#10B981' : '#4B5563', fontWeight: rules.upper ? 700 : 500 }}>
                • {rules.upper ? '✓' : '✗'} At least one uppercase letter (A-Z)
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: rules.lower ? '#10B981' : '#4B5563', fontWeight: rules.lower ? 700 : 500 }}>
                • {rules.lower ? '✓' : '✗'} At least one lowercase letter (a-z)
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: rules.number ? '#10B981' : '#4B5563', fontWeight: rules.number ? 700 : 500 }}>
                • {rules.number ? '✓' : '✗'} At least one digit (0-9)
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: rules.special ? '#10B981' : '#4B5563', fontWeight: rules.special ? 700 : 500 }}>
                • {rules.special ? '✓' : '✗'} At least one special symbol character (!@#$%^&*)
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || !isPasswordStrong}
              sx={{ height: '36px' }}
            >
              {loading ? 'Changing Password...' : 'Save & Terminate Other Active Devices'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChangePassword;
