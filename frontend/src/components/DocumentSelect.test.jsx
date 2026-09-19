import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DocumentSelect from './DocumentSelect.jsx';

describe('DocumentSelect', () => {
  it('renders dropdown label and selected document option', () => {
    const docs = [
      { id: '1', filename: 'Lease.pdf' },
      { id: '2', filename: 'NDA.docx' }
    ];
    const handleChange = vi.fn();

    render(<DocumentSelect label="Select Document" documents={docs} value="1" onChange={handleChange} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Lease.pdf')).toBeInTheDocument();
  });
});
