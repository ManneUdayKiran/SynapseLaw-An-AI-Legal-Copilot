import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import AppLayout from './layouts/AppLayout.jsx';

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const UploadPage = lazy(() => import('./pages/UploadPage.jsx'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage.jsx'));
const AskPage = lazy(() => import('./pages/AskPage.jsx'));
const ComparePage = lazy(() => import('./pages/ComparePage.jsx'));
const ChecklistPage = lazy(() => import('./pages/ChecklistPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));

function LoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
      role="status"
      aria-live="polite"
    >
      <CircularProgress size={36} sx={{ color: 'primary.main' }} />
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        Loading SynapseLaw workspace...
      </Typography>
    </Box>
  );
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/analysis/:documentId" element={<AnalysisPage />} />
            <Route path="/ask" element={<AskPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/checklist/:documentId" element={<ChecklistPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

