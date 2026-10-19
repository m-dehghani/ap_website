export * from './coachRepository';
export * from './programRepository';
export * from './registrationRepository';
export * from './sessionRepository';

// Repository instances (singleton)
import { createCoachRepository } from './coachRepository';
import { createProgramRepository } from './programRepository';
import { createRegistrationRepository } from './registrationRepository';
import { createSessionRepository } from './sessionRepository';

export const coachRepository = createCoachRepository();
export const programRepository = createProgramRepository();
export const registrationRepository = createRegistrationRepository();
export const sessionRepository = createSessionRepository();