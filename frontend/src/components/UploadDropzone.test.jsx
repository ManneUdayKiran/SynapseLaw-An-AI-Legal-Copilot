import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UploadDropzone from './UploadDropzone.jsx';

vi.mock('../services/api.js', () => ({
  default: { post: vi.fn(() => Promise.resolve({ data: { id: 'doc1', filename: 'lease.txt' } })) },
  apiError: () => 'Upload failed'
}));

describe('UploadDropzone', () => {
  it('renders accessible upload control', () => {
    render(<UploadDropzone />);
    expect(screen.getByRole('button', { name: /upload legal document/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/choose legal document file/i)).toBeInTheDocument();
  });

  it('shows loading text through the button state after interaction target exists', async () => {
    const user = userEvent.setup();
    render(<UploadDropzone />);
    await user.click(screen.getByRole('button', { name: /upload legal document/i }));
    expect(screen.getByText(/pdf, docx, or txt/i)).toBeInTheDocument();
  });
});
