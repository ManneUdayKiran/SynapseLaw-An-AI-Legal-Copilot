import { CompareArrows, DifferenceOutlined, SwapHoriz } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DocumentSelect from '../components/DocumentSelect.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api, { apiError } from '../services/api.js';

export default function ComparePage() {
  const [documents, setDocuments] = useState([]);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/documents')
      .then(({ data }) => {
        setDocuments(data);
        setA(data[0]?.id || '');
        setB(data[1]?.id || '');
      })
      .catch((err) => setError(apiError(err)));
  }, []);

  async function compare() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/compare', { document_a_id: a, document_b_id: b });
      setResult(data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="fade-in">
      <PageHeader
        eyebrow="Version Comparison"
        title="Side-by-Side Contract Comparison"
      >
        Spot changed obligations, deadlines, payment terms, termination clauses, liabilities, and penalties between two documents.
      </PageHeader>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ p: 3, mb: 4, bgcolor: '#ffffff', border: '1px solid rgba(11, 59, 53, 0.12)', borderRadius: 3 }}>
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} md={5}>
            <DocumentSelect label="Document A (Baseline)" documents={documents} value={a} onChange={setA} />
          </Grid>
          <Grid item xs={12} md={5}>
            <DocumentSelect label="Document B (Revised / Comparison)" documents={documents} value={b} onChange={setB} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!a || !b || a === b || loading}
              onClick={compare}
              startIcon={<CompareArrows />}
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              Compare
            </Button>
          </Grid>
        </Grid>
      </Card>

      {loading && (
        <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: 3, textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
            Analyzing clause differences and semantic shifts...
          </Typography>
          <LinearProgress aria-label="Comparing documents" sx={{ height: 8, borderRadius: 4, maxWidth: 600, mx: 'auto' }} />
        </Box>
      )}

      {result && (
        <Box sx={{ mt: 2 }}>
          <Card sx={{ p: 3, mb: 3.5, bgcolor: 'rgba(11, 59, 53, 0.04)', border: '1px solid rgba(11, 59, 53, 0.12)', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <DifferenceOutlined color="primary" />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                Comparison Summary
              </Typography>
              <Chip label={`${result.changes.length} Differences Flagged`} color="secondary" size="small" sx={{ ml: 'auto', fontWeight: 700 }} />
            </Box>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
              {result.summary}
            </Typography>
          </Card>

          <Grid container spacing={2.5}>
            {result.changes.map((change, index) => (
              <Grid item xs={12} md={6} key={`${change.category}-${index}`}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    bgcolor: '#ffffff',
                    border: '1px solid rgba(11, 59, 53, 0.1)',
                    borderRadius: 3
                  }}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {change.category}
                      </Typography>
                      <Chip label="Modified Clause" size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: 'rgba(217, 130, 43, 0.1)', color: 'secondary.dark' }} />
                    </Box>

                    <Stack spacing={2}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(197, 48, 48, 0.04)', borderRadius: 2, border: '1px solid rgba(197, 48, 48, 0.12)' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main', textTransform: 'uppercase' }}>
                          Document A
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.primary', lineHeight: 1.5 }}>
                          {change.document_a}
                        </Typography>
                      </Box>

                      <Box sx={{ p: 2, bgcolor: 'rgba(14, 112, 84, 0.04)', borderRadius: 2, border: '1px solid rgba(14, 112, 84, 0.12)' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main', textTransform: 'uppercase' }}>
                          Document B
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.primary', lineHeight: 1.5 }}>
                          {change.document_b}
                        </Typography>
                      </Box>
                    </Stack>

                    <Alert severity="info" sx={{ mt: 2.5, borderRadius: 2, fontSize: '0.85rem' }}>
                      {change.change}
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
