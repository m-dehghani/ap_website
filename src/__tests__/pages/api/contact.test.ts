// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/contact';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const createRequest = (body: unknown) =>
  ({ method: 'POST', body }) as never;
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

describe('/api/contact', () => {
  const prisma = { contactMessage: { create: vi.fn() } };
  const validSubmission = {
    firstName: 'علی',
    lastName: 'محمدی',
    email: 'ali@example.com',
    phone: '09120000000',
    message: 'برای ثبت نام اطلاعات می‌خواستم.',
    company: '',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.contactMessage.create.mockResolvedValue({ id: 'message-1' });
  });

  it('rejects invalid public submissions without writing', async () => {
    const res = createResponse();

    await handler(
      createRequest({ ...validSubmission, email: 'not-an-email' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.contactMessage.create).not.toHaveBeenCalled();
  });

  it('persists validated public submissions with NEW status', async () => {
    const res = createResponse();

    await handler(createRequest(validSubmission), res as never);

    expect(prisma.contactMessage.create).toHaveBeenCalledWith({
      data: {
        firstName: 'علی',
        lastName: 'محمدی',
        email: 'ali@example.com',
        phone: '09120000000',
        message: 'برای ثبت نام اطلاعات می‌خواستم.',
      },
      select: { id: true },
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('reports persistence failures without logging the submitted message', async () => {
    const errorLog = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    prisma.contactMessage.create.mockRejectedValue(
      new Error(validSubmission.message),
    );
    const res = createResponse();

    try {
      await handler(createRequest(validSubmission), res as never);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(errorLog).toHaveBeenCalledWith(
        'Contact message persistence failed:',
        'Error',
      );
      expect(JSON.stringify(errorLog.mock.calls)).not.toContain(
        validSubmission.message,
      );
    } finally {
      errorLog.mockRestore();
    }
  });

  it('rejects honeypot submissions without persisting or logging content', async () => {
    const errorLog = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const outputLog = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    const res = createResponse();

    await handler(
      createRequest({ ...validSubmission, company: 'bot content' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.contactMessage.create).not.toHaveBeenCalled();
    expect(errorLog).not.toHaveBeenCalled();
    expect(outputLog).not.toHaveBeenCalled();
    errorLog.mockRestore();
    outputLog.mockRestore();
  });
});
