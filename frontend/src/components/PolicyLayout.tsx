"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { SparkleBackground } from "./ui/PremiumEffects";
import { useRef } from "react";

interface PolicyLayoutProps {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
}

export default function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const headerScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
    
    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#fafafa] dark:bg-background" dir="rtl">
            <SparkleBackground />

            {/* Top Navigation Spacer / Border Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent z-50" />

            <div className="container mx-auto px-6 py-28 max-w-6xl relative z-10">
                <motion.header
                    style={{ opacity: headerOpacity, scale: headerScale }}
                    className="mb-24 text-right space-y-6"
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-white dark:bg-card px-5 py-2 rounded-full border border-slate-200 dark:border-white/10 shadow-sm"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-muted">مركز السياسات المعتمد</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-black text-primary dark:text-ink tracking-tight leading-[1.2] max-w-4xl"
                    >
                        {title}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-600 dark:text-muted font-bold text-sm flex items-center justify-start gap-3"
                    >
                        <span>تحديث رقم 2.0.4</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/20" />
                        <span>آخر مراجعة: {lastUpdated}</span>
                    </motion.div>
                </motion.header>

                <section aria-label="نص السياسة" className="relative">
                    <div className="absolute inset-0 bg-white/40 dark:bg-card/40 blur-3xl -z-10 rounded-[60px]" />
                    
                    <div className="bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-white/60 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] rounded-[48px] overflow-hidden">
                        <div className="p-8 md:p-16 lg:p-24">
                            <div className="prose-refined max-w-none">
                                {children}
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary/5 blur-[120px] rounded-full -z-20 pointer-events-none" />
                    <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/5 dark:bg-white/5 blur-[120px] rounded-full -z-20 pointer-events-none" />
                </section>

                <footer className="mt-24 text-center border-t border-slate-100 dark:border-white/10 pt-16 group">
                   <div className="max-w-xl mx-auto space-y-8">
                        <p className="text-slate-600 dark:text-muted font-medium leading-relaxed">
                           جميع السياسات المذكورة أعلاه تخضع للقوانين المعمول بها في المملكة العربية السعودية. بزيارتك للموقع فأنت توافق تلقائياً على هذه الشروط.
                       </p>
                       <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                           <a href="/contact" className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all duration-500 hover:-translate-y-1">
                               احصل على استشارة قانونية
                           </a>
                           <button onClick={() => window.print()} className="w-full sm:w-auto bg-white dark:bg-card border border-slate-200 dark:border-white/10 text-slate-600 dark:text-muted px-10 py-5 rounded-2xl font-black hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                               تحميل النسخة المطبوعة
                           </button>
                       </div>
                   </div>
                </footer>
            </div>

            <style jsx global>{`
                .prose-refined h2 {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #0F172A;
                    margin-top: 4rem;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .prose-refined h2::before {
                    content: '';
                    display: block;
                    width: 1rem;
                    height: 1rem;
                    background: #EAB308;
                    border-radius: 4px;
                }
                .prose-refined p {
                    font-size: 1.125rem;
                    line-height: 2;
                    color: #64748B;
                    margin-bottom: 2rem;
                    font-weight: 500;
                }
                .prose-refined strong {
                    color: #0F172A;
                    font-weight: 900;
                }
                .prose-refined ul, .prose-refined ol {
                    margin-bottom: 3rem;
                    padding-right: 0;
                    list-style: none;
                }
                .prose-refined li {
                    margin-bottom: 1rem;
                    padding: 1.5rem;
                    background: #f8fafc;
                    border-radius: 20px;
                    border: 1px solid #f1f5f9;
                    color: #475569;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                .prose-refined li:hover {
                    background: #ffffff;
                    border-color: #EAB308;
                    transform: translateX(-8px);
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
                }
                /* Night theme for the policy body */
                .dark .prose-refined h2 { color: #e9eef7; }
                .dark .prose-refined p { color: #9fb0cc; }
                .dark .prose-refined strong { color: #e9eef7; }
                .dark .prose-refined li {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.08);
                    color: #c3cfe3;
                }
                .dark .prose-refined li:hover {
                    background: rgba(255,255,255,0.07);
                    border-color: #EAB308;
                }
                @media (max-width: 768px) {
                    .prose-refined h2 { font-size: 1.5rem; }
                    .prose-refined p { font-size: 1rem; }
                }
            `}</style>
        </div>
    );
}

