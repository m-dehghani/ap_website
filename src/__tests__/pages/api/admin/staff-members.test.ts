import { beforeEach, describe, expect, it, vi } from 'vitest';
import collectionHandler from '@/pages/api/admin/content/staff-members';
import itemHandler from '@/pages/api/admin/content/staff-members/[id]';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import {
  deleteUnreferencedImage,
  isValidImageReference,
} from '@/lib/uploads';

vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));
vi.mock('@/lib/auth', () => ({ authorizeAdmin: vi.fn() }));
vi.mock('@/lib/uploads', () => ({
  deleteUnreferencedImage: vi.fn(),
  isValidImageReference: vi.fn(),
}));

const member = {
  id: 'staff-1',
  name: 'عضو تیم',
  role: 'مدیر',
  bio: 'معرفی',
  initials: 'م',
  image: '/api/uploads/550e8400-e29b-41d4-a716-446655440000.png',
  isActive: true,
  displayOrder: 0,
};

const prisma = {
  staffMember: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

function response() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
}

describe('staff-member photo persistence', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(isValidImageReference).mockResolvedValue(true);
    vi.mocked(prisma.staffMember.create).mockResolvedValue(member as never);
    vi.mocked(prisma.staffMember.update).mockResolvedValue(member as never);
    vi.mocked(prisma.staffMember.delete).mockResolvedValue(member as never);
  });

  it('saves an uploaded image when an admin creates a team member', async () => {
    const res = response();
    await collectionHandler(
      {
        method: 'POST',
        body: { ...member },
        query: {},
      } as never,
      res as never,
    );

    expect(isValidImageReference).toHaveBeenCalledWith(
      prisma,
      member.image,
    );
    expect(prisma.staffMember.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ image: member.image }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('rejects invalid photo references without updating the staff record', async () => {
    vi.mocked(prisma.staffMember.findUnique).mockResolvedValue(member as never);
    vi.mocked(isValidImageReference).mockResolvedValue(false);
    const res = response();

    await itemHandler(
      {
        method: 'PUT',
        query: { id: member.id },
        body: { ...member, image: 'https://example.com/image.jpg' },
      } as never,
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.staffMember.update).not.toHaveBeenCalled();
  });

  it('preserves the current photo when an update omits the image field', async () => {
    vi.mocked(prisma.staffMember.findUnique).mockResolvedValue(member as never);
    const res = response();

    await itemHandler(
      {
        method: 'PUT',
        query: { id: member.id },
        body: { name: member.name, role: member.role },
      } as never,
      res as never,
    );

    expect(prisma.staffMember.update).toHaveBeenCalledWith({
      where: { id: member.id },
      data: expect.objectContaining({ image: member.image }),
    });
    expect(deleteUnreferencedImage).not.toHaveBeenCalled();
  });

  it('removes replaced photos only after the record points to its new image', async () => {
    vi.mocked(prisma.staffMember.findUnique).mockResolvedValue({
      ...member,
      image: '/api/uploads/660e8400-e29b-41d4-a716-446655440001.png',
    } as never);
    const res = response();

    await itemHandler(
      {
        method: 'PUT',
        query: { id: member.id },
        body: { ...member },
      } as never,
      res as never,
    );

    expect(prisma.staffMember.update).toHaveBeenCalledWith({
      where: { id: member.id },
      data: expect.objectContaining({ image: member.image }),
    });
    expect(deleteUnreferencedImage).toHaveBeenCalledWith(
      prisma,
      '/api/uploads/660e8400-e29b-41d4-a716-446655440001.png',
    );
  });
});
