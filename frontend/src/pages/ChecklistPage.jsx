import { CheckCircle, Checklist, ListAltOutlined, TaskAlt } from '@mui/icons-material';
import { Alert, Box, Card, CardContent, Checkbox, Chip, FormControlLabel, LinearProgress, List, ListItem, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import api, { apiError } from '../services/api.js';

export default function ChecklistPage() {
  const { documentId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/documents/${documentId}/checklist`)
      .then(({ data }) => setItems(data))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, [documentId]);

  async function toggle(item) {
    const next = !item.completed;
    setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, completed: next } : candidate));
    try {
      await api.patch(`/documents/${documentId}/checklist/${item.id}`, { completed: next });
    } catch (err) {
      setError(apiError(err));
    }
  }

  const completedCount = items.filter((item) => item.completed).length;
  const progressPercent = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <Box className="fade-in">
      <PageHeader
        eyebrow="Review Action Plan"
        title="Action Checklist & Next Steps"
      >
        Track review tasks generated from obligations, ambiguous terms, and risks before speaking with a qualified lawyer.
      </PageHeader>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ p: 4, bgcolor: '#ffffff', borderRadius: 3, textAlign: 'center' }}>
          <LinearProgress aria-label="Loading checklist" sx={{ height: 8, borderRadius: 4, maxWidth: 500, mx: 'auto' }} />
        </Box>
      ) : (
        <Box sx={{ maxWidth: 840, mx: 'auto' }}>
          {items.length > 0 && (
            <Card sx={{ p: 3, mb: 3.5, bgcolor: '#ffffff', border: '1px solid rgba(11, 59, 53, 0.12)', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TaskAlt color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    Review Progress
                  </Typography>
                </Box>
                <Chip
                  label={`${completedCount} of ${items.length} Completed (${progressPercent}%)`}
                  color={progressPercent === 100 ? 'success' : 'primary'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'rgba(11, 59, 53, 0.08)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progressPercent === 100 ? 'success.main' : 'primary.main',
                    borderRadius: 5
                  }
                }}
              />
            </Card>
          )}

          <Card sx={{ bgcolor: '#ffffff', border: '1px solid rgba(11, 59, 53, 0.12)', borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {items.length ? (
                <List aria-label="Document checklist" sx={{ p: 0 }}>
                  {items.map((item, idx) => (
                    <ListItem
                      key={item.id}
                      divider={idx !== items.length - 1}
                      sx={{
                        py: 2,
                        px: 2,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        bgcolor: item.completed ? 'rgba(14, 112, 84, 0.03)' : 'transparent',
                        '&:hover': { bgcolor: 'rgba(11, 59, 53, 0.04)' }
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Boolean(item.completed)}
                            onChange={() => toggle(item)}
                            color="primary"
                            sx={{ '&.Mui-checked': { color: 'success.main' } }}
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              fontWeight: item.completed ? 500 : 700,
                              textDecoration: item.completed ? 'line-through' : 'none',
                              color: item.completed ? 'text.secondary' : 'text.primary',
                              fontSize: '0.96rem'
                            }}
                          >
                            {item.label}
                          </Typography>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <ListAltOutlined sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                    No checklist items generated yet
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Run document analysis to automatically detect action items and obligations.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
