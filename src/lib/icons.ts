/**
 * Icon mapping utility
 * Maps string icon names to actual React components
 */

import {
  UserGroupIcon,
  TrophyIcon,
  AcademicCapIcon,
  HeartIcon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CogIcon,
  CalendarDaysIcon,
  PlayIcon,
  CameraIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

export const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  UserGroupIcon,
  TrophyIcon,
  AcademicCapIcon,
  HeartIcon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CogIcon,
  CalendarDaysIcon,
  PlayIcon,
  CameraIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
};

export function getIcon(iconName: string, className?: string): React.ReactElement {
  const IconComponent = ICON_MAP[iconName] || SparklesIcon;
  return React.createElement(IconComponent, { className });
}
