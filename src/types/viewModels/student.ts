import type { AdminRegistrationViewModel } from './admin';

export type StudentRegistrationViewModel = Pick<
  AdminRegistrationViewModel,
  | 'id'
  | 'status'
  | 'totalAmount'
  | 'paidAmount'
  | 'experienceLevel'
  | 'parentName'
  | 'parentEmail'
  | 'emergencyContactName'
  | 'emergencyContactPhone'
  | 'medicalConditions'
> & {
  payments: Pick<AdminRegistrationViewModel['payments'][number], 'status'>[];
  program: Pick<AdminRegistrationViewModel['program'], 'id' | 'name' | 'coach'>;
};

export type StudentRegistrationProfileFormValues = {
  experienceLevel: string;
  parentName: string;
  parentEmail: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions: string;
};

export interface StudentDashboardStudentViewModel {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  birthDate: string | null;
  marketingOptIn: boolean;
  registrations: StudentRegistrationViewModel[];
}

export interface StudentDashboardProgramViewModel {
  id: string;
  name: string;
  price: number;
  minAge: number;
  maxAge: number;
}

export interface StudentDashboardViewModel {
  student: StudentDashboardStudentViewModel;
  programs: StudentDashboardProgramViewModel[];
}

export interface StudentProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  marketingOptIn: boolean;
}
