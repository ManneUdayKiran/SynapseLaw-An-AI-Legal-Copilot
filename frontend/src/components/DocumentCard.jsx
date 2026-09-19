import { Article, Checklist, DeleteOutline, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DocumentCard({ document, onDelete }) {
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete(document.id);
      }
    } finally {
      setDeleting(false);
      setOpenConfirm(false);
    }
  }

  return (
    <>
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
          transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '&:hover': {
            borderColor: 'primary.light',
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 30px rgba(11, 59, 53, 0.1)',
          },
        }}
      >
        <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: 'rgba(11, 59, 53, 0.08)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Article sx={{ fontSize: 24 }} aria-hidden />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label="Evidence-ready"
                size="small"
                color="success"
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(14, 112, 84, 0.1)',
                  color: 'success.main',
                  border: '1px solid rgba(14, 112, 84, 0.2)',
                }}
              />
              <Tooltip title="Delete Document">
                <IconButton
                  size="small"
                  aria-label="delete document"
                  onClick={() => setOpenConfirm(true)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main', bgcolor: 'rgba(220, 38, 38, 0.08)' },
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: '1.05rem',
              color: 'text.primary',
              mb: 0.8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
            }}
            title={document.filename}
          >
            {document.filename}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {Math.round(document.size_bytes / 1024)} KB · {document.chunk_count} evidence chunks
          </Typography>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0, gap: 1, display: 'flex', flexWrap: 'wrap', borderTop: '1px solid rgba(11, 59, 53, 0.06)' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Search />}
            onClick={() => navigate(`/analysis/${document.id}`)}
            sx={{ flexGrow: 1, fontWeight: 700 }}
          >
            Analyze
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Checklist />}
            onClick={() => navigate(`/checklist/${document.id}`)}
            sx={{ flexGrow: 1 }}
          >
            Checklist
          </Button>
        </CardActions>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openConfirm}
        onClose={() => !deleting && setOpenConfirm(false)}
        aria-labelledby="delete-dialog-title"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 800, color: 'primary.main' }}>
          Delete Document?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete <strong>{document.filename}</strong>? All extracted vector chunks, checklist items, and saved analyses for this document will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setOpenConfirm(false)} disabled={deleting} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="contained"
            color="error"
            startIcon={<DeleteOutline />}
            sx={{ fontWeight: 700 }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
