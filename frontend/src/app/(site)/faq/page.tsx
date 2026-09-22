"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, MessageSquare, Sparkles, Phone } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { SparkleBackground } from "@/components/ui/PremiumEffects";
import { cn } from "@/lib/utils";

const faqs = [
    {
        question: "كيف يمكنني تتبع طلبي؟",
        answer: "بمجرد شحن طلبك، ستصلك رسالة نصية وواتساب تحتوي على رابط تتبع مباشر. كما يمكنك التتبع من خلال الدخول إلى حسابك في 'طلباتي'."
    },
    {
        question: "ما هي مدة التوصيل المتوقعة؟",
        answer: "داخل الرياض، يتم التوصيل عادةً خلال 24-48 ساعة. لبقية مدن المملكة، يستغرق الأمر من 2 إلى 5 أيام عمل تقريباً."
    },
    {
        question: "هل تتوفر خدمة التوصيل المجاني؟",
        answer: "نعم! نفخر بتقديم شحن مجاني تماماً لجميع الطلبات التي تتجاوز قيمتها 299 ريالاً سعودياً."
    },
    {
        question: "ما هي وسائل الدفع المقبولة؟",
        answer: "نقبل مدى، فيزا، Apple Pay، بالإضافة إلى حلول التقسيط المريح عبر تابي وتمارا."
    },
    {
        question: "هل يمكنني طلب طباعة خاصة (Logo)؟",
        answer: "بالتأكيد! نحن متخصصون في الطباعة المخصصة للمطاعم والشركات. يمكنك التوجه لصفحة 'خدمات الطباعة' لرفع شعارك وطلب عرض سعر."
    },
    {
        question: "هل تتوفر أسعار خاصة للجملة؟",
        answer: "نعم، نقدم أسعاراً تنافسية جداً وتخفيضات تصاعدية للكميات الكبيرة والمنشآت التجارية."
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="relative min-h-screen overflow-hidden pb-32 pt-20 bg-slate-50/30 dark:bg-white/5" dir="rtl">
            <SparkleBackground />

            <div className="container mx-auto px-4 max-w-5xl relative z-10 space-y-24">
                {/* Hero Section */}
                <div className="text-right space-y-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="inline-flex items-center gap-3 bg-white/60 dark:bg-card/60 backdrop-blur-2xl border border-secondary/20 text-bronze dark:text-secondary px-10 py-4 rounded-full text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-secondary/5"
                    >
                        <HelpCircle size={20} className="animate-pulse" />
                        مركز المساعدة الذكي
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl lg:text-9xl font-black text-primary dark:text-ink leading-tight tracking-tighter"
                    >
                        الأسئلة <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary via-amber-600 to-secondary bg-[length:200%_auto] animate-shimmer">الشائعة</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 dark:text-muted font-medium text-2xl max-w-3xl leading-relaxed"
                    >
                        كل ما تحتاج معرفته عن عالم MJM، مصمم لتوفير أرقى تجربة دعم فني تليق بك.
                    </motion.p>
                </div>

                {/* FAQ Accordion */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            variants={staggerItem}
                            className={cn(
                                "bg-white dark:bg-card rounded-3xl overflow-hidden border transition-all duration-300 shadow-lg shadow-primary/5",
                                openIndex === i ? 'border-secondary/50 ring-2 ring-secondary/10' : 'border-primary/10 dark:border-white/10 hover:border-secondary/30'
                            )}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                aria-expanded={openIndex === i}
                                className="w-full flex items-center justify-between gap-4 p-5 lg:p-6 text-right group"
                            >
                                <span className="text-lg lg:text-xl font-black text-primary dark:text-ink transition-colors">
                                    {faq.question}
                                </span>
                                <div className={cn(
                                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0",
                                    openIndex === i ? 'bg-secondary text-primary rotate-180' : 'bg-primary/5 dark:bg-white/10 text-primary dark:text-ink group-hover:bg-secondary group-hover:text-primary'
                                )}>
                                    {openIndex === i ? <Minus size={22} strokeWidth={3} /> : <Plus size={22} strokeWidth={3} />}
                                </div>
                            </button>
                            <AnimatePresence initial={false}>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 lg:px-6 pb-5 lg:pb-6">
                                            <div className="bg-primary/[0.04] dark:bg-white/5 p-5 rounded-2xl border border-primary/5 dark:border-white/10 text-gray-600 dark:text-muted font-medium leading-relaxed text-base lg:text-lg">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Support Section */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-primary p-10 lg:p-16 rounded-[48px] text-white text-center space-y-8 relative overflow-hidden group shadow-[0_80px_160px_-40px_rgba(15,23,42,0.6)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 via-transparent to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative z-10 space-y-8">
                        <div className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center border border-white/20 mx-auto shadow-2xl">
                            <MessageSquare size={40} className="text-secondary" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl lg:text-5xl font-black tracking-tight">هل ما زلت بحاجة للمساعدة؟</h2>
                            <p className="text-blue-100/70 text-lg font-medium max-w-3xl mx-auto leading-relaxed">
                                فريق كبار العملاء لدينا متاح لخدمتكم فوراً عبر المنصات الرقمية لضمان أعلى مستويات الرضا.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 pt-4 font-black">
                            <Link href="/contact" className="bg-secondary text-primary py-4 px-10 rounded-full hover:brightness-105 transition-all shadow-2xl shadow-secondary/40 flex items-center gap-3 text-lg">
                                تواصل معنا
                                <Sparkles size={22} />
                            </Link>
                            <a href="https://wa.me/966500000000" className="bg-white/10 text-white py-4 px-10 rounded-full backdrop-blur-2xl hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3 text-lg group/wa">
                                خدمة VIP (واتساب)
                                <Phone size={22} className="group-hover/wa:rotate-12 transition-transform" />
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

