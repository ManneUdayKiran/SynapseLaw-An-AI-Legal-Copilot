import { Description, Lock, Speed } from '@mui/icons-material';
import { Alert, Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import UploadDropzone from '../components/UploadDropzone.jsx';

export default function UploadPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');

  return (
    <Box className="fade-in">
      <PageHeader
        eyebrow="Document Intake"
        title="Upload Legal Document"
      >
        Upload agreements, contracts, leases, or NDAs in PDF, DOCX, or TXT format. Files are validated for signature integrity and indexed into vector chunks.
      </PageHeader>

      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <UploadDropzone
        onUploaded={(document) => {
          setSuccess(`${document.filename} uploaded and indexed successfully.`);
          navigate(`/analysis/${document.id}`);
        }}
      />

      <Grid container spacing={2.5} sx={{ maxWidth: 840, mx: 'auto', mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 1, border: '1px solid rgba(11, 59, 53, 0.08)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 1 }}>
                <Description fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Supported Formats</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Text-based PDF, Microsoft Word (.docx), and plain text (.txt) up to 5 MB.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 1, border: '1px solid rgba(11, 59, 53, 0.08)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 1 }}>
                <Lock fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Private & Isolated</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Documents are stored in an isolated vault and never shared or used to train public models.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#ffffff', p: 1, border: '1px solid rgba(11, 59, 53, 0.08)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.dark', mb: 1 }}>
                <Speed fontSize="small" />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Instant Vector Index</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Automatic chunking with page mapping and section title extraction.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
