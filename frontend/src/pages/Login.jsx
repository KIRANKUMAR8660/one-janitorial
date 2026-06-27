import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../store/index.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin'); // default registry selection
  const [isRegister, setIsRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [mfaSecretText, setMfaSecretText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      try {
        await axios.post('/api/auth/register', { email, password, role });
        setRegisterSuccess('Registration successful! Please login with your credentials.');
        setIsRegister(false);
      } catch (err) {
        setRegisterSuccess('');
        alert(err.response?.data?.message || 'Registration failed');
      }
    } else {
      const result = await dispatch(loginThunk({ email, password, deviceInfo: navigator.userAgent }));
      if (!result.error) {
        navigate('/');
      }
    }
  };

  // Pre-seed credentials quick click for developer/user evaluation
  const handleQuickSeed = (selectedRole) => {
    const formattedEmail = `${selectedRole.toLowerCase().replace(/\s+/g, '')}@onejanitorial.com`;
    setEmail(formattedEmail);
    setPassword('Password123');
    setRole(selectedRole);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F3F4F6', padding: 2 }}>
      <Card sx={{ width: 420, border: '1px solid #E5E7EB', borderRadius: '4px', backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box component="img" src="/logo.jpeg" alt="Logo" sx={{ height: 60, borderRadius: '4px', border: '1px solid #E5E7EB' }} />
          </Box>
          
          <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 600, color: '#517891', fontSize: '20px' }}>
            {isRegister ? 'CREATE STAFF ACCOUNT' : 'INTERNAL STAFF SIGN IN'}
          </Typography>
          <Typography variant="caption" display="block" align="center" sx={{ mb: 3, color: '#4B5563' }}>
            One Janitorial Operations Control
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '4px' }}>{error}</Alert>}
          {registerSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: '4px' }}>{registerSuccess}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Staff Email"
              variant="outlined"
              fullWidth
              size="small"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              size="small"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {isRegister && (
              <FormControl fullWidth size="small" margin="normal">
                <InputLabel>System Role</InputLabel>
                <Select
                  value={role}
                  label="System Role"
                  onChange={(e) => setRole(e.target.value)}
                >
                  {['Super Admin', 'Admin', 'Manager', 'Team Lead', 'Sales', 'BCO', 'Client Service', 'HR', 'Employee'].map(r => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, height: '36px', borderRadius: '4px' }}
              disabled={loading}
            >
              {isRegister ? 'Register' : 'Login'}
            </Button>
          </form>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button size="small" onClick={() => setIsRegister(!isRegister)} sx={{ fontSize: '0.8rem', color: '#57B9FF' }}>
              {isRegister ? 'Already have account? Sign In' : 'Register Account'}
            </Button>
            {!isRegister && (
              <Button size="small" onClick={() => navigate('/forgot-password')} sx={{ fontSize: '0.8rem', color: '#57B9FF', fontWeight: 700 }}>
                Forgot Password?
              </Button>
            )}
          </Box>

          {/* Quick-Click Accounts Seeder */}
          {!isRegister && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E5E7EB' }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block', color: '#4B5563' }}>
                QUICK SIGN-IN SEEDS (MOCK ACCOUNTS):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Super Admin', 'Admin', 'Sales', 'BCO', 'Client Service', 'HR'].map(r => (
                  <Button 
                    key={r} 
                    variant="outlined" 
                    size="small" 
                    sx={{ py: 0.5, px: 1.5, fontSize: '0.7rem', borderRadius: '4px', color: '#517891', borderColor: '#E5E7EB' }} 
                    onClick={() => handleQuickSeed(r)}
                  >
                    {r}
                  </Button>
                ))}
              </Box>
            </Box>
          )}

        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
