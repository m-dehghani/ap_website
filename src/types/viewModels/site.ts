/**
 * Site View Models
 * Presentation layer models for site-wide data
 */

export interface OpeningHourViewModel {
  id: string;
  days: string;
  hours: string;
}

export interface SocialLinkViewModel {
  id: string;
  name: string;
  url: string;
  icon: string;
}

export interface SiteInfoViewModel {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  privacyEmail: string | null;
  address: string;
  city: string;
  foundedYear: number | null;
  officeHours: OpeningHourViewModel[];
  trainingHours: OpeningHourViewModel[];
  socialLinks: SocialLinkViewModel[];
  programLinks: { id: string; name: string; ageRange: string }[];
}

export function toOpeningHourViewModel(hour: Record<string, any>): OpeningHourViewModel {
  return {
    id: hour.id,
    days: hour.days,
    hours: hour.hours,
  };
}

export function toSocialLinkViewModel(link: Record<string, any>): SocialLinkViewModel {
  return {
    id: link.id,
    name: link.name,
    url: link.url,
    icon: link.icon,
  };
}

export function toSiteInfoViewModel(siteInfo: Record<string, any>): SiteInfoViewModel {
  return {
    name: siteInfo.name,
    tagline: siteInfo.tagline,
    description: siteInfo.description,
    phone: siteInfo.phone,
    email: siteInfo.email,
    privacyEmail: siteInfo.privacyEmail,
    address: siteInfo.address,
    city: siteInfo.city,
    foundedYear: siteInfo.foundedYear,
    officeHours: siteInfo.officeHours?.map(toOpeningHourViewModel) || [],
    trainingHours: siteInfo.trainingHours?.map(toOpeningHourViewModel) || [],
    socialLinks: siteInfo.socialLinks?.map(toSocialLinkViewModel) || [],
    programLinks: siteInfo.programLinks || [],
  };
}