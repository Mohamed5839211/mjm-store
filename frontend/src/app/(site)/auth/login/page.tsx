"use client";

import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/constants/auth";
import { loginCustomer } from "@/lib/api/auth";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";

function LoginForm() {
    useDocumentTitle('تسجيل الدخول');
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect') || ROUTES.PROFILE;
    const { loginCustomer: saveCustomerSession, user, adminUser, isLoading: authLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (authLoading) return;
        if (user) {
            router.replace(redirectPath);
        } else if (adminUser) {
            router.replace(ROUTES.ADMIN_DASHBOARD);
        }
    }, [user, adminUser, authLoading, router, redirectPath]);

    const loginMutation = useMutation({
        mutationFn: loginCustomer,
        onSuccess: (data) => {
            setError("");
            saveCustomerSession(data.accessToken, data.user, 7);
            router.push(redirectPath);
        },
        onError: (err) => {
            setError(toErrorMessage(err, "بيانات الدخول غير صحيحة"));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ emailOrPhone: email, password });
    };

    const isLoading = loginMutation.isPending;

    return (
        <div className="min-h-[80vh] flex items-center justify-center container mx-auto px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl bg-white dark:bg-card rounded-[50px] shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 p-8 lg:p-16 space-y-10"
            >
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-3xl flex items-center justify-center mx-auto mb-6 group hover:rotate-6 transition-transform">
                        <LogIn size={40} />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-primary dark:text-ink">تسجيل <span className="text-bronze dark:text-secondary">الدخول</span></h1>
                    <p className="text-gray-500 dark:text-muted font-medium tracking-tight">مرحباً بعودتك! يرجى إدخال تفاصيل حسابك للمتابعة.</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-500/15 text-red-500 p-4 rounded-2xl text-center font-bold border border-red-100 animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 mr-2">
                            <Mail size={14} className="text-secondary" />
                            البريد الإلكتروني أو رقم الهاتف
                        </label>
                        <div className="relative group">
                            <input
                                id="email"
                                name="email"
                                required
                                type="text"
                                placeholder="example@mjm.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-right font-medium text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CheckCircle size={18} className="text-green-500" aria-hidden="true" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center mr-2">
                            <label htmlFor="password" className="text-sm font-black text-primary dark:text-ink flex items-center gap-2">
                                <Lock size={14} className="text-secondary" />
                                كلمة المرور
                            </label>
                            <Link href="/contact" className="text-xs font-bold text-bronze dark:text-secondary hover:underline">تحتاج مساعدة؟ تواصل معنا</Link>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-right font-inter tracking-[0.2em] text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted"
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
                                <LogIn size={24} />
                                تسجيل الدخول
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-8 border-t border-primary/5 dark:border-white/10 text-center">
                    <p className="text-gray-500 dark:text-muted font-medium">ليس لديك حساب بعد؟</p>
                    <Link href="/auth/register" className="inline-flex items-center gap-2 mt-2 text-secondary font-black text-lg hover:gap-4 transition-all">
                        <span>إنشاء حساب جديد</span>
                        <ArrowRight size={20} className="rotate-180" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
