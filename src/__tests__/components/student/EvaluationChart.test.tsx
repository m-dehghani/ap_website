import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EvaluationsSection from '@/components/student/EvaluationsSection';

describe('EvaluationsSection progress chart', () => {
  it('renders each coach score as an accessible 0–10 meter', () => {
    render(
      <EvaluationsSection
        evaluations={[
          {
            id: 'evaluation-1',
            technical: 8,
            physical: 7,
            mental: 9,
            teamwork: 8,
            overall: 8,
            notes: null,
            createdAt: '2026-10-25T10:00:00.000Z',
            coach: { firstName: 'مهدی', lastName: 'کریمی' },
          },
        ]}
      />,
    );

    const technicalScore = screen.getByRole('meter', { name: 'فنی' });
    expect(technicalScore).toHaveAttribute('aria-valuenow', '8');
    expect(technicalScore).toHaveAttribute('aria-valuemax', '10');
  });
});
