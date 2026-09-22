"use client";

import Link from "next/link";
import { Home, ShoppingBag, User, Package } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "الرئيسية", icon: Home, path: "/" },
        { name: "المتجر", icon: ShoppingBag, path: "/shop" },
        { name: "السلة", icon: ShoppingBag, path: "/cart", badge: 0 },
        { name: "B2B", icon: Package, path: "/custom-printing" },
        { name: "حسابي", icon: User, path: "/profile" },
    ];

    return (
        <nav
            aria-label="التنقل السريع"
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-card/80 backdrop-blur-lg border-t border-primary/5 dark:border-white/10 px-6 py-4 z-50 rounded-t-[32px] shadow-2xl shadow-primary/20"
        >
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all relative",
                                isActive ? "text-primary dark:text-ink scale-110" : "text-gray-400 dark:text-muted hover:text-primary/60"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                isActive ? "bg-secondary text-primary shadow-lg shadow-secondary/20" : ""
                            )}>
                                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn("text-[10px] font-black uppercase tracking-tighter transition-all", isActive ? "opacity-100 mt-1" : "opacity-0 h-0")}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
