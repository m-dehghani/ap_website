const STORAGE_KEY = 'ap-registration-draft';

const draftFields = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'dateOfBirth',
  'program',
  'experience',
  'parentName',
  'parentEmail',
] as const;

export type RegistrationDraft = Partial<
  Record<(typeof draftFields)[number], string>
>;

export function readRegistrationDraft(
  storage: Pick<Storage, 'getItem'>,
): RegistrationDraft | null {
  try {
    const rawDraft = storage.getItem(STORAGE_KEY);
    if (!rawDraft) return null;
    const parsed: unknown = JSON.parse(rawDraft);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    return Object.fromEntries(
      draftFields.flatMap((field) => {
        const value = (parsed as Record<string, unknown>)[field];
        return typeof value === 'string' ? [[field, value]] : [];
      }),
    );
  } catch {
    return null;
  }
}

export function saveRegistrationDraft(
  storage: Pick<Storage, 'setItem'>,
  values: Record<string, unknown>,
): boolean {
  const draft = Object.fromEntries(
    draftFields.flatMap((field) => {
      const value = values[field];
      return typeof value === 'string' ? [[field, value]] : [];
    }),
  );

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearRegistrationDraft(
  storage: Pick<Storage, 'removeItem'>,
): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Registration succeeds even when browser storage is unavailable.
  }
}
