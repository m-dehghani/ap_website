/**
 * Coach View Models
 * Presentation layer models for coach data
 */

export interface CoachViewModel {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string | null;
  specialization: string;
  experience: number;
  bio: string | null;
  quote: string | null;
  certifications: string[];
  achievements: string[];
  rating: number;
  studentsCount: number;
  image: string | null;
  instagram: string | null;
  twitter: string | null;
  programs: { id: string; name: string }[];
}

export interface CoachCardViewModel {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string | null;
  specialization: string;
  experience: number;
  rating: number;
  studentsCount: number;
  image: string | null;
  isSelected: boolean;
}

export interface CoachSpotlightViewModel {
  coaches: CoachViewModel[];
  currentIndex: number;
}

export function toCoachViewModel(coach: any): CoachViewModel {
  return {
    id: coach.id,
    firstName: coach.firstName,
    lastName: coach.lastName,
    fullName: `${coach.firstName} ${coach.lastName}`,
    title: coach.title,
    specialization: coach.specialization,
    experience: coach.experience,
    bio: coach.bio,
    quote: coach.quote,
    certifications: coach.certifications || [],
    achievements: coach.achievements || [],
    rating: coach.rating || 0,
    studentsCount: coach.studentsCount || 0,
    image: coach.image,
    instagram: coach.instagram,
    twitter: coach.twitter,
    programs:
      coach.programs?.map((p: any) => ({ id: p.id, name: p.name })) || [],
  };
}

export function toCoachCardViewModel(
  coach: Record<string, any>,
  isSelected = false
): CoachCardViewModel {
  return {
    id: coach.id,
    firstName: coach.firstName,
    lastName: coach.lastName,
    fullName: `${coach.firstName} ${coach.lastName}`,
    title: coach.title,
    specialization: coach.specialization,
    experience: coach.experience,
    rating: coach.rating || 0,
    studentsCount: coach.studentsCount || 0,
    image: coach.image,
    isSelected,
  };
}