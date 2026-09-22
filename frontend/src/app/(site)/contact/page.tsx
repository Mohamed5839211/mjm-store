"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Phone, MapPin, Send, Globe,
    ChevronRight, ChevronLeft, CheckCircle2, Headset, User
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { sendContactMessage } from "@/lib/api/commerce";
import type { ContactPayload } from "@/types/commerce";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function ContactPage() {
    useDocumentTitle('اتصل بنا');
    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState<ContactPayload>({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [error, setError] = useState<string | null>(null);

    const sendMutation = useMutation({
        mutationFn: sendContactMessage,
        onSuccess: () => {
            setError(null);
            setIsSubmitted(true);
            toast.success('تم إرسال رسالتك بنجاح');
        },
        onError: (err) => setError(toErrorMessage(err, 'حدث خطأ أثناء إرسال الرسالة')),
    });

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMutation.mutate(formData);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-card rounded-[50px] p-16 max-w-xl w-full text-center shadow-2xl border border-primary/5 dark:border-white/10 space-y-8"
                >
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6 animate-bounce">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-primary dark:text-ink tracking-tighter">تم الإرسال بنجاح!</h2>
                        <p className="text-gray-500 dark:text-muted font-medium leading-relaxed">
                            شكراً لتواصلك معنا. استلمنا رسالتك وسيقوم فريق العناية بالعملاء بالرد عليك خلال أقل من 24 ساعة عمل.
                        </p>
                    </div>
                    <button 
                        onClick={() => { setIsSubmitted(false); setStep(1); }}
                        className="w-full bg-primary text-white py-5 rounded-2xl font-black hover:bg-secondary hover:text-primary transition-all shadow-xl shadow-primary/20"
                    >
                        إرسال رسالة أخرى
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-20 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-32">
                {/* 1. Dynamic Header */}
                <div className="text-right space-y-8 max-w-5xl relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-secondary/10 blur-[120px] -z-10" />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="inline-flex items-center gap-2 bg-secondary/10 text-primary dark:text-ink px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest mb-4"
                    >
                        <Headset size={16} fill="currentColor" />
                        مركز مساعدة MJM
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-8xl font-black text-primary dark:text-ink leading-none tracking-tighter"
                    >
                        نحن دائماً <br /> <span className="text-bronze dark:text-secondary">بالقرب منك</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 dark:text-muted font-medium max-w-3xl leading-relaxed"
                    >
                        سواء كنت تبحث عن إجابات، أو تود حل مشكلة، أو فقط تريد إبداء رأيك، فنحن نسعد بالاستماع إليك.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
                    {/* 2. Enhanced Contact Info */}
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-5 space-y-10"
                    >
                        <div className="grid grid-cols-1 gap-6">
                            {[
                                { title: "الدعم المباشر", info: "920000000", sub: "خط ساخن متاح 24/7", icon: Phone, color: "text-amber-500 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-500/15" },
                                { title: "عناية العملاء", info: "care@mjm.sa", sub: "نرد خلال ساعة واحدة", icon: Mail, color: "text-blue-500 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-500/15" },
                                { title: "مقرنا الإداري", info: "الرياض، السلي الصناعية", sub: "المملكة العربية السعودية", icon: MapPin, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/15" }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i} 
                                    variants={fadeUp}
                                    whileHover={{ x: -10, scale: 1.02 }}
                                    className="bg-white dark:bg-card p-8 rounded-[40px] border border-primary/5 dark:border-white/10 shadow-2xl shadow-primary/5 flex items-center gap-8 group transition-all cursor-pointer overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 dark:bg-white/5 rounded-full blur-3xl -z-10 group-hover:bg-secondary/10 transition-colors" />
                                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform", item.bg, item.color)}>
                                        <item.icon size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-bronze dark:text-secondary tracking-widest uppercase italic">{item.title}</div>
                                        <div className="text-xl font-black text-primary dark:text-ink font-inter tracking-tighter">{item.info}</div>
                                        <div className="text-[10px] text-gray-600 dark:text-muted font-black uppercase tracking-widest">{item.sub}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Social Card */}
                        <motion.div variants={fadeUp} className="bg-primary p-12 rounded-[50px] text-white relative overflow-hidden group shadow-2xl shadow-primary/30">
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-secondary opacity-20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-secondary">
                                        <Globe size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight">تواصل معنا اجتماعياً</h2>
                                </div>
                                <div className="flex gap-4">
                                    {["Snapchat", "Instagram", "X", "LinkedIn"].map(s => (
                                        <motion.div 
                                            key={s} 
                                            whileHover={{ y: -5, scale: 1.1 }}
                                            className="px-4 py-3 bg-white/10 dark:bg-card/10 rounded-xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-primary transition-all cursor-pointer border border-white/5 shadow-lg"
                                        >
                                            {s}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* 3. Multi-step Floating Form */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-7 bg-white/80 dark:bg-card/80 backdrop-blur-2xl rounded-[60px] p-8 lg:p-20 shadow-2xl shadow-primary/10 border border-primary/5 dark:border-white/10 relative"
                    >
                        <div className="absolute top-10 right-10 flex gap-1">
                            <div className={cn("w-8 h-1.5 rounded-full transition-all duration-500", step === 1 ? "bg-secondary w-16" : "bg-gray-100 dark:bg-white/10")} />
                            <div className={cn("w-8 h-1.5 rounded-full transition-all duration-500", step === 2 ? "bg-secondary w-16" : "bg-gray-100 dark:bg-white/10")} />
                        </div>

                        <form className="space-y-12" onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div 
                                        key="step1"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className="space-y-10"
                                    >
                                        <div className="space-y-4">
                                            <h2 className="text-3xl font-black text-primary dark:text-ink">أخبرنا <span className="text-bronze dark:text-secondary">عنك</span></h2>
                                            <p className="text-gray-600 dark:text-muted font-bold">لنتمكن من التعرف عليك بشكل أفضل</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label htmlFor="full-name" className="text-xs font-black text-gray-600 dark:text-muted uppercase tracking-widest mr-4">الاسم الكامل</label>
                                                <div className="relative">
                                                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 dark:text-muted" size={18} />
                                                    <input 
                                                        id="full-name"
                                                        name="name"
                                                        required
                                                        type="text" 
                                                        placeholder="كيف نناديك؟" 
                                                        value={formData.name}
                                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                                        autoComplete="name"
                                                        className="w-full bg-gray-50/50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-5 px-8 pr-16 rounded-[24px] outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-bold text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted shadow-inner" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label htmlFor="email" className="text-xs font-black text-gray-600 dark:text-muted uppercase tracking-widest mr-4">البريد الإلكتروني</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 dark:text-muted" size={18} />
                                                    <input 
                                                        id="email"
                                                        name="email"
                                                        required
                                                        type="email" 
                                                        placeholder="أين نرسل الرد؟" 
                                                        value={formData.email}
                                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                                        autoComplete="email"
                                                        className="w-full bg-gray-50/50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-5 px-8 pr-16 rounded-[24px] outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-bold text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted font-inter shadow-inner" 
                                                        dir="ltr" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            type="button"
                                            onClick={handleNext}
                                            disabled={!formData.name || !formData.email}
                                            className="w-full bg-primary text-white py-6 rounded-[30px] font-black text-xl hover:bg-secondary hover:text-primary transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-primary/20 disabled:opacity-30"
                                        >
                                            الخطوة التالية
                                            <ChevronLeft size={24} className="group-hover:translate-x-[-10px] transition-transform" />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="step2"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className="space-y-10"
                                    >
                                        <div className="space-y-4">
                                            <button onClick={handleBack} className="text-[10px] font-black text-gray-400 dark:text-muted hover:text-primary flex items-center gap-1 uppercase tracking-widest mb-4">
                                                <ChevronRight size={14} /> العودة للخطوة السابقة
                                            </button>
                                            <h2 className="text-3xl font-black text-primary dark:text-ink">ماذا يدور في <span className="text-bronze dark:text-secondary">خاطرك؟</span></h2>
                                            <p className="text-gray-600 dark:text-muted font-bold">اكتب استفسارك بالتفصيل وسنهتم به</p>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <label htmlFor="subject" className="text-xs font-black text-gray-600 dark:text-muted uppercase tracking-widest mr-4">الموضوع</label>
                                                <input 
                                                    id="subject"
                                                    name="subject"
                                                    required
                                                    type="text" 
                                                    placeholder="بخصوص ماذا تريد التواصل؟" 
                                                    value={formData.subject}
                                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                                    className="w-full bg-gray-50/50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-5 px-8 rounded-[24px] outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-bold text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted shadow-inner" 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label htmlFor="message" className="text-xs font-black text-gray-600 dark:text-muted uppercase tracking-widest mr-4">نص الرسالة</label>
                                                <textarea 
                                                    id="message"
                                                    name="message"
                                                    required
                                                    rows={6} 
                                                    placeholder="اكتب استفسارك هنا بكل وضوح..." 
                                                    value={formData.message}
                                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                                    className="w-full bg-gray-50/50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-6 px-8 rounded-[32px] outline-none focus:ring-4 focus:ring-secondary/20 transition-all resize-none font-bold text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted shadow-inner" 
                                                />
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="bg-red-50 dark:bg-red-500/15 text-red-500 p-4 rounded-xl text-center font-bold text-sm mb-4">
                                                {error}
                                            </div>
                                        )}
                                        <button 
                                            type="submit"
                                            disabled={sendMutation.isPending}
                                            className="w-full bg-primary text-white py-6 rounded-[30px] font-black text-xl hover:bg-secondary hover:text-primary transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                                        >
                                            {sendMutation.isPending ? "جاري الإرسال..." : "إرسال الرسالة الحين"}
                                            {!sendMutation.isPending && (
                                                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-primary transition-all">
                                                    <Send size={20} className="group-hover:translate-x-[-10px] transition-transform" />
                                                </div>
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
