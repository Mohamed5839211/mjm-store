"use client";

import PolicyLayout from "@/components/PolicyLayout";
import { ShieldCheck, Clock, XCircle, Box, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function ReturnsPolicy() {
    return (
        <PolicyLayout title="سياسة الاسترجاع والاستبدال" lastUpdated="10 مارس 2026">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-16">
                <motion.section variants={fadeUp} className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <Clock size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">1. الفترة الزمنية المتاحة</h2>
                    </div>
                    <div className="space-y-6">
                        <p className="text-xl italic text-gray-600 dark:text-muted">يمكنك طلب استرجاع أو استبدال المنتجات خلال:</p>
                        <ul className="space-y-4">
                            {[
                                { time: "7 أيام", condition: "من تاريخ استلام الطلب للمنتجات غير المستخدمة." },
                                { time: "24 ساعة", condition: "من تاريخ استلام الطلب للمنتجات التي تم استخدامها." }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-6 bg-white dark:bg-card p-6 rounded-3xl border border-primary/5 dark:border-white/10 shadow-xl hover:translate-x-[-10px] transition-transform group/li">
                                    <div className="w-3 h-3 rounded-full bg-primary group-hover/li:animate-ping" />
                                    <span className="text-lg font-medium"><span className="font-bold text-primary dark:text-ink">{item.time}</span> {item.condition}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.section>

                <motion.section variants={fadeUp} className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-400/25 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">2. شروط الاسترجاع</h2>
                    </div>
                    <div className="space-y-6">
                        <p className="text-xl italic text-gray-600 dark:text-muted">لضمان عملية استرجاع سلسة، يرجى التأكد من توفر الشروط التالية:</p>
                        <ul className="space-y-4">
                            {[
                                "أن يكون المنتج في حالته الأصلية وغير مستخدم.",
                                "أن يكون المنتج بعبوته الأصلية مع جميع الملحقات.",
                                "وجود فاتورة الشراء الأصلية.",
                                "تضرر المنتج بشكل قطعي أثناء عملية الشحن."
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-6 bg-white dark:bg-card p-6 rounded-3xl border border-primary/5 dark:border-white/10 shadow-xl hover:translate-x-[-10px] transition-transform group/li">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 group-hover/li:animate-ping" />
                                    <span className="text-lg font-medium">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.section>

                <motion.section variants={fadeUp} className="flex gap-10 items-start group">
                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl border border-rose-100 dark:border-rose-400/25 group-hover:rotate-12 transition-all duration-500">
                        <XCircle size={36} />
                    </div>
                    <div>
                        <h2 className="mt-0 text-3xl font-black text-primary dark:text-ink">3. منتجات لا يمكن استرجاعها</h2>
                        <p className="text-xl italic text-gray-600 dark:text-muted mb-8">نظراً لطبيعة بعض المنتجات واشتراطات الصحة العامة، لا يمكن استرجاع الفئات التالية:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "المناديل والسفر", desc: "في حال فك التغليف" },
                                { title: "عبوات المياه", desc: "المكسور ختمها" },
                                { title: "الطلبات الخاصة", desc: "بتصميم العميل" }
                            ].map((item, i) => (
                                <div key={i} className="p-8 rounded-[40px] bg-rose-50/50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-400/20 text-center space-y-2 group-hover:bg-rose-50 dark:group-hover:bg-rose-500/15 transition-colors">
                                    <h3 className="m-0 font-black text-rose-700 dark:text-rose-300 italic">{item.title}</h3>
                                    <p className="m-0 text-sm text-gray-600 dark:text-muted font-bold">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={fadeUp} className="flex gap-10 items-start group">
                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/15 text-amber-500 dark:text-amber-300 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl border border-amber-100 dark:border-amber-400/25 group-hover:rotate-[-12deg] transition-all duration-500">
                        <Box size={36} />
                    </div>
                    <div>
                        <h2 className="mt-0 text-3xl font-black text-primary dark:text-ink">4. آلية تنفيذ الاسترجاع</h2>
                        <div className="space-y-8 relative pr-4">
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-200 via-amber-100 to-transparent" />
                            {[
                                { step: "1", text: "التواصل مع خدمة العملاء عبر الواتساب وإرسال صورة المنتج." },
                                { step: "2", text: "بمجرد الموافقة، سيتم تحديد موعد للاستلام أو إرسال بوليصة." },
                                { step: "3", text: "إعادة المبلغ خلال 14 يوم عمل بعد فحص المنتج." }
                            ].map((item, i) => (
                                <div key={i} className="relative pr-12">
                                    <div className="absolute right-[-10px] top-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg shadow-amber-500/30">
                                        {item.step}
                                    </div>
                                    <p className="m-0 text-lg font-bold text-gray-700 dark:text-muted">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.div variants={fadeUp} className="bg-primary/5 dark:bg-white/5 border-2 border-primary/10 dark:border-white/10 p-12 lg:p-20 rounded-[60px] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group/cta shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent opacity-0 group-hover/cta:opacity-100 transition-opacity duration-1000" />
                    <div className="w-24 h-24 bg-white dark:bg-card rounded-[40px] flex items-center justify-center text-primary dark:text-ink shadow-2xl shrink-0 group-hover/cta:rotate-[360deg] transition-transform duration-1000">
                        <HelpCircle size={48} />
                    </div>
                    <div className="text-center md:text-right relative z-10">
                        <h3 className="m-0 text-3xl font-black text-primary dark:text-ink mb-2">هل لديك تعقيد في طلبك؟</h3>
                        <p className="m-0 text-xl text-gray-500 dark:text-muted font-medium leading-relaxed">فريق التوفيق والحلول المتقدمة في MJM متواجد لضمان حقكم بالكامل وتسهيل كافة الإجراءات.</p>
                    </div>
                    <a href="/contact" className="mr-auto bg-primary text-white px-12 py-6 rounded-3xl font-black hover:bg-secondary hover:text-primary hover:scale-110 transition-all shadow-xl shadow-primary/20 relative z-10">تواصل فوري الآن</a>
                </motion.div>
            </motion.div>
        </PolicyLayout>
    );
}
