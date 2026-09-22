"use client";

import { useCmsSettings } from "@/hooks/queries/use-catalog";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Lock } from "lucide-react";

export default function DynamicBranding() {
    const { data: settings } = useCmsSettings();
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/mjm');

    const faviconUrl = typeof settings?.faviconUrl === 'string' ? settings.faviconUrl : undefined;
    const storeName = typeof settings?.storeName === 'string' ? settings.storeName : undefined;
    const maintenanceMode = settings?.maintenanceMode === true;

    useEffect(() => {
        if (faviconUrl) {
            let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = faviconUrl;
        }

        if (storeName && !isAdmin) {
            document.title = storeName;
        }
    }, [faviconUrl, storeName, isAdmin]);

    if (maintenanceMode && !isAdmin && pathname !== '/auth/login' && !pathname?.startsWith('/auth')) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white dark:bg-card flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary dark:text-ink mb-8 animate-pulse">
                    <Lock size={48} />
                </div>
                <h1 className="text-4xl font-black text-primary dark:text-ink mb-4">المتجر في أعطال صيانة</h1>
                <p className="text-gray-500 dark:text-muted font-bold max-w-md leading-relaxed text-lg">
                    نحن نعمل حالياً على تحسين تجربتكم وتحديث المتجر. سنعود قريباً جداً بشكل أفضل وأقوى. شكراً لانتظاركم وتفهمكم!
                </p>
                <div className="mt-12 text-sm font-black text-bronze dark:text-secondary tracking-widest uppercase bg-secondary/5 px-6 py-2 rounded-full">
                    {storeName || "MJM Store Premium"}
                </div>
            </div>
        );
    }

    return null;
}
