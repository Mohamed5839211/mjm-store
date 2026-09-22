"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ShieldCheck, Truck, Target, History, Package, ArrowLeft } from "lucide-react";
import { SparkleBackground } from "@/components/ui/PremiumEffects";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export default function AboutPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    
    return (
        <div ref={containerRef} className="relative overflow-hidden bg-[#fafafa] dark:bg-background" dir="rtl">
            <SparkleBackground />
            
            <div className="container mx-auto px-6 space-y-32 py-32 relative z-10">
                
                {/* Hero Section - Refined & Sophisticated */}
                <section className="min-h-[60vh] flex flex-col items-start justify-center text-right space-y-10 max-w-6xl mx-auto relative">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-white dark:bg-card px-6 py-2 rounded-full border border-slate-200 dark:border-white/10 shadow-sm mb-4"
                    >
                        <Sparkles size={16} className="text-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-muted">نحن MJM</span>
                    </motion.div>
                    
                    <motion.h1 
                        style={{ opacity: heroOpacity }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-primary dark:text-ink leading-tight tracking-tight"
                    >
                        رؤية تتجاوز <br />
                        <span className="italic text-bronze dark:text-secondary relative">الحدود المعتادة</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl md:text-2xl text-slate-500 dark:text-muted leading-relaxed font-medium max-w-3xl"
                    >
                        في MJM، نحن نجسد الابتكار السعودي بروح عالمية. كل منتج نقدمه هو نتيجة لشغفنا بالكمال والتزامنا بتقديم حلول تفوق التوقعات.
                    </motion.p>
                </section>

                {/* Bento Grid Stats & Intro */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div 
                        whileHover={{ y: -10 }}
                        className="md:col-span-2 bg-primary p-12 rounded-[40px] text-white flex flex-col justify-between space-y-12 relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                        <History size={48} className="text-secondary relative z-10" />
                        <div className="space-y-4 relative z-10">
                            <h2 className="text-4xl font-black italic">عقد من الزمن</h2>
                            <p className="text-blue-100/60 font-medium text-lg leading-relaxed">عشر سنوات من الخبرة في السوق السعودي، بنينا فيها جسوراً من الثقة مع كبرى الشركات والمؤسسات.</p>
                        </div>
                    </motion.div>

                    <div className="md:col-span-1 space-y-6">
                        <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-card p-10 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-sm text-center">
                            <div className="ext-4xl lg:text-5xl font-black text-primary dark:text-ink mb-2">+50K</div>
                            <div className="text-[10px] font-black text-slate-500 dark:text-muted uppercase tracking-widest">عميل سعيد</div>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-card p-10 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-sm text-center">
                            <div className="text-4xl lg:text-5xl font-black text-primary dark:text-ink mb-2">+2K</div>
                            <div className="text-[10px] font-black text-slate-500 dark:text-muted uppercase tracking-widest">منتج فريد</div>
                        </motion.div>
                    </div>

                    <motion.div 
                        whileHover={{ y: -10 }}
                        className="md:col-span-1 bg-secondary p-12 rounded-[40px] flex flex-col justify-between text-primary dark:text-ink shadow-xl"
                    >
                        <Truck size={40} className="mb-8" />
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black">تغطية ذكية</h3>
                            <p className="text-primary/60 dark:text-ink/60 font-medium leading-tight">أسطول لوجستي يغطي كافة مناطق المملكة بدقة واحترافية.</p>
                        </div>
                    </motion.div>
                </section>

                {/* Vision & Mission - Overlapping Cards */}
                <section className="relative py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-10 relative z-10">
                            <motion.h2 
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="text-4xl md:text-6xl font-black text-primary dark:text-ink leading-tight"
                            >
                                نصمم المستقبل <br /> 
                                <span className="text-slate-300 dark:text-muted">بكل فخر واعتزاز</span>
                            </motion.h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="w-10 h-1 bg-secondary rounded-full" />
                                    <h3 className="text-2xl font-black text-primary dark:text-ink">رؤيتنا</h3>
                                    <p className="text-slate-500 dark:text-muted font-medium leading-relaxed">أن نقود التحول الجمالي والوظيفي في السوق السعودي، لنصبح الخيار الأول للجودة المبتكرة.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-10 h-1 bg-primary rounded-full" />
                                    <h3 className="text-2xl font-black text-primary dark:text-ink">رسالتنا</h3>
                                    <p className="text-slate-500 dark:text-muted font-medium leading-relaxed">تقديم منتجات تدمج بين الرفاهية والاستدامة، مع ضمان تجربة عميل لا تُنسى في كل خطوة.</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-5 relative">
                            <div className="absolute -inset-4 bg-secondary/10 blur-3xl opacity-50 rounded-full" />
                            <motion.div 
                                whileHover={{ rotate: 3, scale: 1.05 }}
                                className="relative bg-white dark:bg-card p-12 rounded-[60px] shadow-3xl border border-white/60 backdrop-blur-xl"
                            >
                                <Target size={64} className="text-primary dark:text-ink mb-8" />
                                <blockquote className="text-2xl font-black text-primary dark:text-ink italic leading-relaxed">
                                    «التميز ليس غاية نصل إليها، بل هو أسلوب الحياة الذي اخترناه في MJM.»
                                </blockquote>
                                <cite className="block mt-6 text-slate-500 dark:text-muted font-bold not-italic">— الفريق الإداري</cite>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Values - Layered Bento Cards */}
                <section className="space-y-16">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-black text-primary dark:text-ink mb-4">قيمنا الجوهرية</h2>
                        <p className="text-slate-500 dark:text-muted font-medium text-lg italic">الروافد التي تغذي مسيرتنا نحو القمة.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: "هوس بالجودة", desc: "ندقق في كل غرزة وكل ملم، لأننا نؤمن أن الجمال يكمن في التفاصيل الدقيقة.", icon: ShieldCheck, color: "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300" },
                            { title: "روح سعودية", desc: "نحن ننطلق من قلب المملكة، محملين بالثقافة والقدرة على المنافسة عالمياً.", icon: Package, color: "bg-amber-50 dark:bg-amber-500/15 text-amber-500 dark:text-amber-300" },
                            { title: "سرعة استثنائية", desc: "وقتكم هو رأس مالنا، لذا نحرص على تنفيذ طلباتكم بأعلى كفاءة زمنية.", icon: Truck, color: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" }
                        ].map((v, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white dark:bg-card p-12 rounded-[48px] border border-slate-100 dark:border-white/10 shadow-sm space-y-8 group transition-all"
                            >
                                <div className={cn(v.color, "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500")}>
                                    <v.icon size={32} />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-primary dark:text-ink">{v.title}</h3>
                                    <p className="text-slate-500 dark:text-muted font-medium leading-relaxed">{v.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Final CTA - Minimalist & Elegant */}
                <motion.section 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-primary p-16 md:p-28 rounded-[80px] text-white text-center relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-10">
                        <h2 className="text-4xl md:text-6xl font-black leading-tight">جاهز لترقية تجربتك؟</h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <motion.a 
                                href="/shop" 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto bg-secondary text-primary py-5 px-12 rounded-2xl font-black text-xl shadow-lg hover:bg-white transition-all"
                            >
                                ابدأ التسوق الآن
                            </motion.a>
                            <motion.a 
                                href="/contact" 
                                whileHover={{ x: -10 }}
                                className="group flex items-center gap-3 font-black text-xl text-blue-100"
                            >
                                تواصل مع خبرائنا
                                <ArrowLeft size={24} className="group-hover:translate-x-[-10px] transition-transform" />
                            </motion.a>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
