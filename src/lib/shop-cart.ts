import { z } from 'zod';

export interface ShopCartLine {
  variantId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  size: string | null;
  color: string | null;
  price: number;
  quantity: number;
}

const CART_KEY = 'ap-shop-cart';
const FAVORITES_KEY = 'ap-shop-favorites';
const cartLineSchema = z.object({
  variantId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  image: z.string().nullable(),
  size: z.string().nullable(),
  color: z.string().nullable(),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1).max(20),
});

export function subscribeShopStorage(key: string, onChange: () => void) {
  const handleCustomEvent = (event: Event) => {
    if (
      event instanceof CustomEvent &&
      typeof event.detail === 'string' &&
      event.detail !== key
    ) {
      return;
    }
    onChange();
  };
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === key || event.key === null) onChange();
  };
  window.addEventListener('ap-shop-storage', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);
  return () => {
    window.removeEventListener('ap-shop-storage', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export function getShopCartSnapshot() {
  return getStorageSnapshot(CART_KEY);
}

export function getShopFavoritesSnapshot() {
  return getStorageSnapshot(FAVORITES_KEY);
}

function getStorageSnapshot(key: string) {
  try {
    return localStorage.getItem(key) ?? '[]';
  } catch (error) {
    console.error(`Could not access shop browser storage (${key}):`, error);
    return '[]';
  }
}

export function parseShopCartSnapshot(snapshot: string): ShopCartLine[] {
  try {
    const value: unknown = JSON.parse(snapshot);
    if (!Array.isArray(value)) return [];
    return value.flatMap((entry) => {
      const result = cartLineSchema.safeParse(entry);
      return result.success ? [result.data] : [];
    });
  } catch (error) {
    console.error('Could not parse shop cart:', error);
    return [];
  }
}

export function parseShopFavoritesSnapshot(snapshot: string): string[] {
  try {
    const value: unknown = JSON.parse(snapshot);
    return Array.isArray(value)
      ? value.filter((entry): entry is string => typeof entry === 'string')
      : [];
  } catch (error) {
    console.error('Could not parse shop favorites:', error);
    return [];
  }
}

function writeList<T>(key: string, value: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('ap-shop-storage', { detail: key }));
  } catch (error) {
    console.error(`Could not save shop browser storage (${key}):`, error);
    throw new Error('ذخیره اطلاعات فروشگاه در این مرورگر ممکن نیست');
  }
}

export function readShopCart(): ShopCartLine[] {
  return parseShopCartSnapshot(getShopCartSnapshot());
}

export function saveShopCart(lines: ShopCartLine[]) {
  writeList(CART_KEY, lines);
}

export function readShopFavorites(): string[] {
  return parseShopFavoritesSnapshot(getShopFavoritesSnapshot());
}

export function toggleShopFavorite(slug: string): string[] {
  const favorites = readShopFavorites();
  const updated = favorites.includes(slug)
    ? favorites.filter((item) => item !== slug)
    : [...favorites, slug];
  writeList(FAVORITES_KEY, updated);
  return updated;
}
