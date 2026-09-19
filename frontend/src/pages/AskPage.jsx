import { AutoAwesome, HelpOutline, LightbulbOutlined, MenuBook, Send } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DocumentSelect from '../components/DocumentSelect.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api, { apiError } from '../services/api.js';

const samplePrompts = [
  "Can either party terminate this agreement immediately?",
  "What are the payment deadlines and late fee penalties?",
  "Is there an automatic renewal or non-compete clause?",
  "What liabilities or indemnification obligations exist?"
];

export default function AskPage() {
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/documents')
      .then(({ data }) => {
        setDocuments(data);
        setDocumentId(data[0]?.id || '');
      })
      .catch((err) => setError(apiError(err)));
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (!documentId || !question.trim()) return;
    setLoading(true);
    setError('');
    setAnswer(null);
    try {
      const { data } = await api.post(`/documents/${documentId}/ask`, { question });
      setAnswer(data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="fade-in">
      <PageHeader
        eyebrow="Evidence-Grounded Q&A"
        title="Query Document Knowledge"
      >
        Ask specific questions about clauses, deadlines, payments, and liabilities. Answers cite direct chunk citations and state confidence clearly.
      </PageHeader>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Left Column: Form & Prompts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 3, border: '1px solid rgba(11, 59, 53, 0.12)', borderRadius: 3 }}>
            <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                Ask a Document
              </Typography>

              <DocumentSelect label="Select Document" documents={documents} value={documentId} onChange={setDocumentId} />

              <TextField
                required
                multiline
                minRows={4}
                label="Your Legal Question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="e.g. Under what circumstances can the landlord terminate without prior notice?"
                sx={{ bgcolor: '#ffffff' }}
              />

              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1, display: 'block' }}>
                  Quick Suggested Queries:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {samplePrompts.map((prompt) => (
                    <Chip
                      key={prompt}
                      label={prompt}
                      size="small"
                      onClick={() => setQuestion(prompt)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: 'rgba(11, 59, 53, 0.05)',
                        border: '1px solid rgba(11, 59, 53, 0.12)',
                        '&:hover': { bgcolor: 'rgba(11, 59, 53, 0.12)' }
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!documentId || !question.trim() || loading}
                startIcon={<Send />}
                sx={{ py: 1.4, fontWeight: 700, mt: 1 }}
              >
                Ask document
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Right Column: Grounded Answer & Evidence */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 3, border: '1px solid rgba(11, 59, 53, 0.12)', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
              Grounded AI Answer
            </Typography>

            {loading && (
              <Box sx={{ p: 4, textAlign: 'center', my: 'auto' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                  Scanning evidence vectors and ranking top-k chunks...
                </Typography>
                <LinearProgress aria-label="Retrieving evidence" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            )}

            {!loading && !answer && (
              <Box sx={{ p: 4, textAlign: 'center', my: 'auto', bgcolor: 'rgba(11, 59, 53, 0.02)', borderRadius: 3, border: '1px dashed rgba(11, 59, 53, 0.12)' }}>
                <AutoAwesome sx={{ fontSize: 42, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  No question asked yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto', mt: 0.5 }}>
                  Select a document and enter a question to retrieve direct citations and synthesized answers.
                </Typography>
              </Box>
            )}

            {!loading && answer && (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ p: 2.5, bgcolor: 'rgba(11, 59, 53, 0.04)', borderRadius: 2.5, border: '1px solid rgba(11, 59, 53, 0.1)', mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      Synthesized Response
                    </Typography>
                    <Chip
                      label={`${answer.confidence || 'MEDIUM'} CONFIDENCE`}
                      size="small"
                      color={answer.confidence === 'HIGH' ? 'success' : answer.confidence === 'LOW' ? 'warning' : 'info'}
                      sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '1rem', lineHeight: 1.6, color: 'text.primary' }}>
                    {answer.answer}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MenuBook sx={{ fontSize: 18 }} /> Retrieved Evidence Citations ({answer.evidence?.length || 0})
                </Typography>

                <Stack spacing={1.5} sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 300 }}>
                  {answer.evidence && answer.evidence.length ? (
                    answer.evidence.map((source, index) => (
                      <Box key={index} sx={{ p: 2, bgcolor: '#fbfcfb', borderRadius: 2, border: '1px solid rgba(11, 59, 53, 0.08)' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 0.5 }}>
                          Page {source.page || 'unknown'} · {source.section || source.chunk_id || 'Excerpt'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                          "{source.excerpt}"
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      No sufficient high-similarity evidence chunks were found for this query.
                    </Alert>
                  )}
                </Stack>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
