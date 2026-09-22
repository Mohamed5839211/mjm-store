import { fetchProductsServer, fetchCategoriesServer } from '@/lib/api/server-catalog';
import { categoryIcon } from '@/lib/maps';
import { toNumber } from '@/types/common';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Search, ChevronDown, ArrowLeft } from 'lucide-react';

export const revalidate = 300;

export default async function ShopPage() {
  let products: Awaited<ReturnType<typeof fetchProductsServer>>['items'] = [];
  let categories: Awaited<ReturnType<typeof fetchCategoriesServer>> = [];
  let fetchError = false;
  
  try {
    const [productsData, categoriesData] = await Promise.all([
      fetchProductsServer({ limit: 100 }),
      fetchCategoriesServer(),
    ]);
    products = productsData.items;
    categories = categoriesData;
  } catch (error) {
    fetchError = true;
    console.error('Failed to fetch shop data:', error);
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-background overflow-x-hidden">
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 z-10 text-right space-y-6">
          <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-sm text-slate-500 dark:text-muted mb-8 justify-end">
            <Link href="/" className="hover:text-primary dark:hover:text-secondary transition-colors">الرئيسية</Link>
            <ChevronDown size={14} className="rotate-90" />
            <span className="text-primary dark:text-ink font-bold">جميع المنتجات</span>
          </nav>
          <div className="max-w-4xl mr-0 ml-auto space-y-4">
            <h1 className="text-4xl lg:text-6xl font-black text-primary dark:text-ink leading-tight tracking-tighter">
              تسوق <span className="text-bronze dark:text-secondary italic">جميع المنتجات</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-muted font-medium max-w-2xl">
              اكتشف مجموعتنا الكاملة من حلول التغليف، النظافة، والضيافة.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24">
        {fetchError ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-muted font-bold">حدث خطأ في تحميل المنتجات. يرجى المحاولة مرة أخرى.</p>
          </div>
        ) : (
          <>
            {/* Categories */}
            {categories.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5 mb-16">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className="group flex flex-col h-full rounded-[28px] bg-white dark:bg-card border border-primary/5 dark:border-white/10 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-secondary/10 hover:-translate-y-1.5 hover:border-secondary/40 transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-40 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
                      {cat.image && (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          width={120}
                          height={120}
                          className="h-28 w-auto object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-3 p-4">
                      <span className="font-black text-primary dark:text-ink group-hover:text-secondary transition-colors truncate">{cat.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-12">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ProductCard({ product }: { product: Awaited<ReturnType<typeof fetchProductsServer>>['items'][0] }) {
  const price = toNumber(product.price);
  const discountPrice = product.discountPrice != null ? toNumber(product.discountPrice) : null;
  
  return (
    <article className="bg-white dark:bg-card rounded-[32px] p-5 shadow-xl shadow-primary/5 border border-primary/5 dark:border-white/10 group relative transition-colors duration-500 hover:border-secondary/20 hover:shadow-2xl hover:shadow-secondary/10 transform-gpu">
      {product.totalSold > 100 && (
        <div className="absolute top-6 right-6 z-10 bg-secondary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-secondary/20 uppercase tracking-tighter">
          الأكثر مبيعاً
        </div>
      )}
      
      <Link href={`/products/${product.id}`} className="block aspect-square rounded-2xl mb-6 overflow-hidden bg-gray-50 dark:bg-white/5 relative group-hover:bg-primary/5 transition-colors duration-500">
        <div className="w-full h-full flex items-center justify-center text-primary/10 dark:text-ink/10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
          {product.images?.[0]?.url ? (
            <Image 
              src={product.images[0].url} 
              alt={product.name} 
              width={300} 
              height={300} 
              className="w-full h-full object-contain p-4" 
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
          ) : (
            <Package size={80} strokeWidth={0.5} />
          )}
        </div>
      </Link>

      <div className="space-y-3">
        <div className="text-[10px] font-bold text-bronze dark:text-secondary uppercase tracking-widest">
          {product.category?.name || "منتج MJM"}
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-primary dark:text-ink hover:text-secondary transition-colors line-clamp-2 min-h-[3rem] leading-snug">
            {product.name}
          </h3>
        </Link>
        <div className="flex justify-between items-end pt-2 border-t border-primary/5 dark:border-white/10">
          <div className="flex flex-col">
            {discountPrice && (
              <span className="text-xs text-gray-600 dark:text-muted line-through font-medium">{price.toLocaleString('ar-SA')} ر.س</span>
            )}
            <span className="text-xl font-black text-primary dark:text-ink">{(discountPrice || price).toLocaleString('ar-SA')} ر.س</span>
          </div>
        </div>
      </div>
    </article>
  );
}
