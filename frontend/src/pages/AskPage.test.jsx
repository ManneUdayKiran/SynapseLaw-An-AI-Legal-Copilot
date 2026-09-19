import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AskPage from './AskPage.jsx';

vi.mock('../services/api.js', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: [{ id: 'doc-1', filename: 'Lease_Agreement.pdf' }]
    })),
    post: vi.fn(() => Promise.resolve({
      data: {
        answer: 'The tenant is responsible for water and gas utilities.',
        confidence: 'HIGH',
        evidence: [
          { page: 2, section: 'Utilities', excerpt: 'Tenant pays for water, gas, and electricity.' }
        ]
      }
    }))
  },
  apiError: () => 'Error asking question'
}));

describe('AskPage', () => {
  it('renders question form and ask document button', async () => {
    render(
      <BrowserRouter>
        <AskPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/ask a document/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ask document/i })).toBeInTheDocument();
  });
});
