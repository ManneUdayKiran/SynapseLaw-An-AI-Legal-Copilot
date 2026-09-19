import { useState } from 'react';
import { AddCircle, AutoAwesome, Balance, CompareArrows, Dashboard, Gavel, HelpOutline, Shield, Tune, AccountCircle, Close } from '@mui/icons-material';
import { AppBar, Box, Button, Chip, Container, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, Alert, IconButton } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { apiError } from '../services/api.js';

const nav = [
  ['Dashboard', '/dashboard', <Dashboard aria-hidden key="dashboard" />],
  ['Upload Document', '/upload', <AddCircle aria-hidden key="upload" />],
  ['Ask Legal Copilot', '/ask', <HelpOutline aria-hidden key="ask" />],
  ['Compare Documents', '/compare', <CompareArrows aria-hidden key="compare" />],
  ['Settings & Models', '/settings', <Tune aria-hidden key="settings" />]
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, logout } = useAuth();

  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const isGuest = !user || user.email === 'guest@lexiguide.com';

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authTab === 'login') {
        await login(email, password);
        setLiveAnnouncement('Successfully signed in.');
      } else {
        await register({ email, full_name: fullName, password });
        setLiveAnnouncement('Registration successful and logged in.');
      }
      setAuthOpen(false);
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err) {
      setAuthError(apiError(err));
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    logout();
    setLiveAnnouncement('Logged out. Switched to guest session.');
    setAuthOpen(false);
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Global accessible live region for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid rgba(11, 59, 53, 0.1)',
          backdropFilter: 'blur(12px)',
          bgcolor: 'rgba(255, 255, 255, 0.92)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ height: 70, px: { xs: 2, md: 3 } }}>
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              flexGrow: 1,
              userSelect: 'none'
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0b3b35 0%, #17655b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(11, 59, 53, 0.25)'
              }}
            >
              <Gavel sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" component="span" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  SynapseLaw
                </Typography>
                <Chip
                  label="AI Copilot"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(217, 130, 43, 0.12)',
                    color: '#b86819',
                    border: '1px solid rgba(217, 130, 43, 0.25)'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' }, fontSize: '0.72rem' }}>
                Evidence-Grounded Legal Analysis
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<AutoAwesome sx={{ fontSize: '14px !important', color: '#0e7054 !important' }} />}
              label="RAG Engine Ready"
              size="small"
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                bgcolor: 'rgba(14, 112, 84, 0.08)',
                color: 'success.main',
                fontWeight: 600,
                border: '1px solid rgba(14, 112, 84, 0.2)'
              }}
            />
            <Button
              startIcon={<AccountCircle />}
              variant="outlined"
              size="medium"
              onClick={() => setAuthOpen(true)}
              sx={{ fontWeight: 700, borderColor: 'rgba(11, 59, 53, 0.2)' }}
              aria-label={isGuest ? 'Sign in or register' : `Signed in as ${user?.full_name}`}
            >
              {isGuest ? 'Sign In' : (user?.full_name?.split(' ')[0] || 'Account')}
            </Button>
            <Button
              startIcon={<AddCircle />}
              variant="contained"
              size="medium"
              onClick={() => navigate('/upload')}
              sx={{ fontWeight: 700 }}
            >
              Upload Document
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Accessible Authentication Dialog */}
      <Dialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="auth-dialog-title"
      >
        <DialogTitle id="auth-dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {isGuest ? (authTab === 'login' ? 'Sign In to SynapseLaw' : 'Create Account') : 'Your Account Profile'}
          </Typography>
          <IconButton aria-label="Close dialog" onClick={() => setAuthOpen(false)} size="small">
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {authError && <Alert severity="error" sx={{ mb: 2 }} role="alert">{authError}</Alert>}

          {isGuest ? (
            <Box component="form" onSubmit={handleAuthSubmit} id="auth-form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Tabs
                value={authTab}
                onChange={(_, v) => { setAuthTab(v); setAuthError(''); }}
                aria-label="Authentication mode"
                sx={{ mb: 1 }}
              >
                <Tab label="Sign In" value="login" id="auth-tab-login" aria-controls="auth-panel-login" sx={{ fontWeight: 700 }} />
                <Tab label="Register" value="register" id="auth-tab-register" aria-controls="auth-panel-register" sx={{ fontWeight: 700 }} />
              </Tabs>

              {authTab === 'register' && (
                <TextField
                  required
                  id="auth-fullname"
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  fullWidth
                  size="small"
                />
              )}

              <TextField
                required
                id="auth-email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                size="small"
              />

              <TextField
                required
                id="auth-password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                size="small"
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
              <Box sx={{ p: 2, bgcolor: 'rgba(11, 59, 53, 0.04)', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>SIGNED IN AS</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.main' }}>{user?.full_name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                You are currently authenticated. Uploaded documents are saved under your private user workspace.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          {isGuest ? (
            <Button
              type="submit"
              form="auth-form"
              variant="contained"
              disabled={authLoading}
              fullWidth
              sx={{ fontWeight: 700, py: 1 }}
            >
              {authLoading ? 'Processing...' : (authTab === 'login' ? 'Sign In' : 'Create Account')}
            </Button>
          ) : (
            <Button
              onClick={handleLogout}
              variant="outlined"
              color="error"
              fullWidth
              sx={{ fontWeight: 700 }}
            >
              Sign Out (Switch to Guest)
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Drawer
        variant="permanent"
        sx={{
          width: 256,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: 256,
            pt: 10,
            pb: 3,
            px: 1.5,
            borderRight: '1px solid rgba(11, 59, 53, 0.08)',
            bgcolor: '#ffffff',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }
        }}
      >
        <Box>
          <Typography variant="overline" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
            Workspaces
          </Typography>
          <List aria-label="Main navigation" sx={{ p: 0 }}>
            {nav.map(([label, to, icon]) => {
              const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
              return (
                <ListItemButton
                  key={to}
                  onClick={() => navigate(to)}
                  sx={{
                    mb: 0.8,
                    borderRadius: '10px',
                    py: 1,
                    px: 1.8,
                    transition: 'all 0.2s ease',
                    bgcolor: active ? 'rgba(11, 59, 53, 0.08)' : 'transparent',
                    color: active ? 'primary.main' : 'text.secondary',
                    fontWeight: active ? 700 : 500,
                    borderLeft: active ? '4px solid #0b3b35' : '4px solid transparent',
                    '&:hover': {
                      bgcolor: active ? 'rgba(11, 59, 53, 0.12)' : 'rgba(11, 59, 53, 0.04)',
                      color: 'primary.main'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: active ? 'primary.main' : 'text.secondary'
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: '0.88rem',
                      fontWeight: active ? 700 : 500
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        <Box sx={{ px: 1.5 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(11, 59, 53, 0.04)',
              border: '1px solid rgba(11, 59, 53, 0.08)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Shield sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'primary.main' }}>
                Legal Notice
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block', lineHeight: 1.4 }}>
              Informational AI copilot. Does not replace professional legal counsel.
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          pt: 11,
          pb: 6,
          px: { xs: 2, sm: 3, md: 4 },
          ml: { md: 0 },
          width: { md: `calc(100% - 256px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: '0 !important' }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
