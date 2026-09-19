import { AddCircle, AutoAwesome, Balance, CompareArrows, Dashboard, Gavel, HelpOutline, Shield, Tune } from '@mui/icons-material';
import { AppBar, Box, Button, Chip, Container, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
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
