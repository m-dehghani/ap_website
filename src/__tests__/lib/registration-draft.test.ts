import { describe, expect, it } from 'vitest';
import {
  readRegistrationDraft,
  saveRegistrationDraft,
} from '@/lib/registration-draft';

describe('registration draft storage', () => {
  it('restores non-sensitive fields without retaining passwords or health details', () => {
    const storage = window.localStorage;

    saveRegistrationDraft(storage, {
      firstName: 'علی',
      email: 'ali@example.com',
      password: 'a-secret-password',
      medicalConditions: 'private medical details',
      emergencyContact: '09120000000',
      terms: true,
    });

    expect(readRegistrationDraft(storage)).toEqual({
      firstName: 'علی',
      email: 'ali@example.com',
    });
    expect(storage.getItem('ap-registration-draft')).not.toContain(
      'a-secret-password',
    );
    expect(storage.getItem('ap-registration-draft')).not.toContain(
      'private medical details',
    );
  });

  it('ignores malformed and unexpected stored draft data', () => {
    const storage = window.localStorage;
    storage.setItem('ap-registration-draft', '{broken');
    expect(readRegistrationDraft(storage)).toBeNull();

    storage.setItem(
      'ap-registration-draft',
      JSON.stringify({ password: 'secret', unknown: 'value' }),
    );
    expect(readRegistrationDraft(storage)).toEqual({});
  });
});
