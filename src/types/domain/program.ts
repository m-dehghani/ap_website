/**
 * Program domain models
 * Core domain entities for program data
 */

export interface Schedule {
  id: string;
  day: string;
  time: string;
  displayOrder: number;
  programId?: string;
}

export interface CoachSummary {
  id: string;
  fullName: string;
  title: string | null;
  experience: number;
  rating: number;
  studentsCount: number;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  price: number; // Price in Toman
  duration: number; // Duration in months
  sessionCount: number;
  maxStudents: number;
  isActive: boolean;
  popular: boolean;
  icon: string;
  ageRange: string; // Display label, e.g. "8-12 سال"
  minAge: number;
  maxAge: number;
  color: string;
  period: string;
  rating: number;
  studentsEnrolled: number;
  features: string[];
  level: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  coach: CoachSummary;
  schedule: Schedule[];
}

export interface ProgramCreateInput {
  name: string;
  description: string;
  price: number;
  duration: number;
  sessionCount: number;
  maxStudents?: number;
  isActive?: boolean;
  popular?: boolean;
  icon: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  color: string;
  period: string;
  rating?: number;
  studentsEnrolled?: number;
  features?: string[];
  level: string;
  displayOrder?: number;
  coachId: string;
  schedule?: Omit<Schedule, 'id' | 'programId'>[];
}

export interface ProgramUpdateInput extends Partial<ProgramCreateInput> {
  id: string;
}

export interface ProgramFilters {
  isActive?: boolean;
  popular?: boolean;
  level?: string;
  minAge?: number;
  maxAge?: number;
  search?: string;
}

export interface ProgramSortOptions {
  field: 'displayOrder' | 'name' | 'price' | 'rating' | 'createdAt';
  order: 'asc' | 'desc';
}