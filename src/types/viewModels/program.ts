/**
 * Program View Models
 * Presentation layer models for program data
 */

import { Schedule } from '@/types/domain/program';

export interface ProgramViewModel {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  sessionCount: number;
  maxStudents: number;
  popular: boolean;
  icon: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  color: string;
  period: string;
  rating: number;
  studentsEnrolled: number;
  features: string[];
  level: string;
  coach: {
    id: string;
    fullName: string;
    title: string | null;
    experience: number;
    rating: number;
    studentsCount: number;
  } | null;
  schedule: Schedule[];
}

export interface ProgramCardViewModel {
  id: string;
  name: string;
  icon: string;
  ageRange: string;
  price: number;
  period: string;
  rating: number;
  studentsEnrolled: number;
  level: string;
  popular: boolean;
  color: string;
  isSelected: boolean;
}

export interface ProgramDetailViewModel extends ProgramViewModel {
  formattedPrice: string;
  formattedSessionCount: string;
  formattedDuration: string;
  formattedMaxStudents: string;
  formattedRating: string;
  formattedStudentsEnrolled: string;
}

export function toProgramViewModel(program: any): ProgramViewModel {
  return {
    id: program.id,
    name: program.name,
    description: program.description,
    price: program.price,
    duration: program.duration,
    sessionCount: program.sessionCount,
    maxStudents: program.maxStudents,
    popular: program.popular,
    icon: program.icon,
    ageRange: program.ageRange,
    minAge: program.minAge,
    maxAge: program.maxAge,
    color: program.color,
    period: program.period,
    rating: program.rating,
    studentsEnrolled: program.studentsEnrolled,
    features: program.features || [],
    level: program.level,
    coach: program.coach ? {
      id: program.coach.id || '',
      fullName: program.coach.fullName || `${program.coach.firstName || ''} ${program.coach.lastName || ''}`.trim() || 'نامشخص',
      title: program.coach.title || null,
      experience: program.coach.experience || 0,
      rating: program.coach.rating || 0,
      studentsCount: program.coach.studentsCount || 0,
    } : null,
    schedule: program.schedule || [],
  };
}

export function toProgramCardViewModel(
  program: Record<string, any>,
  isSelected = false
): ProgramCardViewModel {
  return {
    id: program.id,
    name: program.name,
    icon: program.icon,
    ageRange: program.ageRange,
    price: program.price,
    period: program.period,
    rating: program.rating,
    studentsEnrolled: program.studentsEnrolled,
    level: program.level,
    popular: program.popular,
    color: program.color,
    isSelected,
  };
}

export function toProgramDetailViewModel(
  program: Record<string, any>,
  formatToman: (amount: number) => string,
  toPersianDigits: (value: string | number) => string,
): ProgramDetailViewModel {
  const base = toProgramViewModel(program);
  return {
    ...base,
    formattedPrice: formatToman(program.price),
    formattedSessionCount: toPersianDigits(program.sessionCount),
    formattedDuration: toPersianDigits(program.duration),
    formattedMaxStudents: toPersianDigits(program.maxStudents),
    formattedRating: toPersianDigits(program.rating),
    formattedStudentsEnrolled: toPersianDigits(program.studentsEnrolled),
  };
}