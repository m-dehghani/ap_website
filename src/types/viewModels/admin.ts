import type { Coach, CoachProgram } from '@/types/domain/coach';
import type { Program, Schedule } from '@/types/domain/program';
import type { PaginationMeta } from '@/types/api/response';

export interface AdminCoachListItem
  extends Omit<Coach, 'createdAt' | 'updatedAt' | 'programs'> {
  createdAt: string;
  updatedAt: string;
  programs: Pick<CoachProgram, 'id' | 'name'>[];
}

export interface AdminProgramListItem
  extends Omit<Program, 'createdAt' | 'updatedAt' | 'coach' | 'schedule'> {
  createdAt: string;
  updatedAt: string;
  coach: Pick<Coach, 'id' | 'firstName' | 'lastName'> | null;
  schedule: Pick<Schedule, 'id' | 'day' | 'time'>[];
}

export interface AdminRegistrationViewModel {
  id: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  experienceLevel: string | null;
  parentName: string | null;
  parentEmail: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  medicalConditions: string | null;
  registeredAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    birthDate: string | null;
  };
  program: {
    id: string;
    name: string;
    price: number;
    coach: { firstName: string; lastName: string } | null;
  };
  payments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }[];
}

export interface AdminSessionListItem {
  id: string;
  name: string;
  description: string | null;
  date: string;
  duration: number;
  location: string;
  maxCapacity: number;
  status: string;
  createdAt: string;
  program: { id: string; name: string } | null;
  coach: { id: string; firstName: string; lastName: string } | null;
  attendance: {
    id: string;
    status: string;
    user: { firstName: string; lastName: string };
  }[];
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
