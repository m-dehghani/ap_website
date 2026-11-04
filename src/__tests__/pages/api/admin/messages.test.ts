// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/admin/messages';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/auth', () => ({
  authorizeAdmin: vi.fn().mockResolvedValue(true),
}));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const createRequest = (method: string, body?: unknown) =>
  ({ method, query: {}, body }) as never;
const createResponse = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
  };

describe('/api/admin/messages', () => {
  const prisma = {
    contactMessage: { findMany: vi.fn(), updateMany: vi.fn() },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.contactMessage.findMany.mockResolvedValue([]);
    prisma.contactMessage.updateMany.mockResolvedValue({ count: 1 });
  });

  it.each(['GET', 'PATCH'])('requires admin authorization for %s', async (method) => {
    vi.mocked(authorizeAdmin).mockResolvedValue(false);
    const res = createResponse();

    await handler(
      createRequest(method, {
        id: 'message-1',
        status: 'READ',
        expectedStatus: 'NEW',
      }),
      res as never,
    );

    expect(prisma.contactMessage.findMany).not.toHaveBeenCalled();
    expect(prisma.contactMessage.updateMany).not.toHaveBeenCalled();
  });

  it('lists inbox fields in newest-first order', async () => {
    const res = createResponse();

    await handler(createRequest('GET'), res as never);

    expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        message: true,
        status: true,
        createdAt: true,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it.each(['NEW', 'READ', 'ANSWERED'])('accepts the %s status', async (status) => {
    const res = createResponse();

    await handler(
      createRequest('PATCH', {
        id: 'message-1',
        status,
        expectedStatus: 'NEW',
      }),
      res as never,
    );

    expect(prisma.contactMessage.updateMany).toHaveBeenCalledWith({
      where: { id: 'message-1', status: 'NEW' },
      data: { status },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects unsupported statuses without writing', async () => {
    const res = createResponse();

    await handler(
      createRequest('PATCH', {
        id: 'message-1',
        status: 'DELETED',
        expectedStatus: 'NEW',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.contactMessage.updateMany).not.toHaveBeenCalled();
  });

  it('rejects stale updates when the message status changed concurrently', async () => {
    prisma.contactMessage.updateMany.mockResolvedValue({ count: 0 });
    const res = createResponse();

    await handler(
      createRequest('PATCH', {
        id: 'message-1',
        status: 'READ',
        expectedStatus: 'NEW',
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(409);
  });
});
