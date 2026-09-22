'use client';

import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants/auth";
import { loginAdmin } from "@/lib/api/auth";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function AdminSecretLogin() {
    useDocumentTitle('دخول الإدارة');
    const router = useRouter();
    const { loginAdmin: saveAdminSession, adminUser, isLoading: authLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (!authLoading && adminUser) {
            router.replace(ROUTES.ADMIN_DASHBOARD);
        }
    }, [adminUser, authLoading, router]);

    const loginMutation = useMutation({
        mutationFn: loginAdmin,
        onSuccess: (data) => {
            setError("");
            // 30-day mirrored cookie for the Edge proxy
            saveAdminSession(data.accessToken, data.user, 30);
            router.push(ROUTES.ADMIN_DASHBOARD);
        },
        onError: (err) => {
            setError(toErrorMessage(err, "فشل تسجيل الدخول"));
        },
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ emailOrPhone: email, password });
    };

    const isLoading = loginMutation.isPending;

    return (
        <div className="min-h-screen bg-primary relative flex items-center justify-center px-4 py-16 overflow-hidden">
            {/* Calm backdrop: faint grid + single soft glow */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:44px_44px]"
            />
            <div aria-hidden="true" className="absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[280px] bg-secondary/15 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative"
            >
                <div className="bg-white dark:bg-card rounded-[32px] shadow-2xl overflow-hidden">
                    {/* Card header */}
                    <div className="px-8 pt-10 pb-8 text-center border-b border-primary/5 dark:border-white/10">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
                            <ShieldCheck size={32} className="text-secondary" />
                        </div>
                        <h1 className="text-2xl font-black text-primary dark:text-ink">إدارة MJM</h1>
                        <p className="text-sm text-gray-500 dark:text-muted font-medium mt-1">لوحة التحكم المركزية — دخول الموظفين فقط</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="admin-email" className="text-xs font-black text-gray-500 dark:text-muted uppercase tracking-widest mr-1">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <input
                                    id="admin-email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    type="email"
                                    dir="ltr"
                                    placeholder="admin@mjm.com"
                                    autoComplete="username"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/10 dark:border-white/10 py-3.5 px-4 pl-11 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all font-medium text-primary dark:text-ink text-left"
                                />
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-muted pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="admin-password" className="text-xs font-black text-gray-500 dark:text-muted uppercase tracking-widest mr-1">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <input
                                    id="admin-password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    type={showPassword ? "text" : "password"}
                                    dir="ltr"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/10 dark:border-white/10 py-3.5 px-4 pl-11 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all font-medium text-primary dark:text-ink text-left tracking-[0.2em]"
                                />
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-muted pointer-events-none" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 dark:text-muted hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 dark:bg-red-500/15 border border-red-100 p-3.5 rounded-2xl flex items-center gap-2.5 text-red-600 text-sm font-bold"
                                role="alert"
                            >
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2.5 active:scale-[0.98]",
                                isLoading
                                    ? "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-muted cursor-not-allowed shadow-none"
                                    : "bg-secondary text-primary shadow-secondary/25 hover:brightness-105"
                            )}
                        >
                            {isLoading ? (
                                <span className="w-6 h-6 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    دخول لوحة التحكم
                                </>
                            )}
                        </button>
                    </form>

                    {/* Card footer */}
                    <div className="px-8 pb-7 flex items-center justify-between text-xs font-bold text-gray-400 dark:text-muted">
                        <span className="inline-flex items-center gap-1.5">
                            <Lock size={13} />
                            جلسة مشفرة
                        </span>
                        <Link href="/" className="inline-flex items-center gap-1 hover:text-primary dark:hover:text-secondary transition-colors">
                            العودة للمتجر
                            <ArrowRight size={14} className="rotate-180" />
                        </Link>
                    </div>
                </div>

                <p className="text-center text-[11px] font-bold text-white/30 mt-6 tracking-widest uppercase">
                    MJM Store — Secure Administration
                </p>
            </motion.div>
        </div>
    );
}
