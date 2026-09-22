"use client";

import { motion } from "framer-motion";
import { UserPlus, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Building2, Briefcase } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/auth";
import { registerCustomer } from "@/lib/api/auth";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function RegisterPage() {
    useDocumentTitle('إنشاء حساب');
    const router = useRouter();
    const { loginCustomer: saveCustomerSession } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isBusiness, setIsBusiness] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        businessName: ""
    });
    const [error, setError] = useState("");

    const registerMutation = useMutation({
        mutationFn: registerCustomer,
        onSuccess: (data) => {
            setError("");
            saveCustomerSession(data.accessToken, data.user, 7);
            router.push(ROUTES.PROFILE);
        },
        onError: (err) => {
            setError(toErrorMessage(err, "حدث خطأ أثناء إنشاء الحساب"));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            isBusiness,
            businessName: isBusiness ? formData.businessName : undefined,
        });
    };

    const isLoading = registerMutation.isPending;

    return (
        <div className="min-h-[80vh] flex items-center justify-center container mx-auto px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white dark:bg-card rounded-[50px] shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 p-8 lg:p-16 space-y-10"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-3xl flex items-center justify-center mx-auto mb-6 group hover:rotate-6 transition-transform">
                        <UserPlus size={40} />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-primary dark:text-ink">إنشاء <span className="text-bronze dark:text-secondary">حساب جديد</span></h1>
                    <p className="text-gray-500 dark:text-muted font-medium tracking-tight">انضم إلينا اليوم واستمتع بتجربة تسوق فريدة وعروض حصرية.</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-500/15 text-red-500 p-4 rounded-2xl text-center font-bold border border-red-100 animate-shake">
                        {error}
                    </div>
                )}

                {/* Account Type Toggle */}
                <div className="flex p-1 bg-gray-100 dark:bg-white/10 rounded-2xl max-w-xs mx-auto">
                    <button
                        onClick={() => setIsBusiness(false)}
                        className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                            !isBusiness ? "bg-white dark:bg-card text-primary dark:text-ink shadow-sm" : "text-gray-600 dark:text-muted hover:text-primary"
                        )}
                    >
                        <User size={16} />
                        فردي
                    </button>
                    <button
                        onClick={() => setIsBusiness(true)}
                        className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                            isBusiness ? "bg-white dark:bg-card text-primary dark:text-ink shadow-sm" : "text-gray-600 dark:text-muted hover:text-primary"
                        )}
                    >
                        <Building2 size={16} />
                        أعمال / B2B
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="full-name" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                                <User size={14} className="text-secondary" />
                                الاسم الكامل
                            </label>
                            <input 
                                id="full-name"
                                name="name"
                                required type="text" placeholder="الاسم الثلاثي" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                autoComplete="name"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium" />
                        </div>
                        {isBusiness && (
                            <div className="space-y-2">
                                <label htmlFor="business-name" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                                    <Briefcase size={14} className="text-secondary" />
                                    اسم المنشأة
                                </label>
                                <input
                                    id="business-name"
                                    name="businessName"
                                    required type="text" placeholder="اسم الشركة أو المحل"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                    autoComplete="organization"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium" />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                                <Phone size={14} className="text-secondary" />
                                رقم الهاتف
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                required type="tel" placeholder="05xxxxxxx"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                autoComplete="tel"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-left font-medium" dir="ltr" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label htmlFor="email" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                                <Mail size={14} className="text-secondary" />
                                البريد الإلكتروني
                            </label>
                            <input 
                                id="email"
                                name="email"
                                required type="email" placeholder="example@mjm.com" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                autoComplete="email"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-left font-medium" dir="ltr" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label htmlFor="password" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                                <Lock size={14} className="text-secondary" />
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    required
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    autoComplete="new-password"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-right font-inter tracking-[0.2em]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                                    aria-pressed={showPassword}
                                    className="absolute inset-y-0 left-4 px-3 text-gray-400 dark:text-muted hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-600 dark:text-muted font-medium px-2 italic font-inter">Must be at least 8 characters with a mix of letters and numbers.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                            "w-full py-5 rounded-2xl font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95",
                            isLoading ? "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-muted cursor-not-allowed" : "bg-primary text-white shadow-primary/20 hover:bg-secondary hover:text-primary hover:shadow-secondary/20"
                        )}
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <UserPlus size={24} />
                                إنشاء الحساب
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-8 border-t border-primary/5 dark:border-white/10 text-center">
                    <p className="text-gray-500 dark:text-muted font-medium">لديك حساب بالفعل؟</p>
                    <Link href="/auth/login" className="inline-flex items-center gap-2 mt-2 text-secondary font-black text-lg hover:gap-4 transition-all">
                        <span>تسجيل الدخول</span>
                        <ArrowRight size={20} className="rotate-180" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
