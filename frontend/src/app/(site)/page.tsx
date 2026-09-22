"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Package, Sparkles, ShieldCheck, BadgePercent, Phone, Truck, Factory } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import CategoryGrid from "@/components/home/CategoryGrid";
import HeroSlider from "@/components/home/HeroSlider";
import ProductCard from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer, staggerItem, shimmerEffect } from "@/lib/animations";
import { useProducts } from "@/hooks/queries/use-catalog";
import { toNumber } from "@/types/common";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function Home() {
  useDocumentTitle('الرئيسية');
  const { data: newData, isLoading: isLoadingNew } = useProducts({ limit: 4, sortBy: 'createdAt_desc' });
  const { data: bestData, isLoading: isLoadingBest } = useProducts({ limit: 4, sortBy: 'best_selling' });

  const newArrivals = newData?.items ?? [];
  const bestSellers = bestData?.items ?? [];

  const b2bRef = useRef(null);
  const { scrollYProgress: b2bScroll } = useScroll({ target: b2bRef, offset: ["start end", "end start"] });
  const b2bY = useTransform(b2bScroll, [0, 1], [100, -100]);

  return (
    <div className="-mt-36 lg:-mt-40 space-y-20 pb-20 overflow-hidden text-right" dir="rtl">
      <HeroSlider />

      {/* Why MJM? Section (Staggered Cards) */}
      <section className="container mx-auto px-4 py-20 relative">
        <div className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-primary/5 -z-10 rounded-b-[100px]" />
        
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16 space-y-4"
        >
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-black text-primary dark:text-ink">
            لماذا <span className="text-secondary relative">MJM؟<motion.div variants={shimmerEffect} initial="hidden" animate="visible" className="absolute bottom-0 left-0 w-full h-1 bg-secondary/30" /></span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 dark:text-muted max-w-2xl mx-auto text-lg font-medium">
            نحن لسنا مجرد متجر، نحن شريك نجاح ينمو معك عبر تقديم الأفضل دائماً.
          </motion.p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { title: "أسعار استثنائية", desc: "أفضل الأسعار التنافسية في السوق مع الحفاظ على أعلى معايير الجودة العالمية.", icon: BadgePercent, border: "border-blue-100 dark:border-blue-400/25 hover:border-blue-300 dark:hover:border-blue-400/40", shadow: "hover:shadow-blue-500/10", iconBg: "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300" },
            { title: "دعم فني استشاري", desc: "فريق متخصص متواجد على مدار الساعة لمساعدتك في اختيار أنسب الحلول.", icon: Phone, border: "border-amber-100 dark:border-amber-400/25 hover:border-amber-300 dark:hover:border-amber-400/40", shadow: "hover:shadow-amber-500/10", iconBg: "bg-amber-50 dark:bg-amber-500/15 text-amber-500 dark:text-amber-300" },
            { title: "أسطول لوجستي متكامل", desc: "شبكة نقل تغطي كافة أنحاء المملكة تضمن وصول طلباتك بأقصى سرعة وأمان.", icon: Truck, border: "border-emerald-100 dark:border-emerald-400/25 hover:border-emerald-300 dark:hover:border-emerald-400/40", shadow: "hover:shadow-emerald-500/10", iconBg: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" }
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -15, scale: 1.02 }}
              className={cn("bg-white dark:bg-card p-10 rounded-[40px] border-2 shadow-xl shadow-primary/5 transition-all duration-300 space-y-6 text-center group", item.border, item.shadow)}
            >
              <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto transition-transform duration-500 group-hover:rotate-12", item.iconBg)}>
                <item.icon size={40} />
              </div>
              <h3 className="text-2xl font-black text-primary dark:text-ink">{item.title}</h3>
              <p className="text-gray-500 dark:text-muted leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories Layer */}
      <CategoryGrid />

      {/* Dynamic Products Sections: New Arrivals & Best Sellers */}
      <section className="container mx-auto px-4 py-24 space-y-32">
        
        {/* New Arrivals Block */}
        <div className="space-y-16">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-primary/5 dark:border-white/10 pb-8"
          >
            <div className="space-y-4 text-right">
              <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-black text-primary dark:text-ink">
                وصل حديثاً <span className="text-secondary italic">أحدث ما وصلنا</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500 dark:text-muted max-w-xl text-lg font-medium">
                اكتشف آخر الابتكارات في عالم التغليف والضيافة، مختارة بعناية لتمزج بين العملية والأناقة.
              </motion.p>
            </div>
            <motion.div variants={fadeUp}>
              <Link href="/shop?sortBy=createdAt_desc" className="group flex items-center gap-3 text-primary dark:text-ink font-black uppercase tracking-widest text-sm hover:text-secondary transition-colors">
                عرض كل الجديد
                <div className="w-10 h-10 rounded-full border border-primary/10 dark:border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-[-45deg]">
                  <ArrowLeft size={18} />
                </div>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {isLoadingNew ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-[32px] w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : newArrivals.length > 0 ? (
              newArrivals.map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={toNumber(product.price)}
                    discountPrice={product.discountPrice != null ? toNumber(product.discountPrice) : undefined}
                    category={product.category?.name ?? undefined}
                    image={product.images?.[0]?.url}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-gray-400 dark:text-muted font-bold italic">
                لا توجد منتجات حديثة حالياً
              </div>
            )}
          </motion.div>
        </div>

        {/* Best Sellers Block */}
        <div className="space-y-16 py-24 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-[60px] border border-white p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/20 to-transparent animate-shimmer" />
          
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="flex flex-col md:flex-row justify-between items-end gap-6"
          >
            <div className="space-y-4 text-right">
              <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-black text-primary dark:text-ink">
                الأكثر طلباً <span className="text-secondary italic">ثقة عملاؤنا</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500 dark:text-muted max-w-xl text-lg font-medium">
                المنتجات التي غيرت قواعد اللعبة لدى شركاؤنا. تمتع بأعلى مستويات الرضا والجودة.
              </motion.p>
            </div>
            <motion.div variants={fadeUp}>
              <Link href="/shop?sortBy=best_selling" className="group flex items-center gap-3 text-primary dark:text-ink font-black uppercase tracking-widest text-sm hover:text-secondary transition-colors">
                استكشف الأكثر مبيعاً
                <div className="w-10 h-10 rounded-full border border-primary/10 dark:border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-[-45deg]">
                  <ArrowLeft size={18} />
                </div>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {isLoadingBest ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-[32px] w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : bestSellers.length > 0 ? (
              bestSellers.map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={toNumber(product.price)}
                    discountPrice={product.discountPrice != null ? toNumber(product.discountPrice) : undefined}
                    category={product.category?.name ?? undefined}
                    image={product.images?.[0]?.url}
                    isBestSeller={true}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-gray-400 dark:text-muted font-bold italic">
                قريباً... قائمة الأكثر مبيعاً
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* B2B Interactive Widget (Scroll Parallax) */}
      <section ref={b2bRef} className="container mx-auto px-4 py-10 perspective-[2000px] relative">
        <motion.div 
          style={{ rotateX: b2bY }}
          className="relative overflow-hidden bg-primary rounded-[60px] p-8 lg:p-24 text-white shadow-2xl shadow-primary/20 transform-gpu"
        >
          {/* Glowing Aura inside B2B */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary opacity-15 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] animate-glow" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 space-y-10 text-right">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-white/10 dark:bg-card/10 backdrop-blur-md px-6 py-3 rounded-full text-sm font-black tracking-widest uppercase border border-white/20 shadow-lg shadow-white/5"
              >
                <Sparkles size={16} className="text-secondary animate-pulse" />
                للمطاعم والكافيهات والشركات الفاخرة
              </motion.div>

              <h2 className="text-4xl lg:text-7xl font-black leading-[1.15] tracking-tight">
                تميز بهويتك الخاصة <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-yellow-200">في كل تفصيلة</span>
              </h2>

              <p className="text-xl text-blue-100/70 leading-relaxed max-w-2xl font-medium">
                اجعل تغليفك يتحدث عن احترافيتك. حوّل أدواتك العادية إلى منصة تسويقية مبهرة تعكس فخامة علامتك التجارية بأعلى جودة وأفضل أسعار الجملة.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {[
                  { step: "01", title: "صمم مسارك", desc: "اختر المنتج والمواصفات" },
                  { step: "02", title: "أضف لمستك", desc: "ارفع شعارك بدقة عالية" },
                  { step: "03", title: "تألق بالسوق", desc: "استلم منتجك المخصص" }
                ].map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                    key={idx} className="glass border border-white/10 p-6 rounded-[32px] space-y-3 hover:bg-white/10 transition-all group/step transform-gpu hover:scale-105"
                  >
                    <div className="text-3xl font-black text-secondary group-hover/step:translate-x-2 transition-transform">{item.step}</div>
                    <div className="font-bold text-xl">{item.title}</div>
                    <div className="text-sm text-blue-100/50 font-medium leading-relaxed">{item.desc}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-6 pt-8">
                <Link href="/custom-printing" className="relative overflow-hidden bg-gradient-to-r from-secondary to-amber-500 text-primary dark:text-ink py-5 px-12 rounded-full font-black text-xl hover:shadow-2xl hover:shadow-secondary/50 transition-all active:scale-95 flex items-center gap-3 group/btn">
                  <motion.div variants={shimmerEffect} initial="hidden" animate="visible" className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 w-1/2" />
                  اطلب عرض سعر الآن
                  <ArrowLeft size={24} className="group-hover/btn:-translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Glowing Factory Floating Image */}
            <div className="lg:col-span-5 hidden lg:block">
              <motion.div 
               animate={{ y: [-20, 20, -20] }}
               transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
               className="relative aspect-square"
              >
                <div className="absolute inset-x-10 -bottom-10 h-10 bg-primary/50 blur-2xl rounded-full" />
                <div className="relative z-10 w-full h-full glass rounded-[60px] border border-white/20 flex flex-col items-center justify-center overflow-hidden group/img">
                  <Factory size={220} strokeWidth={0.5} className="text-white/20 group-hover/img:scale-110 group-hover/img:text-secondary/40 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-12 left-0 right-0 text-center space-y-3">
                    <div className="text-secondary font-black text-4xl drop-shadow-lg">B2B Solutions</div>
                    <div className="text-white/60 text-sm font-black tracking-[0.3em] uppercase">MJM Premium Manufacturing</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trust Badges (Redesigned) */}
      <section className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass border border-primary/10 dark:border-white/10 rounded-[40px] p-8 lg:p-12 shadow-2xl flex flex-wrap justify-center lg:justify-between items-center gap-10"
        >
          {[ 
            { icon: ShieldCheck, title: "ضمان الجودة", subtitle: "بأعلى المواصفات", bg: "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300" },
            { icon: Package, title: "تغليف آمن", subtitle: "حماية مطلقة", bg: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
            { icon: Phone, title: "دعم مستمر", subtitle: "24/7 بخدمتكم", bg: "bg-amber-50 dark:bg-amber-500/15 text-amber-500 dark:text-amber-300" }
          ].map((item, i) => (
            <motion.div whileHover={{ scale: 1.05 }} key={i} className="flex items-center gap-5 group">
              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-12", item.bg)}>
                <item.icon size={32} />
              </div>
              <div>
                <div className="font-black text-xl text-primary dark:text-ink">{item.title}</div>
                <div className="text-sm font-bold text-gray-400 dark:text-muted">{item.subtitle}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </div>
  );
}
