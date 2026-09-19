import { AddCircle, AutoAwesome, CheckCircle, CompareArrows, Description, HelpOutline, Security } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentCard from '../components/DocumentCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api, { apiError } from '../services/api.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/documents')
      .then(({ data }) => setDocuments(data))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(documentId) {
    try {
      await api.delete(`/documents/${documentId}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (err) {
      setError(apiError(err));
    }
  }

  const totalChunks = documents.reduce((sum, doc) => sum + (doc.chunk_count || 0), 0);

  return (
    <Box className="fade-in">
      <PageHeader
        eyebrow="Command Center"
        title="Document Intelligence Hub"
        action={
          <Button
            variant="contained"
            size="large"
            startIcon={<AddCircle />}
            onClick={() => navigate('/upload')}
            sx={{ fontWeight: 700 }}
          >
            Upload Document
          </Button>
        }
      >
        Manage contracts, agreements, and policies. Extract risks, verify obligations, query evidence vectors, and generate lawyer review questions.
      </PageHeader>

      {/* Quick Metrics Bar with 4 equal-share cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(11, 59, 53, 0.08)', color: 'primary.main' }}>
                <Description sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                  {documents.length}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Active Documents
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(217, 130, 43, 0.1)', color: 'secondary.main' }}>
                <AutoAwesome sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'secondary.dark', lineHeight: 1 }}>
                  {totalChunks}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Evidence Vectors
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(14, 112, 84, 0.08)', color: 'success.main' }}>
                <CheckCircle sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main', lineHeight: 1 }}>
                  Ready
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  RAG Pipeline Status
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 1 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(11, 59, 53, 0.08)', color: 'primary.main' }}>
                <Security sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                  Isolated
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Vault Storage Privacy
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          size="medium"
          startIcon={<HelpOutline />}
          onClick={() => navigate('/ask')}
          sx={{ bgcolor: '#ffffff', fontWeight: 700 }}
        >
          Ask Legal Copilot
        </Button>
        <Button
          variant="outlined"
          size="medium"
          startIcon={<CompareArrows />}
          onClick={() => navigate('/compare')}
          sx={{ bgcolor: '#ffffff', fontWeight: 700 }}
        >
          Compare Two Documents
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={190} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : documents.length ? (
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
            Your Document Vault
          </Typography>
          <Grid container spacing={2.5}>
            {documents.map((document) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={document.id}>
                <DocumentCard document={document} onDelete={handleDelete} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Card sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', bgcolor: '#ffffff', border: '2px dashed rgba(11, 59, 53, 0.15)', borderRadius: 4 }}>
          <Box sx={{ width: 64, height: 64, mx: 'auto', mb: 2, borderRadius: '50%', bgcolor: 'rgba(11, 59, 53, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
            <Description sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
            No documents in your vault yet
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3 }}>
            Upload a contract, lease agreement, NDA, employment offer, or policy to extract evidence-grounded insights.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddCircle />}
            onClick={() => navigate('/upload')}
            sx={{ fontWeight: 700, px: 3.5 }}
          >
            Upload Your First Document
          </Button>
        </Card>
      )}
    </Box>
  );
}
