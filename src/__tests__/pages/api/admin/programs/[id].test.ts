import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/admin/programs/[id]';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

vi.mock('@/lib/auth', () => ({
  authorizeAdmin: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/db', () => ({
  getPrisma: vi.fn(),
}));

const createMockReq = (overrides = {}) => ({
  method: 'GET',
  query: { id: 'program-1' },
  body: {},
  headers: {},
  ...overrides,
});

const createMockRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  end: vi.fn().mockReturnThis(),
});

describe('/api/admin/programs/[id]', () => {
  const mockPrisma = {
    program: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(mockPrisma as never);
  });

  it('returns an existing program with its schedule', async () => {
    const program = { id: 'program-1', schedule: [] };
    mockPrisma.program.findUnique.mockResolvedValue(program);
    const res = createMockRes();

    await handler(createMockReq(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(program);
  });

  it('replaces schedules atomically when updating a program', async () => {
    const input = {
      name: 'برنامه به‌روزشده',
      isActive: false,
      schedule: [{ day: 'یک‌شنبه', time: '18:00', displayOrder: 3 }],
    };
    const updatedProgram = { id: 'program-1', ...input };
    mockPrisma.program.update.mockResolvedValue(updatedProgram);
    const res = createMockRes();

    await handler(createMockReq({ method: 'PUT', body: input }), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedProgram);
    expect(mockPrisma.program.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'program-1' },
        data: expect.objectContaining({
          isActive: false,
          schedule: {
            deleteMany: {},
            create: [{ day: 'یک‌شنبه', time: '18:00', displayOrder: 3 }],
          },
        }),
      }),
    );
  });

  it('deletes a program and returns an empty successful response', async () => {
    mockPrisma.program.delete.mockResolvedValue({ id: 'program-1' });
    const res = createMockRes();

    await handler(createMockReq({ method: 'DELETE' }), res);

    expect(mockPrisma.program.delete).toHaveBeenCalledWith({
      where: { id: 'program-1' },
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('returns 404 when the program does not exist', async () => {
    mockPrisma.program.findUnique.mockResolvedValue(null);
    const res = createMockRes();

    await handler(createMockReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Program not found' });
  });
});
