// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/preferences/theme';
import { requireSession } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({ requireSession: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const mockPrisma = {
  user: { update: vi.fn() },
  coach: { update: vi.fn() },
};

const request = (body: unknown, method = 'PATCH') =>
  ({ method, body }) as never;
const response = () =>
  ({
    setHeader: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    setHeader: ReturnType<typeof vi.fn>;
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('/api/preferences/theme', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
    vi.mocked(requireSession).mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
      source: 'user',
    });
    mockPrisma.user.update.mockResolvedValue({ themePreference: 'dark' });
    mockPrisma.coach.update.mockResolvedValue({ themePreference: 'dark' });
  });

  it('stores the selected theme for an authenticated user', async () => {
    const res = response();

    await handler(request({ themePreference: 'dark' }), res as never);

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'student-1' },
      data: { themePreference: 'dark' },
      select: { themePreference: true },
    });
    expect(mockPrisma.coach.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ themePreference: 'dark' });
  });

  it('stores the selected theme for an authenticated coach', async () => {
    vi.mocked(requireSession).mockResolvedValue({
      id: 'coach-1',
      role: 'COACH',
      source: 'coach',
    });
    const res = response();

    await handler(request({ themePreference: 'light' }), res as never);

    expect(mockPrisma.coach.update).toHaveBeenCalledWith({
      where: { id: 'coach-1' },
      data: { themePreference: 'light' },
      select: { themePreference: true },
    });
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects invalid theme preferences without updating the database', async () => {
    const res = response();

    await handler(request({ themePreference: 'sepia' }), res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.coach.update).not.toHaveBeenCalled();
  });

  it('returns the authentication response without updating a guest preference', async () => {
    vi.mocked(requireSession).mockResolvedValue(null);
    const res = response();

    await handler(request({ themePreference: 'dark' }), res as never);

    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.coach.update).not.toHaveBeenCalled();
  });

  it('rejects unsupported methods', async () => {
    const res = response();

    await handler(request({ themePreference: 'dark' }, 'GET'), res as never);

    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'PATCH');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(requireSession).not.toHaveBeenCalled();
  });
});
