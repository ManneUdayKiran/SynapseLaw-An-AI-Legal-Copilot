import { AutoAwesome, HelpOutline, InfoOutlined, ShieldOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FindingCard from '../components/FindingCard.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api, { apiError } from '../services/api.js';

const sections = [
  ['summary', 'Executive Summary'],
  ['key_clauses', 'Key Clauses'],
  ['obligations', 'Obligations'],
  ['risks', 'Potential Risks'],
  ['important_dates', 'Important Dates'],
  ['action_items', 'Action Checklist'],
  ['lawyer_questions', 'Questions for Lawyer']
];

export default function AnalysisPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [tab, setTab] = useState('summary');
  const [error, setError] = useState('');

  useEffect(() => {
    api.post(`/documents/${documentId}/analyze`)
      .then(({ data }) => setAnalysis(data))
      .catch((err) => setError(apiError(err)));
  }, [documentId]);

  return (
    <Box className="fade-in">
      <PageHeader
        eyebrow="Evidence-Backed Review"
        title="Comprehensive Document Analysis"
        action={
          <Button
            variant="contained"
            startIcon={<HelpOutline />}
            onClick={() => navigate('/ask')}
            sx={{ fontWeight: 700 }}
          >
            Ask Questions About This Doc
          </Button>
        }
      >
        AI analysis is separated from extracted source citations so you can verify each risk and obligation with proof.
      </PageHeader>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!analysis ? (
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Skeleton variant="rounded" height={60} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
        </Box>
      ) : (
        <Box>
          <Box sx={{ bgcolor: '#ffffff', p: 0.8, borderRadius: 3, border: '1px solid rgba(11, 59, 53, 0.1)', mb: 3.5, boxShadow: '0 4px 14px rgba(11, 59, 53, 0.04)' }}>
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Analysis sections"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  minHeight: 44,
                  borderRadius: 2,
                  mx: 0.4,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(11, 59, 53, 0.08)',
                    color: 'primary.main'
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 1.5,
                  bgcolor: 'primary.main'
                }
              }}
            >
              {sections.map(([value, label]) => (
                <Tab key={value} label={label} value={value} />
              ))}
            </Tabs>
          </Box>

          <Box>
            {tab === 'summary' ? (
              <Card sx={{ bgcolor: '#ffffff', borderRadius: 3, border: '1px solid rgba(11, 59, 53, 0.12)', boxShadow: '0 8px 30px rgba(11, 59, 53, 0.05)' }}>
                <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(11, 59, 53, 0.08)', color: 'primary.main', display: 'flex' }}>
                      <AutoAwesome sx={{ fontSize: 22 }} />
                    </Box>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      AI Executive Summary
                    </Typography>
                    <Chip label="Verified Evidence" color="success" size="small" sx={{ fontWeight: 700, ml: 'auto' }} />
                  </Box>

                  <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'text.primary', mb: 4 }}>
                    {analysis.summary}
                  </Typography>

                  <Box sx={{ p: 2, bgcolor: 'rgba(11, 59, 53, 0.03)', borderRadius: 2, border: '1px solid rgba(11, 59, 53, 0.08)', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <InfoOutlined sx={{ fontSize: 20, color: 'primary.main', mt: 0.2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
                      {analysis.disclaimer}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2.5}>
                {(analysis[tab] || []).length ? (
                  analysis[tab].map((finding, index) => (
                    <Grid item xs={12} md={6} key={`${finding.title}-${index}`}>
                      <FindingCard finding={finding} />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#ffffff' }}>
                      <Typography color="text.secondary">
                        No evidence-backed items were detected for this section.
                      </Typography>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
