"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, Sparkles, ShieldCheck, BadgePercent, Truck, Factory, ArrowRight, Droplets, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: 1,
    title: "حلول التغليف المتكاملة",
    subtitle: "تميز بهويتك الخاصة",
    description: "استعد للارتقاء بعلامتك التجارية مع أقوى مجموعة من منتجات الضيافة والتغليف الفاخرة، المصممة خصيصاً لتعكس احترافيتك.",
    color: "from-blue-900 via-blue-800 to-indigo-950",
    accent: "text-secondary",
    icon: Package,
    badge: "فخامة بلا حدود",
    cta: "تسوق الآن",
    ctaLink: "/shop",
    secondaryCta: "طلب عينة",
    secondaryLink: "/contact",
    elements: [
      { type: "circle", color: "bg-secondary/20", size: "w-64 h-64", pos: "top-10 right-10" },
      { type: "sparkle", pos: "bottom-20 left-20", delay: 0.5 },
      { type: "float-box", icon: ShieldCheck, pos: "top-1/4 left-10", delay: 1 }
    ]
  },
  {
    id: 2,
    title: "هويتك البصرية.. مطبوعة بدقة",
    subtitle: "حلول B2B للمشاريع الكبرى",
    description: "حوّل أدواتك العادية إلى منصة تسويقية مبهرة. نحن نمتلك التقنيات الأحدث لطباعة شعارك بأعلى دقة على كافة المنتجات.",
    color: "from-purple-900 via-purple-800 to-fuchsia-950",
    accent: "text-amber-400",
    icon: Factory,
    badge: "طباعة مخصصة",
    cta: "اطلب عرض سعر",
    ctaLink: "/custom-printing",
    secondaryCta: "معرض الأعمال",
    secondaryLink: "/custom-printing",
    elements: [
      { type: "circle", color: "bg-amber-400/10", size: "w-80 h-80", pos: "bottom-0 right-0" },
      { type: "sparkle", pos: "top-40 right-1/4", delay: 0.2 },
      { type: "float-box", icon: Zap, pos: "bottom-20 left-1/3", delay: 1.5 }
    ]
  },
  {
    id: 3,
    title: "نروي عطشك.. ونرتقي بخدمتك",
    subtitle: "اشتراكات مياه متميزة",
    description: "حلول توريد المياه للمنازل والشركات بجدول زمني دقيق. جودة تليق بك، وتوصيل يسبق توقعاتك.",
    color: "from-cyan-900 via-cyan-800 to-blue-950",
    accent: "text-cyan-400",
    icon: Droplets,
    badge: "انتعاش دائم",
    cta: "اشترك الآن",
    ctaLink: "/water-subscriptions",
    secondaryCta: "خطط الأسعار",
    secondaryLink: "/water-subscriptions",
    elements: [
      { type: "circle", color: "bg-cyan-400/20", size: "w-96 h-96", pos: "top-0 left-0" },
      { type: "sparkle", pos: "bottom-1/4 right-1/3", delay: 0.8 },
      { type: "float-box", icon: Droplets, pos: "top-1/2 right-10", delay: 0.2 }
    ]
  },
  {
    id: 4,
    title: "عروض الجملة والحصريات",
    subtitle: "وفّر أكثر.. اطلب أكثر",
    description: "خصومات استثنائية تصل إلى 30% على طلبيات الجملة والكراتين الكاملة. MJM هو خيارك الأوفر دائماً.",
    color: "from-amber-700 via-orange-800 to-amber-950",
    accent: "text-amber-300",
    icon: BadgePercent,
    badge: "توفير بذكاء",
    cta: "استكشف العروض",
    ctaLink: "/bundles",
    secondaryCta: "حساب الكراتين",
    secondaryLink: "/bundles",
    elements: [
      { type: "circle", color: "bg-amber-300/10", size: "w-72 h-72", pos: "top-1/2 right-0" },
      { type: "sparkle", pos: "top-10 left-10", delay: 0.3 },
      { type: "float-box", icon: BadgePercent, pos: "bottom-10 right-1/4", delay: 0.6 }
    ]
  },
  {
    id: 5,
    title: "لوجستيات ذكية.. وسرعة فائقة",
    subtitle: "نحن بجانبك أينما كنت",
    description: "أسطول نقل متكامل يغطي كافة مناطق المملكة. أمان في النقل، دقة في المواعيد، وراحة بال تامة.",
    color: "from-emerald-900 via-emerald-800 to-teal-950",
    accent: "text-emerald-400",
    icon: Truck,
    badge: "توصيل آمن",
    cta: "تتبع طلبك",
    ctaLink: "/shipping",
    secondaryCta: "نطاق التغطية",
    secondaryLink: "/shipping",
    elements: [
      { type: "circle", color: "bg-emerald-400/10", size: "w-64 h-64", pos: "bottom-10 left-10" },
      { type: "sparkle", pos: "top-1/3 right-10", delay: 0.1 },
      { type: "float-box", icon: ShieldCheck, pos: "top-20 left-1/4", delay: 0.9 }
    ]
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const activeSlide = SLIDES[current];

  return (
    <section className="relative h-[90vh] lg:h-[85vh] w-full overflow-hidden bg-primary" dir="rtl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-1000", activeSlide.color)}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {activeSlide.elements.map((el, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + (el.delay || 0), duration: 1 }}
                className={cn(
                  "absolute",
                  el.type === "circle" ? cn(el.size, el.color, "rounded-full blur-[100px] animate-pulse") : "",
                  el.type === "sparkle" ? el.pos : "",
                  el.type === "float-box" ? el.pos : ""
                )}
              >
                {el.type === "sparkle" && (
                    <div className="relative">
                        <Sparkles className="text-white/20 w-12 h-12 animate-glow" />
                    </div>
                )}
                {el.type === "float-box" && el.icon && (
                    <motion.div 
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="glass p-6 rounded-3xl border border-white/20 shadow-2xl"
                    >
                        <el.icon className="w-12 h-12 text-white/50" />
                    </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Grain Overlay - local fallback to avoid external 404 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" />

          <div className="container mx-auto px-4 h-full flex items-center pt-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">

              {/* Content Side */}
              <div className="lg:col-span-7 space-y-8 text-right z-10">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="inline-flex items-center gap-2.5 bg-secondary/15 border border-secondary/30 backdrop-blur-md px-5 py-2 rounded-full shadow-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  <span className="text-secondary font-black text-sm tracking-widest">{activeSlide.badge}</span>
                </motion.div>

                <div className="space-y-4">
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-white text-3xl lg:text-4xl font-bold tracking-tight opacity-80"
                  >
                    {activeSlide.subtitle}
                  </motion.h2>
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-white text-5xl lg:text-8xl font-black leading-tight"
                  >
                    {activeSlide.title.split('..').map((part, i) => (
                        <span key={i} className={i === 1 ? activeSlide.accent : ""}>
                            {part}{i === 0 && activeSlide.title.includes('..') ? ".." : ""}
                            {i === 0 && activeSlide.title.includes('..') ? <br className="hidden lg:block" /> : ""}
                        </span>
                    ))}
                  </motion.h1>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-white/70 text-xl max-w-2xl leading-relaxed font-medium"
                >
                  {activeSlide.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="flex flex-wrap gap-6 pt-4"
                >
                  <Link href={activeSlide.ctaLink} className="group relative overflow-hidden bg-secondary text-primary py-5 px-12 rounded-full font-black text-xl hover:brightness-105 hover:shadow-2xl hover:shadow-secondary/30 transition-all active:scale-95 flex items-center gap-3">
                    {activeSlide.cta}
                    <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform duration-300" />
                  </Link>
                  <Link href={activeSlide.secondaryLink} className="text-white py-5 px-12 rounded-full font-black text-xl bg-white/10 border border-white/25 backdrop-blur-md hover:bg-white/15 transition-all flex items-center gap-3 active:scale-95">
                    {activeSlide.secondaryCta}
                  </Link>
                </motion.div>
              </div>

              {/* Visual Side */}
              <div className="lg:col-span-5 hidden lg:flex items-center justify-center h-full relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, duration: 1, type: "spring" }}
                  className="relative group"
                >
                  {/* Decorative Glow */}
                  <div className="absolute inset-0 bg-secondary/20 rounded-[44px] blur-[100px] -z-10 group-hover:bg-secondary/30 transition-all duration-500" />

                  {/* Glass Card */}
                  <div className="glass p-1 items-center justify-center w-[450px] h-[450px] rounded-[44px] border border-white/25 ring-1 ring-secondary/20 shadow-3xl flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    
                    <motion.div
                        animate={{ y: [-20, 20, -20], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <activeSlide.icon size={200} strokeWidth={0.5} className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" />
                        <div className="mt-8 text-center space-y-2">
                             <div className="text-white/40 font-black text-sm tracking-[0.4em] uppercase">Premium Solution</div>
                             <div className="text-white text-3xl font-black">MJM Visual Studio</div>
                        </div>
                    </motion.div>

                    {/* Floating Detail Elements */}
                    <motion.div 
                        animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 5 }}
                        className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-3xl blur-md" 
                    />
                    <motion.div 
                        animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 6 }}
                        className="absolute bottom-10 left-10 w-32 h-32 bg-secondary/5 rounded-full blur-xl" 
                    />
                  </div>

                  {/* External Decorators */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute -top-6 -left-6 w-16 h-16 bg-secondary/80 rounded-2xl flex items-center justify-center shadow-xl shadow-secondary/20 z-20"
                  >
                    <Sparkles className="text-primary w-8 h-8" />
                  </motion.div>
                </motion.div>
              </div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i);
              setIsAutoPlaying(false);
            }}
            className={cn(
              "h-2 transition-all duration-500 rounded-full",
              current === i ? "w-12 bg-secondary" : "w-4 bg-white/30 hover:bg-white/50"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Control Buttons (Arrows) */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-8 pointer-events-none">
        <button
            type="button"
            onClick={prevSlide}
            aria-label="الشريحة السابقة"
            className="pointer-events-auto w-14 h-14 rounded-full glass border border-white/20 flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 transition-all active:scale-95 group"
        >
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </button>
        <button
            type="button"
            onClick={nextSlide}
            aria-label="الشريحة التالية"
            className="pointer-events-auto w-14 h-14 rounded-full glass border border-white/20 flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 transition-all active:scale-95 group"
        >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
        </button>
      </div>

      {/* Progress Bar (Auto-play) */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5 z-40">
        <motion.div
            key={current}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full bg-secondary origin-right"
        />
      </div>
    </section>
  );
}
