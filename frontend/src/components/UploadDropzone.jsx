import { CheckCircleOutline, CloudUpload, Description, PictureAsPdf, TextSnippet } from '@mui/icons-material';
import { Alert, Box, Button, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import api, { apiError } from '../services/api.js';

export default function UploadDropzone({ onUploaded }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  async function upload(file) {
    if (!file) return;
    setError('');
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await api.post('/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded?.(data);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 840, mx: 'auto' }}>
      <Box
        onClick={() => inputRef.current?.click()}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          upload(event.dataTransfer.files[0]);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        sx={{
          border: isDragging ? '2px dashed #0b3b35' : '2px dashed rgba(11, 59, 53, 0.25)',
          borderRadius: 4,
          p: { xs: 4, sm: 6, md: 8 },
          textAlign: 'center',
          bgcolor: isDragging ? 'rgba(11, 59, 53, 0.04)' : '#ffffff',
          boxShadow: '0 8px 30px rgba(11, 59, 53, 0.04)',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 36px rgba(11, 59, 53, 0.09)'
          }
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 2.5,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(11, 59, 53, 0.1) 0%, rgba(23, 101, 91, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main'
          }}
        >
          <CloudUpload sx={{ fontSize: 38 }} aria-hidden />
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
          Upload a PDF, DOCX, or TXT legal document
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mb: 3, fontSize: '0.92rem' }}>
          Drag and drop your contract or policy here. Files are verified for cryptographic signature, cleaned, and chunked for evidence-grounded AI extraction.
        </Typography>

        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
          <Chip icon={<PictureAsPdf sx={{ fontSize: '16px !important' }} />} label="PDF (.pdf)" size="small" variant="outlined" />
          <Chip icon={<Description sx={{ fontSize: '16px !important' }} />} label="Word (.docx)" size="small" variant="outlined" />
          <Chip icon={<TextSnippet sx={{ fontSize: '16px !important' }} />} label="Plain Text (.txt)" size="small" variant="outlined" />
        </Stack>

        <Button
          variant="contained"
          size="large"
          aria-label="Upload legal document"
          startIcon={<CloudUpload />}
          sx={{ px: 4, py: 1.2, fontWeight: 700 }}
        >
          Choose document
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          hidden
          aria-label="Choose legal document file"
          onChange={(event) => upload(event.target.files[0])}
        />
      </Box>

      {loading && (
        <Box sx={{ mt: 3, p: 2.5, bgcolor: '#ffffff', borderRadius: 3, border: '1px solid rgba(11, 59, 53, 0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Extracting text & generating evidence vectors...
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Processing</Typography>
          </Box>
          <LinearProgress aria-label="Uploading document" sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
