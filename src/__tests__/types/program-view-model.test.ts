import { describe, expect, it } from 'vitest';
import { toProgramViewModel } from '@/types/viewModels/program';

describe('toProgramViewModel', () => {
  it('includes the coach profile image for the program details view', () => {
    const program = toProgramViewModel({
      id: 'program-1',
      name: 'برنامه',
      description: '',
      price: 0,
      duration: 1,
      sessionCount: 1,
      maxStudents: 1,
      popular: false,
      icon: '',
      ageRange: '',
      minAge: 1,
      maxAge: 2,
      color: '',
      period: '',
      rating: 0,
      studentsEnrolled: 0,
      level: '',
      coach: {
        id: 'coach-1',
        firstName: 'مربی',
        lastName: 'آکادمی',
        image: '/api/uploads/coach-photo.png',
      },
      schedule: [],
    });

    expect(program.coach?.image).toBe('/api/uploads/coach-photo.png');
  });

  it('localizes known program levels for the Persian interface', () => {
    const program = toProgramViewModel({
      level: 'INTERMEDIATE',
    });

    expect(program.level).toBe('متوسط');
  });
});
