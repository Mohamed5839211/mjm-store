"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, Settings, LogOut, Users, UserCheck, Menu, LayoutGrid, FileText, Newspaper } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function AdminSidebar() {
    const pathname = usePathname();
    const { adminUser, logoutAdmin } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => logoutAdmin();

    const canManageStaff = adminUser?.role === "super_admin";

    const menuItems = [
        { name: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
        { name: "المنتجات", href: "/admin/products", icon: Package },
        { name: "البكجات", href: "/admin/bundles", icon: Package },
        { name: "العروض", href: "/admin/offers", icon: ShoppingBag },
        { name: "الفئات", href: "/admin/categories", icon: LayoutGrid },
        { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
        { name: "المستخدمين", href: "/admin/users", icon: Users },
        { name: "إدارة الشحن", href: "/admin/shipping", icon: ShoppingBag },
        { name: "الفواتير", href: "/admin/invoices", icon: FileText },
        ...(canManageStaff ? [{ name: "فريق العمل", href: "/admin/staff", icon: UserCheck }] : []),
        { name: "طلبات الطباعة", href: "/admin/requests", icon: MessageSquare },
        { name: "المحتوى", href: "/admin/cms", icon: Newspaper },
        { name: "الإعدادات", href: "/admin/settings", icon: Settings },
    ];

    return (
        <motion.aside 
            animate={{ width: isCollapsed ? 88 : 288 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="bg-white dark:bg-card border-l border-primary/5 dark:border-white/10 h-screen sticky top-0 flex flex-col p-4 overflow-hidden shrink-0 z-50 shadow-2xl shadow-primary/5"
        >
            <div className="flex items-center justify-between px-2 mb-8">
                <AnimatePresence mode="popLayout">
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                            className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
                        >
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-primary/20">M</div>
                            <span className="text-xl font-black text-primary dark:text-ink tracking-tight">MJM <span className="text-bronze dark:text-secondary">Control</span></span>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 dark:text-muted hover:text-primary hover:bg-primary/5 transition-all shrink-0"
                >
                    <Menu size={20} aria-hidden="true" />
                </button>
            </div>

            <nav className="flex-grow space-y-2 relative no-scrollbar overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center p-3 rounded-2xl transition-all group relative",
                                isActive ? "text-primary dark:text-ink" : "text-gray-500 dark:text-muted hover:bg-primary/5 hover:text-primary dark:hover:text-secondary"
                            )}
                            title={isCollapsed ? item.name : undefined}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="admin-active-bg" 
                                    className="absolute inset-0 bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-2xl -z-10 shadow-[0_0_15px_rgba(235,176,57,0.1)]" 
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                />
                            )}
                            
                            <div className="flex items-center gap-4 min-w-[40px] justify-center lg:justify-start px-1 shrink-0">
                                <item.icon size={22} className={cn("transition-all duration-300", isActive ? "text-secondary scale-110 drop-shadow-md" : "group-hover:text-secondary group-hover:scale-110")} />
                            </div>
                            
                            <AnimatePresence mode="popLayout">
                                {!isCollapsed && (
                                    <motion.span 
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn("font-bold whitespace-nowrap", isActive ? "text-primary dark:text-ink" : "text-gray-600 dark:text-muted")}
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-4 border-t border-primary/5 dark:border-white/10 mt-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="تسجيل الخروج"
                    className="w-full flex items-center p-3 rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-700 transition-all font-bold group relative"
                    title={isCollapsed ? "تسجيل الخروج" : undefined}
                >
                    <div className="flex items-center gap-4 min-w-[40px] justify-center lg:justify-start px-1 shrink-0">
                        <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                    </div>
                    
                    <AnimatePresence mode="popLayout">
                        {!isCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="whitespace-nowrap"
                            >
                                تسجيل الخروج
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}
