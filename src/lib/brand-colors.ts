export function normalizeClubColorClasses(classNames: string): string {
  return classNames.replaceAll('blue-', 'primary-');
}
