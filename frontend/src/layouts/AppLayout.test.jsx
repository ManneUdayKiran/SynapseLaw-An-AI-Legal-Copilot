import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AppLayout from './AppLayout.jsx';
import { AuthProvider } from '../hooks/useAuth.jsx';

describe('AppLayout Accessibility & Navigation', () => {
  it('renders navigation bar, branding, accessible live region, and auth controls', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('SynapseLaw')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /upload document/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
