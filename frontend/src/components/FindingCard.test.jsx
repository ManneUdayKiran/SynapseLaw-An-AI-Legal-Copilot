import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FindingCard from './FindingCard.jsx';

describe('FindingCard', () => {
  it('renders high severity finding with title, explanation, and action', () => {
    const finding = {
      title: 'Automatic renewal clause',
      explanation: 'The contract will renew automatically unless 60 days notice is given.',
      severity: 'HIGH',
      suggested_action: 'Mark 60 days before deadline on your calendar.',
      source: { page: 3, section: 'Renewal Section', excerpt: 'Section 4.1 Automatic Renewal...' }
    };

    render(<FindingCard finding={finding} />);

    expect(screen.getByText('Automatic renewal clause')).toBeInTheDocument();
    expect(screen.getByText(/renew automatically/i)).toBeInTheDocument();
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText(/mark 60 days/i)).toBeInTheDocument();
    expect(screen.getByText(/page 3/i)).toBeInTheDocument();
  });
});
