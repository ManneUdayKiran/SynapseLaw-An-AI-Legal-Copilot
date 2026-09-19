import { BookmarkBorder, LightbulbOutlined, MenuBook } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';

const severityConfig = {
  HIGH: { color: 'error', bg: 'rgba(197, 48, 48, 0.1)', text: '#c53030', border: 'rgba(197, 48, 48, 0.25)' },
  MEDIUM: { color: 'warning', bg: 'rgba(217, 130, 43, 0.1)', text: '#b86819', border: 'rgba(217, 130, 43, 0.25)' },
  LOW: { color: 'success', bg: 'rgba(14, 112, 84, 0.1)', text: '#0e7054', border: 'rgba(14, 112, 84, 0.25)' }
};

export default function FindingCard({ finding }) {
  const conf = finding.severity ? severityConfig[finding.severity] : null;

  return (
    <Card
      component="article"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: '#ffffff',
        border: '1px solid rgba(11, 59, 53, 0.1)',
        borderRadius: 3,
        transition: 'all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
        '&:hover': {
          borderColor: 'primary.light',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(11, 59, 53, 0.08)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', lineHeight: 1.3 }}>
              {finding.title}
            </Typography>
            {finding.severity && (
              <Chip
                label={`${finding.severity} RISK`}
                size="small"
                aria-label={`Severity classification: ${finding.severity} RISK`}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  bgcolor: conf?.bg,
                  color: conf?.text,
                  border: `1px solid ${conf?.border}`,
                  flexShrink: 0
                }}
              />
            )}
          </Box>

          <Typography sx={{ color: 'text.primary', fontSize: '0.92rem', lineHeight: 1.5, mb: 1.5 }}>
            {finding.explanation}
          </Typography>

          {finding.suggested_action && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2, p: 1.5, bgcolor: 'rgba(217, 130, 43, 0.06)', borderRadius: 2, border: '1px solid rgba(217, 130, 43, 0.16)' }}>
              <LightbulbOutlined sx={{ fontSize: 18, color: 'secondary.main', mt: 0.2 }} />
              <Typography variant="body2" sx={{ color: 'secondary.dark', fontWeight: 600, fontSize: '0.85rem' }}>
                {finding.suggested_action}
              </Typography>
            </Box>
          )}
        </Box>

        {finding.source && (
          <Box sx={{ mt: 1.5, p: 1.8, bgcolor: 'rgba(11, 59, 53, 0.03)', borderRadius: 2, border: '1px solid rgba(11, 59, 53, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
              <MenuBook sx={{ fontSize: 15, color: 'primary.main' }} />
              <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'primary.main' }}>
                Document Evidence
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
              Page {finding.source.page || 'unknown'} · {finding.source.section || finding.source.chunk_id || 'Referenced excerpt'}
            </Typography>
            {finding.source.excerpt && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                "{finding.source.excerpt}"
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
