import { Box, Chip, Typography } from '@mui/material';

export default function PageHeader({ eyebrow, title, children, action }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3.5,
        pb: 2.5,
        borderBottom: '1px solid rgba(11, 59, 53, 0.08)'
      }}
    >
      <Box sx={{ maxWidth: 800 }}>
        {eyebrow && (
          <Chip
            label={eyebrow}
            size="small"
            sx={{
              mb: 1,
              fontWeight: 700,
              fontSize: '0.72rem',
              bgcolor: 'rgba(217, 130, 43, 0.12)',
              color: 'secondary.dark',
              border: '1px solid rgba(217, 130, 43, 0.25)',
              borderRadius: '6px'
            }}
          />
        )}
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontSize: { xs: 26, sm: 32, md: 36 },
            fontWeight: 800,
            color: 'primary.main',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}
        >
          {title}
        </Typography>
        {children && (
          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
              fontSize: { xs: '0.92rem', md: '1rem' },
              lineHeight: 1.5
            }}
          >
            {children}
          </Typography>
        )}
      </Box>
      {action && (
        <Box sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}>
          {action}
        </Box>
      )}
    </Box>
  );
}
