import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ComparePage from './ComparePage.jsx';

vi.mock('../services/api.js', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: [
        { id: 'doc-a', filename: 'Contract_V1.pdf' },
        { id: 'doc-b', filename: 'Contract_V2.pdf' }
      ]
    })),
    post: vi.fn(() => Promise.resolve({
      data: {
        summary: 'Compared Contract_V1.pdf with Contract_V2.pdf',
        changes: [
          {
            category: 'Termination',
            document_a: '30 days notice required',
            document_b: '60 days notice required',
            change: 'Notice period increased by 30 days.'
          }
        ]
      }
    }))
  },
  apiError: () => 'Error comparing'
}));

describe('ComparePage', () => {
  it('renders compare page header and compare button', async () => {
    render(
      <BrowserRouter>
        <ComparePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Contract Comparison/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compare/i })).toBeInTheDocument();
  });
});
