import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import DocumentCard from './DocumentCard.jsx';

describe('DocumentCard', () => {
  it('renders document details and action buttons', () => {
    const doc = {
      id: 'doc-999',
      filename: 'employment_agreement.pdf',
      size_bytes: 204800,
      chunk_count: 8,
    };

    render(
      <BrowserRouter>
        <DocumentCard document={doc} />
      </BrowserRouter>
    );

    expect(screen.getByText('employment_agreement.pdf')).toBeInTheDocument();
    expect(screen.getByText(/200 KB · 8 evidence chunks/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /checklist/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete document/i })).toBeInTheDocument();
  });
});
