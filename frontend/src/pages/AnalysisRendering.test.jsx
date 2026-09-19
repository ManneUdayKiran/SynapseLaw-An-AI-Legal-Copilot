import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FindingCard from '../components/FindingCard.jsx';

describe('FindingCard', () => {
  it('separates interpretation from document evidence', () => {
    render(<FindingCard finding={{
      title: 'Termination Notice',
      explanation: 'Either party must provide notice.',
      severity: 'MEDIUM',
      source: { page: 4, section: 'Termination', excerpt: '30 days written notice before termination.' }
    }} />);
    expect(screen.getByText(/Termination Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Document Evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/MEDIUM RISK/i)).toBeInTheDocument();
  });
});
