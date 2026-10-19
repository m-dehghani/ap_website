/**
 * Coach domain models
 * Core domain entities for coach data
 */

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number; // Years of experience
  title: string | null;
  bio: string | null;
  quote: string | null;
  certifications: string[];
  achievements: string[];
  rating: number;
  studentsCount: number;
  image: string | null;
  instagram: string | null;
  twitter: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  programs: CoachProgram[];
}

export interface CoachProgram {
  id: string;
  name: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CoachCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  title?: string | null;
  bio?: string | null;
  quote?: string | null;
  certifications?: string[];
  achievements?: string[];
  rating?: number;
  studentsCount?: number;
  image?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface CoachUpdateInput extends Partial<CoachCreateInput> {
  id: string;
}

export interface CoachFilters {
  isActive?: boolean;
  search?: string;
  specialization?: string;
}

export interface CoachSortOptions {
  field:
    | 'displayOrder'
    | 'firstName'
    | 'lastName'
    | 'experience'
    | 'rating'
    | 'createdAt';
  order: 'asc' | 'desc';
}