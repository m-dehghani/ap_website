import { beforeEach, describe, expect, it, vi } from 'vitest';
import productsHandler from '@/pages/api/admin/shop/products';
import productHandler from '@/pages/api/admin/shop/products/[id]';
import { authorizeShopManager } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { areValidImageReferences } from '@/lib/uploads';
import { deleteUnreferencedMedia, isValidVideoReference } from '@/lib/media';

vi.mock('@/lib/auth', () => ({ authorizeShopManager: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));
vi.mock('@/lib/uploads', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/uploads')>()),
  areValidImageReferences: vi.fn(),
}));
vi.mock('@/lib/media', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/media')>()),
  deleteUnreferencedMedia: vi.fn(),
  isValidVideoReference: vi.fn(),
}));

const videoUrl = '/uploads/550e8400-e29b-41d4-a716-446655440000.mp4';
const previousVideoUrl = '/uploads/550e8400-e29b-41d4-a716-446655440001.mp4';

const productInput = (overrides: Record<string, unknown> = {}) => ({
  slug: 'academy-shirt',
  name: 'پیراهن آکادمی',
  category: 'لباس',
  description: 'توضیحات محصول',
  images: [],
  price: 250000,
  isActive: true,
  isComingSoon: false,
  featured: false,
  variants: [{ sku: 'shirt-small', stock: 5 }],
  uploadedVideoUrl: videoUrl,
  aparatVideoUrl: 'https://www.aparat.com/v/clip123',
  ...overrides,
});

const request = (
  method: string,
  body: unknown,
  query: Record<string, string> = {},
) => ({ method, body, query }) as never;

const response = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
  }) as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
  };

describe('admin shop product video fields', () => {
  const prisma = {
    $transaction: vi.fn(),
    shopProduct: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    shopVariant: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authorizeShopManager).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    vi.mocked(areValidImageReferences).mockResolvedValue(true);
    vi.mocked(isValidVideoReference).mockResolvedValue(true);
    vi.mocked(deleteUnreferencedMedia).mockResolvedValue();
  });

  it('persists validated uploaded and Aparat references on product creation', async () => {
    prisma.shopProduct.create.mockResolvedValue({
      id: 'product-1',
      uploadedVideoUrl: videoUrl,
      aparatVideoUrl: 'https://www.aparat.com/v/clip123',
    });
    const res = response();

    await productsHandler(request('POST', productInput()), res as never);

    expect(isValidVideoReference).toHaveBeenCalledWith(
      prisma,
      videoUrl,
    );
    expect(prisma.shopProduct.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          uploadedVideoUrl: videoUrl,
          aparatVideoUrl: 'https://www.aparat.com/v/clip123',
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('normalizes empty video fields from the default shop form payload', async () => {
    prisma.shopProduct.create.mockResolvedValue({
      id: 'product-1',
      uploadedVideoUrl: null,
      aparatVideoUrl: null,
    });
    const res = response();

    await productsHandler(
      request(
        'POST',
        productInput({ uploadedVideoUrl: '', aparatVideoUrl: '' }),
      ),
      res as never,
    );

    expect(isValidVideoReference).toHaveBeenCalledWith(prisma, null);
    expect(prisma.shopProduct.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          uploadedVideoUrl: null,
          aparatVideoUrl: null,
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('rejects hostile Aparat references before writing a product', async () => {
    const res = response();

    await productsHandler(
      request(
        'POST',
        productInput({
          aparatVideoUrl: 'https://www.aparat.com.evil.example/v/clip123',
        }),
      ),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.shopProduct.create).not.toHaveBeenCalled();
    expect(isValidVideoReference).not.toHaveBeenCalled();
  });

  it('replaces product video references and removes the old asset after saving', async () => {
    const updatedProduct = { id: 'product-1', uploadedVideoUrl: videoUrl };
    prisma.shopProduct.findUnique
      .mockResolvedValueOnce({
        id: 'product-1',
        images: [],
        uploadedVideoUrl: previousVideoUrl,
      })
      .mockResolvedValueOnce(updatedProduct);
    prisma.$transaction.mockImplementation(async (callback) =>
      callback({
        shopProduct: {
          findUnique: vi.fn().mockResolvedValue({ id: 'product-1' }),
          update: vi.fn().mockResolvedValue(updatedProduct),
        },
        shopVariant: {
          findFirst: vi.fn().mockResolvedValue(null),
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          upsert: vi.fn().mockResolvedValue({}),
        },
      } as never),
    );
    const res = response();

    await productHandler(
      request('PUT', productInput(), { id: 'product-1' }),
      res as never,
    );

    expect(isValidVideoReference).toHaveBeenCalledWith(
      prisma,
      videoUrl,
      [previousVideoUrl],
    );
    expect(deleteUnreferencedMedia).toHaveBeenCalledWith(
      prisma,
      previousVideoUrl,
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
