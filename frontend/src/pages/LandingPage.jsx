import { AutoAwesome, Balance, Checklist, CompareArrows, Gavel, MenuBook, Security, UploadFile } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const features = [
  ['Document-Grounded Q&A', <Balance key="balance" />, 'Answers cite specific document chunks and evidence pages. Never hallucinates when evidence is absent.'],
  ['Risk & Obligation Radar', <Security key="security" />, 'Flags liability, renewal, penalties, termination, privacy, and payment obligations with severity ratings.'],
  ['Contract Comparison', <CompareArrows key="compare" />, 'Compares baseline vs revised contracts for added, removed, or altered clauses and deadlines.'],
  ['Action Checklist & Lawyer Prep', <Checklist key="checklist" />, 'Synthesizes next-step tasks and concrete consultation questions for legal professionals.']
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box component="main" id="main-content">
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          background: 'radial-gradient(circle at 80% 20%, rgba(23, 101, 91, 0.15) 0%, rgba(244, 246, 243, 1) 70%)',
          borderBottom: '1px solid rgba(11, 59, 53, 0.08)',
          py: { xs: 6, md: 10 }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.8, py: 0.8, bgcolor: 'rgba(11, 59, 53, 0.08)', borderRadius: 4, mb: 2.5, border: '1px solid rgba(11, 59, 53, 0.15)' }}>
                <AutoAwesome sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Legal Document Copilot
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 38, sm: 52, md: 62 },
                  fontWeight: 800,
                  color: 'primary.main',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  mb: 2.5
                }}
              >
                Read, Compare & Understand Contracts with <span style={{ color: '#d9822b' }}>Confidence.</span>
              </Typography>

              <Typography
                variant="h5"
                component="p"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  lineHeight: 1.6,
                  maxWidth: 620,
                  mb: 4,
                  fontWeight: 500
                }}
              >
                Transform complex legal agreements, rental leases, NDAs, and employment policies into plain-language summaries, detected risks, and evidence-grounded answers.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                  component={RouterLink}
                  to="/upload"
                  variant="contained"
                  size="large"
                  startIcon={<UploadFile />}
                  sx={{ py: 1.6, px: 3.5, fontSize: '1rem', fontWeight: 800 }}
                >
                  Upload Legal Document
                </Button>
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  variant="outlined"
                  size="large"
                  sx={{ py: 1.6, px: 3, fontSize: '1rem', fontWeight: 700, bgcolor: '#ffffff' }}
                >
                  Open Workspace
                </Button>
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip icon={<MenuBook sx={{ fontSize: '14px !important' }} />} label="Zero Hallucination Grounding" size="small" variant="outlined" />
                <Chip icon={<Security sx={{ fontSize: '14px !important' }} />} label="100% Private Processing" size="small" variant="outlined" />
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(11, 59, 53, 0.14)',
                  borderRadius: 4,
                  p: 3.5,
                  boxShadow: '0 20px 50px rgba(11, 59, 53, 0.12)',
                  position: 'relative'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Gavel color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.05rem' }}>
                    Live Evidence Inspection
                  </Typography>
                  <Chip label="High Risk" size="small" color="error" sx={{ ml: 'auto', fontWeight: 800, fontSize: '0.65rem' }} />
                </Box>

                <Box sx={{ p: 2, bgcolor: 'rgba(197, 48, 48, 0.04)', borderRadius: 2.5, border: '1px solid rgba(197, 48, 48, 0.15)', mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main' }}>
                    DETECTED OBLIGATION
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
                    Tenant must provide 60 days written notice prior to lease expiration or forfeit full security deposit.
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: 'rgba(11, 59, 53, 0.04)', borderRadius: 2.5, border: '1px solid rgba(11, 59, 53, 0.08)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    DOCUMENT CITATION (PAGE 4 · CLAUSE 7.2)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5, fontSize: '0.82rem' }}>
                    "Failure by Tenant to serve sixty (60) days advance written notice of termination will result in liquidated damages..."
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Feature Section with Left Visual Illustration & Right 2x2 Capabilities Grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography variant="overline" color="secondary" sx={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.08em' }}>
            Core Capabilities
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5, fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' } }}>
            Engineered for Precision Legal Analysis
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 680, mx: 'auto', mt: 1.5, fontSize: '1rem' }}>
            Our dual-stage RAG architecture combines semantic vector search with deterministic legal risk mapping to safeguard your contract reviews.
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="stretch">
          {/* Left Side: Illustrative AI Showcase Graphic Card */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: '#082823',
                color: '#ffffff',
                p: { xs: 2.5, sm: 3 },
                borderRadius: 4,
                border: '1px solid rgba(217, 130, 43, 0.25)',
                boxShadow: '0 24px 50px rgba(11, 59, 53, 0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background Glow */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -60,
                  right: -60,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: 'rgba(217, 130, 43, 0.15)',
                  filter: 'blur(50px)',
                  pointerEvents: 'none'
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Header Tag */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        bgcolor: 'rgba(217, 130, 43, 0.2)',
                        color: '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <AutoAwesome sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f59e0b', letterSpacing: '0.04em' }}>
                      SYNAPSELAW RAG ENGINE
                    </Typography>
                  </Box>
                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      border: '1px solid rgba(16, 185, 129, 0.4)'
                    }}
                  />
                </Box>

                {/* Hero Illustration Image */}
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    maxHeight: 320,
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
                    mb: 2.5,
                    position: 'relative',
                    bgcolor: '#041714'
                  }}
                >
                  <Box
                    component="img"
                    src="/legal_ai_showcase.jpg"
                    alt="SynapseLaw Precision Analysis Engine"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                      '&:hover': {
                        transform: 'scale(1.03)'
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      right: 12,
                      bgcolor: 'rgba(8, 40, 35, 0.85)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 2,
                      p: 1.2,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '0.76rem' }}>
                      ⚡ 100% Deterministic Extraction
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.72rem' }}>
                      256-D Chunks
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Bottom Feature Badges */}
              <Box sx={{ pt: 1, position: 'relative', zIndex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', mb: 0.5 }}>
                  Deterministic Legal Copilot
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.84rem', lineHeight: 1.45 }}>
                  Every extracted finding, risk rating, and contract delta links directly to strict page and chunk citations.
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Right Side: 2x2 Core Capabilities Cards */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={2.5} sx={{ height: '100%' }}>
              {features.map(([title, icon, text]) => (
                <Grid item xs={12} sm={6} key={title} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      bgcolor: '#ffffff',
                      p: 1.5,
                      borderRadius: 3.5,
                      border: '1px solid rgba(11, 59, 53, 0.1)',
                      transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 28px rgba(11, 59, 53, 0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(11, 59, 53, 0.08)',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 1.8
                        }}
                      >
                        {icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.02rem', color: 'primary.main', mb: 0.8 }}>
                        {title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
