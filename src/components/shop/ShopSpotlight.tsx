import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProductCard, { type ShopProductCardData } from '@/components/shop/ProductCard';

export default function ShopSpotlight() {
  const [products, setProducts] = useState<ShopProductCardData[]>([]);

  useEffect(() => {
    let active = true;
    void fetch('/api/shop/products?featured=true&sort=recent')
      .then(async (response) => {
        if (!response.ok) throw new Error('Featured shop products unavailable');
        const data = await response.json();
        if (active) setProducts(data.products.slice(0, 6));
      })
      .catch((error: unknown) => {
        console.error('Homepage shop products error:', error);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-primary-950 py-16 text-white md:py-24" aria-labelledby="shop-spotlight-title">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="container-custom relative">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <div>
            <p className="font-semibold text-primary-300">فروشگاه آکادمی</p>
            <h2 id="shop-spotlight-title" className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
              برای بازی، آماده شو
            </h2>
            <p className="mt-3 max-w-xl text-slate-300">
              کفش، لباس و تجهیزات منتخب فوتبال؛ هر چیزی که برای تمرین بعدی لازم داری.
            </p>
          </div>
          <Link href="/shop" className="btn btn-primary px-6 py-3">
            دیدن همه محصولات
          </Link>
        </div>
        {products.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div key={product.id} className="text-slate-900">
                <ProductCard product={product} eagerImage={index === 0} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
