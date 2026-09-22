"use client";

import { motion } from "framer-motion";
import {
    Users,
    ShoppingBag,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Calendar,
    Loader2
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useSales, useSalesOverview } from "@/hooks/queries/use-admin";

const STAT_ICONS = [DollarSign, ShoppingBag, Users, Package];

export default function AdminDashboard() {
    const { data: overview, isLoading: isLoadingOverview, refetch: refetchOverview } = useSalesOverview();
    const { data: salesReport, isLoading: isLoadingSales, refetch: refetchSales } = useSales('monthly');
    const loading = isLoadingOverview || isLoadingSales;

    const stats = (overview?.stats ?? []).map((s, i) => ({
        ...s,
        name: s.label,
        icon: STAT_ICONS[i] ?? Package,
    }));
    const recentActivity = overview?.recentActivity ?? [];
    const salesData = salesReport?.data ?? [];

    const formatTime = (time: string) => {
        const date = new Date(time);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return "الآن";
        if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
        if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
        return date.toLocaleDateString('ar-SA');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-primary dark:text-ink animate-spin" />
                <p className="text-gray-400 dark:text-muted font-bold">جاري تحميل البيانات الحقيقية...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-primary dark:text-ink">نظرة عامة <span className="text-bronze dark:text-secondary">على المتجر</span></h1>
                    <p className="text-gray-600 dark:text-muted font-medium">مرحباً بك مجدداً في لوحة تحكم MJM.</p>
                </div>
                <div className="bg-white dark:bg-card p-2 rounded-2xl shadow-sm border border-primary/5 dark:border-white/10 flex gap-2">
                    <button
                        onClick={() => { void refetchOverview(); void refetchSales(); }}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 hover:bg-secondary hover:text-primary"
                    >تحديث</button>
                </div>
            </header>

            {/* Stats Grid */}
            <motion.section 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {stats.map((stat) => (
                    <motion.div
                        key={stat.name}
                        variants={fadeUp}
                        whileHover={{ y: -5, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                        className="bg-white dark:bg-card p-8 rounded-[32px] border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 space-y-4 group hover:border-secondary transition-all"
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 rounded-2xl flex items-center justify-center text-primary dark:text-ink group-hover:bg-primary group-hover:text-white transition-all">
                                <stat.icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-black ${stat.positive ? "text-green-700" : "text-red-600"}`}>
                                {stat.trend}
                                {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm font-bold text-gray-600 dark:text-muted uppercase tracking-widest">{stat.name}</div>
                            <div className="text-2xl font-black text-primary dark:text-ink font-inter tracking-tight">{stat.value}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.section>

            {/* Charts / Activity Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart Real Data Mapping */}
                <div className="lg:col-span-2 bg-white dark:bg-card rounded-[40px] p-10 border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 space-y-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-primary dark:text-ink">إحصائيات المبيعات (آخر 30 يوم)</h2>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-muted">
                                <span className="w-3 h-3 rounded-full bg-primary" /> مبيعات حقيقية
                            </div>
                        </div>
                    </div>
                    {/* Real Chart Visual */}
                    <div className="h-64 flex items-end gap-2 touch-none overflow-x-auto pb-4 custom-scrollbar">
                        {salesData.length > 0 ? salesData.map((d, i) => {
                            const maxSales = Math.max(...salesData.map(item => item.sales), 1);
                            const height = (d.sales / maxSales) * 100;
                            return (
                                <div key={i} className="min-w-[40px] flex-grow flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-primary/5 dark:bg-white/5 rounded-t-xl relative overflow-hidden flex-grow cursor-pointer">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max(height, 5)}%` }}
                                            transition={{ duration: 1, delay: i * 0.05 }}
                                            className="absolute bottom-0 w-full bg-primary group-hover:bg-secondary transition-colors"
                                        />
                                        {/* Tooltip on hover */}
                                        <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] p-1 rounded -translate-y-2">
                                            {d.sales} ر.س
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-600 dark:text-muted font-inter uppercase whitespace-nowrap">
                                        {d.date.split('-').slice(1).join('/')}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-muted font-bold">
                                لا توجد مبيعات في هذه الفترة
                            </div>
                        )}
                    </div>
                </div>

                {/* Real Recent Activity */}
                <div className="bg-white dark:bg-card rounded-[40px] p-10 border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 space-y-8">
                    <h2 className="text-xl font-black text-primary dark:text-ink">آخر التحركات الحية</h2>
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                            <motion.div 
                                key={item.id} 
                                variants={fadeUp}
                                className="flex gap-4 relative"
                            >
                                <div className="w-10 h-10 bg-primary/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary dark:text-ink shrink-0 relative z-10 border border-primary/5 dark:border-white/10">
                                    <Calendar size={18} />
                                </div>
                                {i !== recentActivity.length - 1 && <div className="absolute top-10 right-[19px] w-[2px] h-10 bg-primary/5 dark:bg-white/5" />}
                                <div className="space-y-0.5">
                                    <div className="text-sm font-black text-primary dark:text-ink">{item.message}</div>
                                    <div className="text-[10px] font-bold text-gray-600 dark:text-muted">{formatTime(item.time)}</div>
                                </div>
                            </motion.div>
                        )) : (
                            <p className="text-gray-600 dark:text-muted text-sm font-bold text-center py-10">لا توجد نشاطات مؤخراً</p>
                        )}
                    </motion.div>
                    <button className="w-full py-4 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-2xl text-xs font-black hover:bg-primary hover:text-white transition-all">مراقبة النظام</button>
                </div>
            </section>
        </div>
    );
}
