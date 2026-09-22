"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
    Send, Upload, Info, CheckCircle2, Building2, User, Phone, Mail, 
    Package, FileText, Sparkles, ShieldCheck, Zap, Globe, ArrowRight 
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createPrintingRequest, uploadLogo } from "@/lib/api/commerce";
import type { PrintingRequestPayload } from "@/types/commerce";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function CustomPrintingPage() {
    useDocumentTitle('خدمات الطباعة المخصصة');
    const { user } = useAuth();
    const router = useRouter();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        contactPerson: '',
        phone: '',
        email: '',
        productType: '',
        expectedQuantity: '',
        notes: ''
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setError("حجم الملف يجب أن يكون أقل من 5 ميجابايت");
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };

    const submitMutation = useMutation({
        mutationFn: async (payload: PrintingRequestPayload) => {
            const withLogo = { ...payload };
            if (selectedFile) {
                const uploaded = await uploadLogo(selectedFile);
                withLogo.logoUrl = uploaded.logoUrl;
            }
            return createPrintingRequest(withLogo);
        },
        onSuccess: () => {
            setError(null);
            setIsSubmitted(true);
            toast.success('تم استلام طلبك بنجاح');
        },
        onError: (err) => setError(toErrorMessage(err, 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.')),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError("يرجى تسجيل الدخول أولاً لإرسال طلب طباعة");
            router.push(`/auth/login?redirect=/custom-printing`);
            return;
        }

        submitMutation.mutate({
            businessName: formData.businessName,
            businessType: formData.businessType || 'أخرى',
            contactPerson: formData.contactPerson,
            phone: formData.phone,
            email: formData.email,
            productType: formData.productType,
            expectedQuantity: parseInt(formData.expectedQuantity) || 0,
            notes: formData.notes,
        });
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-gray-50/50 dark:bg-white/5">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-card rounded-[40px] p-12 max-w-lg w-full text-center shadow-2xl border border-primary/10 dark:border-white/10 space-y-6"
                >
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-primary dark:text-ink">تم استلام طلبك بنجاح!</h2>
                    <p className="text-gray-500 dark:text-muted font-medium leading-relaxed">
                        شكراً لثقتكم بخدماتنا. سيقوم فريق المبيعات لدينا بمراجعة طلب الطباعة الخاصة بك والتواصل معك في أقرب وقت لتقديم عروض الأسعار والتفاصيل.
                    </p>
                    <div className="pt-6">
                        <Link href="/" className="inline-flex items-center justify-center w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-secondary hover:text-primary transition-all">
                            العودة للرئيسية
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-20 overflow-hidden bg-white dark:bg-card">
            {/* 1. Hero Section - Business Grade */}
            <section className="relative py-20 lg:py-32 flex items-center">
                <div className="absolute top-0 left-0 w-full h-full bg-primary/2 -z-10" />
                <div className="absolute top-20 right-[-10%] w-1/2 h-1/2 bg-secondary/5 rounded-full blur-[120px] -z-10" />
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl text-right space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-secondary/10 text-bronze dark:text-secondary px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"
                        >
                            <Sparkles size={14} fill="currentColor" />
                            خدمات الطباعة للشركات
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-8xl font-black text-primary dark:text-ink leading-tight tracking-tighter"
                        >
                            حوّل علامتك التجارية إلى <span className="text-bronze dark:text-secondary">واقع ملموس</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-500 dark:text-muted font-medium max-w-3xl leading-relaxed"
                        >
                            نحن نوفر حلول طباعة مخصصة عالية الجودة للمطاعم، المقاهي، والشركات الناشئة. من الأكواب الورقية إلى الأكياس البلاستيكية، نحن شريكك في النجاح.
                        </motion.p>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-4 pt-4"
                        >
                            <a href="#form" className="bg-primary text-white py-5 px-10 rounded-[20px] font-black text-lg hover:bg-secondary hover:text-primary transition-all shadow-xl shadow-primary/20">ابدأ طلبك الآن</a>
                            <button className="bg-white dark:bg-card text-primary dark:text-ink border border-primary/5 dark:border-white/10 py-5 px-10 rounded-[20px] font-black text-lg hover:bg-gray-50 transition-all flex items-center gap-2">عرض سابقة الأعمال <ArrowRight size={20} /></button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Features Grid */}
            <section className="py-24 bg-gray-50/50 dark:bg-white/5">
                <div className="container mx-auto px-4">
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            { title: "جودة استثنائية", desc: "أحدث تقنيات الطباعة لضمان وضوح الألوان ودقة التفاصيل.", icon: ShieldCheck, color: "text-blue-500" },
                            { title: "سرعة التنفيذ", desc: "نلتزم بمواعيد التسليم المحددة لضمان سير أعمالك دون انقطاع.", icon: Zap, color: "text-amber-500" },
                            { title: "دعم فني متخصص", desc: "فريق من المصممين والخبراء لمساعدتك في اختيار الخامات المناسبة.", icon: Globe, color: "text-green-500" }
                        ].map((feature, i) => (
                            <motion.div key={i} variants={fadeUp}                             className="bg-white dark:bg-card p-10 rounded-[40px] border border-primary/10 dark:border-white/10 shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all group">
                                <div className={cn("w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", feature.color)}>
                                    <feature.icon size={32} />
                                </div>
                                <h2 className="text-xl font-black text-primary dark:text-ink mb-4">{feature.title}</h2>
                                <p className="text-gray-500 dark:text-muted font-medium leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 3. Steps Section */}
            <section className="py-32">
                <div className="container mx-auto px-4">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-3xl lg:text-5xl font-black text-primary dark:text-ink">كيف تعمل <span className="text-bronze dark:text-secondary">الخدمة؟</span></h2>
                        <p className="text-gray-600 dark:text-muted font-bold uppercase tracking-widest text-xs">اربع خطوات بسيطة لمنتجك الاحترافي</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-20 right-20 h-0.5 bg-gray-100 dark:bg-white/10 -z-10" />
                        
                        {[
                            { step: "01", title: "طلب عرض سعر", desc: "املأ النموذج أدناه بكافة التفاصيل المطلوبة لمنتجك." },
                            { step: "02", title: "مراجعة التصميم", desc: "سيقوم فريقنا بالتواصل معك لمراجعة شعارك وتصميمك." },
                            { step: "03", title: "مرحلة الإنتاج", desc: "بعد الموافقة، سنبدأ فوراً في تصنيع منتجاتك المخصصة." },
                            { step: "04", title: "التسليم النهائي", desc: "تصلك منتجاتك حتى باب منشأتك في أسرع وقت ممكن." }
                        ].map((s, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center space-y-6"
                            >
                                <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-2xl shadow-primary/30 border-8 border-white">
                                    {s.step}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-primary dark:text-ink">{s.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-muted font-medium leading-relaxed px-4">{s.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. The Form Section */}
            <section id="form" className="py-24 bg-gray-50/50 dark:bg-white/5 relative">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="bg-white dark:bg-card rounded-[60px] p-8 md:p-16 shadow-2xl shadow-primary/5 border border-primary/10 dark:border-white/10">
                        <div className="text-center space-y-4 mb-12">
                            <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mx-auto text-secondary mb-6">
                                <Package size={40} />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-black text-primary dark:text-ink">نموذج الطلب</h2>
                            <p className="text-gray-400 dark:text-muted font-bold">يرجى تعبئة جميع الحقول لضمان حصولك على عرض سعر دقيق</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label htmlFor="business-name" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                                        <Building2 size={16} className="text-secondary" /> اسم المنشأة
                                    </label>
                                    <input 
                                        id="business-name"
                                        name="businessName"
                                        type="text" 
                                        required 
                                        value={formData.businessName} 
                                        onChange={e => setFormData({...formData, businessName: e.target.value})} 
                                        autoComplete="organization"
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-medium" 
                                        placeholder="مثال: مطعم الفراشة" />
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="business-type" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                                        <Info size={16} className="text-secondary" /> نوع النشاط
                                    </label>
                                    <input 
                                        id="business-type"
                                        name="businessType"
                                        type="text" value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-medium" placeholder="مطعم، مقهى، الخ..." />
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="contact-person" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                                        <User size={16} className="text-secondary" /> الشخص المسؤول
                                    </label>
                                    <input 
                                        id="contact-person"
                                        name="contactPerson"
                                        type="text" 
                                        required 
                                        value={formData.contactPerson} 
                                        onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                                        autoComplete="name"
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-medium" />
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="phone" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                                        <Phone size={16} className="text-secondary" /> رقم الجوال
                                    </label>
                                    <input 
                                        id="phone"
                                        name="phone"
                                        type="tel" 
                                        required 
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                                        autoComplete="tel"
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-medium text-left" dir="ltr" placeholder="05xxxxxxxx" />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label htmlFor="email" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                                        <Mail size={16} className="text-secondary" /> البريد الإلكتروني
                                    </label>
                                    <input 
                                        id="email"
                                        name="email"
                                        type="email" 
                                        required 
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})} 
                                        autoComplete="email"
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-medium text-left" dir="ltr" placeholder="email@example.com" />
                                </div>
                                
                                <div className="md:col-span-2 py-4"><div className="h-px bg-gray-100 dark:bg-white/10 w-full" /></div>

                                <div className="space-y-3 text-right">
                                    <label htmlFor="product-type" className="text-sm font-black text-primary dark:text-ink mr-2 italic tracking-tighter">المنتج المطلوب طباعته</label>
                                    <input 
                                        id="product-type"
                                        name="productType"
                                        type="text" required value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-medium" placeholder="أكواب ورقية، أكياس بلاستيك..." />
                                </div>
                                <div className="space-y-3 text-right">
                                    <label htmlFor="expected-quantity" className="text-sm font-black text-primary dark:text-ink mr-2 italic tracking-tighter">الكمية المتوقعة</label>
                                    <input 
                                        id="expected-quantity"
                                        name="expectedQuantity"
                                        type="number" required value={formData.expectedQuantity} onChange={e => setFormData({...formData, expectedQuantity: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-medium" placeholder="مثال: 5000" />
                                </div>
                                
                                {/* Logo Upload - Interactive Glass UI */}
                                <div className="space-y-3 md:col-span-2">
                                    <label htmlFor="logo-upload" className="text-sm font-black text-primary dark:text-ink flex items-center justify-between mx-2">
                                        <span>الشعار / ملف التصميم</span>
                                        <span className="text-[10px] text-gray-600 dark:text-muted font-bold uppercase tracking-widest">(إختياري)</span>
                                    </label>
                                    <div className={cn(
                                        "border-4 border-dashed rounded-[40px] p-12 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group min-h-[300px]",
                                        selectedFile ? "border-secondary bg-secondary/5" : "border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5"
                                    )}>
                                        <input id="logo-upload" name="logo" type="file" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" accept=".png,.jpg,.jpeg,.svg,.pdf" onChange={handleFileChange} />
                                        <AnimatePresence mode="wait">
                                            {selectedFile ? (
                                                <motion.div 
                                                    key="file-ready"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="text-center space-y-6"
                                                >
                                                    {selectedFile.type.startsWith('image/') ? (
                                                        <div className="w-40 h-40 mx-auto rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative bg-white dark:bg-card group-hover:scale-105 transition-transform">
                                                            <img src={URL.createObjectURL(selectedFile)} alt="معاينة الشعار المرفوع" className="w-full h-full object-contain p-2" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-24 h-24 bg-secondary/20 rounded-[32px] flex items-center justify-center mx-auto text-secondary shadow-xl">
                                                            <FileText size={48} />
                                                        </div>
                                                    )}
                                                    <div className="space-y-1">
                                                        <p className="font-black text-primary dark:text-ink text-xl">{selectedFile.name}</p>
                                                        <p className="text-[10px] font-black text-bronze dark:text-secondary tracking-widest uppercase bg-white/80 dark:bg-card/80 py-2 px-4 rounded-full inline-block shadow-sm">
                                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                    <p className="text-xs font-black text-gray-400 dark:text-muted group-hover:text-primary transition-colors">اضغط هنا لاستبدال الملف</p>
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    key="file-empty"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-center space-y-6"
                                                >
                                                    <div className="w-24 h-24 bg-white dark:bg-card rounded-[32px] flex items-center justify-center mx-auto text-gray-300 dark:text-muted shadow-xl border border-gray-50 group-hover:text-secondary group-hover:rotate-12 transition-all">
                                                        <Upload size={40} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-lg text-primary dark:text-ink font-black">اسحب وألقِ الشعار هنا</p>
                                                        <p className="text-xs text-gray-600 dark:text-muted font-bold">يدعم PNG, JPG, PDF (بحد أقصى 5MB)</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-3 md:col-span-2">
                                    <label htmlFor="notes" className="text-sm font-black text-primary dark:text-ink flex items-center justify-between mx-2">
                                        <span>ملاحظات إضافية</span>
                                        <span className="text-[10px] text-gray-600 dark:text-muted font-bold uppercase tracking-widest">(إختياري)</span>
                                    </label>
                                    <textarea id="notes" name="notes" rows={5} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-5 px-8 rounded-3xl outline-none focus:ring-4 focus:ring-secondary/20 transition-all font-medium resize-none shadow-inner" placeholder="أي تفاصيل أخرى تود إضافتها..."></textarea>
                                </div>
                            </div>

                            {error && <div className="p-6 bg-red-50 dark:bg-red-500/15 text-red-500 rounded-3xl text-sm font-black text-center shadow-inner flex items-center justify-center gap-2 border border-red-100 animate-bounce">{error}</div>}

                            <button type="submit" disabled={submitMutation.isPending} className="w-full bg-primary text-white py-6 rounded-[30px] font-black text-xl hover:bg-secondary hover:text-primary transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-70">
                                {submitMutation.isPending ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>جاري إرسال طلبك...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>إرسال الطلب الآن</span>
                                        <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                                            <Send size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
