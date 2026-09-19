import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ChecklistPage from './ChecklistPage.jsx';

vi.mock('../services/api.js', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: [
        { id: 'chk-1', label: 'Review automatic renewal clause', completed: false },
        { id: 'chk-2', label: 'Confirm 30 days termination notice', completed: true }
      ]
    })),
    patch: vi.fn(() => Promise.resolve({
      data: { id: 'chk-1', label: 'Review automatic renewal clause', completed: true }
    }))
  },
  apiError: () => 'Error loading checklist'
}));

describe('ChecklistPage', () => {
  it('renders action checklist title and items', async () => {
    render(
      <MemoryRouter initialEntries={['/checklist/doc-123']}>
        <Routes>
          <Route path="/checklist/:documentId" element={<ChecklistPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/action checklist/i)).toBeInTheDocument();
    expect(await screen.findByText(/review automatic renewal clause/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm 30 days termination notice/i)).toBeInTheDocument();
  });
});
