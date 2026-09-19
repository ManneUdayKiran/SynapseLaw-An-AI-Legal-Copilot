import { AccountCircle, AutoAwesome, CheckCircle, Memory, Security, Storage } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <Box className="fade-in">
      <PageHeader
        eyebrow="Configuration"
        title="Settings & Intelligence Architecture"
      >
        Inspect runtime execution environment, active LLM providers, and in-memory vector embedding parameters.
      </PageHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 1, border: '1px solid rgba(11, 59, 53, 0.12)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AccountCircle color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  Active Workspace Profile
                </Typography>
                <Chip label="Direct Access" size="small" color="success" sx={{ ml: 'auto', fontWeight: 700 }} />
              </Box>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box sx={{ p: 2, bgcolor: 'rgba(11, 59, 53, 0.04)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>USER NAME</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>{user?.full_name}</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: 'rgba(11, 59, 53, 0.04)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>EMAIL IDENTIFIER</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>{user?.email}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 1, border: '1px solid rgba(11, 59, 53, 0.12)', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Memory color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  AI Provider & RAG Configuration
                </Typography>
                <Chip label="Local / OpenAI Compatible" size="small" color="primary" sx={{ ml: 'auto', fontWeight: 700 }} />
              </Box>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box sx={{ p: 2, bgcolor: 'rgba(11, 59, 53, 0.04)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>EMBEDDING ENGINE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>Hashing-v1 (256 Dimensions, Deterministic)</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: 'rgba(11, 59, 53, 0.04)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>LLM MODE</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>Deterministic Local Extractor + OpenAI-Compatible API Support</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
