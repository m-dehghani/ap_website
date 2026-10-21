import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProductCard, { type ShopProductCardData } from '@/components/shop/ProductCard';
import { readShopFavorites } from '@/lib/shop-cart';

export default function ShopFavoritesPage() {
  const [products, setProducts] = useState<ShopProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const slugs = readShopFavorites();
    void Promise.all(
      slugs.map(async (slug) => {
        const response = await fetch(`/api/shop/products/${encodeURIComponent(slug)}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.product as ShopProductCardData;
      }),
    )
      .then((results) => {
        if (active) setProducts(results.filter((product): product is ShopProductCardData => Boolean(product)));
      })
      .catch((error: unknown) => {
        console.error('Shop favorites load failed:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Layout title="علاقه‌مندی‌های فروشگاه">
      <section className="container-custom py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">علاقه‌مندی‌های این دستگاه</h1>
        <p className="mt-2 text-slate-600">فهرست علاقه‌مندی‌ها فقط در همین مرورگر ذخیره می‌شود.</p>
        {loading ? (
          <p role="status" className="py-16 text-center">در حال بارگذاری...</p>
        ) : products.length ? (
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center">
            <p>هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
            <Link href="/shop" className="mt-4 inline-block font-semibold text-primary-700 underline">مشاهده فروشگاه</Link>
          </div>
        )}
      </section>
    </Layout>
  );
}
