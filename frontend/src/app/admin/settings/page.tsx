"use client";

import {
    Save,
    Globe,
    Bell,
    Database,
    Loader2,
    CheckCircle2,
    Truck,
    X,
    Plus,
    Image as ImageIcon,
    Upload
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useCmsSettings } from "@/hooks/queries/use-catalog";
import { uploadImage } from "@/lib/api/catalog";
import { updateCmsSettings } from "@/lib/api/admin";
import { queryKeys } from "@/lib/query/client";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";

interface StoreConfig {
    storeName: string;
    maintenanceMode: boolean;
    orderEmails: boolean;
    vatRate: number;
    currency: string;
    lowStockThreshold: number;
    freeShippingEnabled: boolean;
    freeShippingThreshold: number;
    announcements: string[];
    announcementSpeed: number;
    logoUrl: string;
    faviconUrl: string;
    socialLinks: Record<string, string>;
}

const DEFAULT_CONFIG: StoreConfig = {
    storeName: "MJM Store",
    maintenanceMode: false,
    orderEmails: true,
    vatRate: 15,
    currency: "SAR",
    lowStockThreshold: 10,
    freeShippingEnabled: true,
    freeShippingThreshold: 299,
    announcements: [],
    announcementSpeed: 20,
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    socialLinks: {
        snapchat: "",
        instagram: "",
        twitter: "",
        facebook: "",
        whatsapp: "",
        tiktok: "",
        linkedin: ""
    }
};

export default function AdminSettings() {
    useDocumentTitle('إعدادات النظام');
    const queryClient = useQueryClient();
    const { data: remoteSettings } = useCmsSettings();
    const [saved, setSaved] = useState(false);
    const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);

    // Seed the editable form from the server snapshot when it first arrives.
    // The form is user-edited afterwards, so it cannot be derived in render.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (remoteSettings) {
            setConfig((prev) => {
                const merged: Record<string, unknown> = { ...prev };
                for (const [key, value] of Object.entries(remoteSettings)) {
                    if (value !== undefined && key in merged) {
                        merged[key] = value;
                    }
                }
                if (Array.isArray(remoteSettings.announcements)) {
                    merged.announcements = remoteSettings.announcements as string[];
                }
                return merged as unknown as StoreConfig;
            });
        }
    }, [remoteSettings]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const saveMutation = useMutation({
        mutationFn: updateCmsSettings,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.cmsSettings });
            setSaved(true);
            toast.success("تم حفظ الإعدادات");
            setTimeout(() => setSaved(false), 3000);
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حفظ الإعدادات")),
    });

    const uploadMutation = useMutation({
        mutationFn: uploadImage,
        onError: (err) => toast.error(toErrorMessage(err, "فشل رفع الصورة")),
    });

    const handleUpload = (file: File | undefined, field: "logoUrl" | "faviconUrl") => {
        if (!file) return;
        uploadMutation.mutate(file, {
            onSuccess: (uploaded) => setConfig({ ...config, [field]: uploaded.url }),
        });
    };

    const handleSave = () => {
        saveMutation.mutate(config as unknown as Record<string, unknown>);
    };

    const loading = saveMutation.isPending;

    return (
        <div className="space-y-8 max-w-4xl">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-primary dark:text-ink">إعدادات <span className="text-bronze dark:text-secondary">النظام</span></h1>
                    <p className="text-gray-600 dark:text-muted font-medium">تخصيص تجربة المتجر وإدارة المعايير العالمية.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-primary text-white py-4 px-8 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (saved ? <CheckCircle2 size={20} /> : <Save size={20} />)}
                    {saved ? "تم الحفظ" : "حفظ التغييرات"}
                </button>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {/* General Settings */}
                <section className="bg-white dark:bg-card rounded-[32px] p-8 border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-primary/5 dark:border-white/10 pb-4">
                        <Globe className="text-primary dark:text-ink" size={24} />
                        <h2 className="text-xl font-black text-primary dark:text-ink">الإعدادات العامة</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="store-name" className="text-sm font-bold text-gray-600 dark:text-muted mr-2">اسم المتجر</label>
                            <input 
                                id="store-name"
                                name="storeName"
                                type="text" 
                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 p-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-primary dark:text-ink"
                                value={config.storeName}
                                onChange={e => setConfig({...config, storeName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="vat-rate" className="text-sm font-bold text-gray-600 dark:text-muted mr-2">ضريبة القيمة المضافة (%)</label>
                            <input 
                                id="vat-rate"
                                name="vatRate"
                                type="number" 
                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 p-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-primary dark:text-ink font-inter"
                                value={config.vatRate}
                                onChange={e => setConfig({...config, vatRate: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-primary/5 dark:bg-white/5 rounded-2xl border border-primary/5 dark:border-white/10">
                        <div className="space-y-0.5">
                            <div className="font-black text-primary dark:text-ink">وضع الصيانة</div>
                            <div className="text-xs font-bold text-gray-600 dark:text-muted">إظهار صفحة «سنتعود قريباً» للعملاء</div>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={config.maintenanceMode}
                            aria-label="وضع الصيانة"
                            onClick={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})}
                            className={cn(
                                "w-14 h-8 rounded-full relative transition-all",
                                config.maintenanceMode ? "bg-secondary" : "bg-gray-200 dark:bg-white/10"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-6 h-6 bg-white dark:bg-card rounded-full shadow-sm transition-all",
                                config.maintenanceMode ? "right-7" : "right-1"
                            )} />
                        </button>
                    </div>
                </section>

                {/* Visual Identity */}
                <section className="bg-white dark:bg-card rounded-[32px] p-8 border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-primary/5 dark:border-white/10 pb-4">
                        <ImageIcon className="text-primary dark:text-ink" size={24} />
                        <h2 className="text-xl font-black text-primary dark:text-ink">الهوية البصرية</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Logo Upload */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-600 dark:text-muted mr-2">شعار المتجر (Logo)</label>
                            <div className="relative group aspect-[3/1] bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-primary/10 dark:border-white/10 flex items-center justify-center overflow-hidden">
                                {config.logoUrl ? (
                                    <img src={config.logoUrl} alt="معاينة شعار المتجر" className="max-h-full object-contain p-4" />
                                ) : (
                                    <div className="text-primary/20 dark:text-ink/20"><ImageIcon size={48} /></div>
                                )}
                                <label className="absolute inset-0 bg-primary/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-2">
                                    <Upload size={24} />
                                    <span className="font-black text-xs">تغيير الشعار</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleUpload(e.target.files?.[0], "logoUrl")}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Favicon Upload */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-600 dark:text-muted mr-2">أيقونة المتصفح (Favicon)</label>
                            <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-primary/5 dark:border-white/10">
                                <div className="w-16 h-16 bg-white dark:bg-card rounded-xl shadow-sm border border-primary/5 dark:border-white/10 flex items-center justify-center overflow-hidden">
                                    {config.faviconUrl ? (
                                        <img src={config.faviconUrl} alt="معاينة أيقونة المتصفح" className="w-8 h-8 object-contain" />
                                    ) : (
                                        <Globe size={24} className="text-primary/20 dark:text-ink/20" />
                                    )}
                                </div>
                                <div className="flex-grow space-y-3">
                                    <p className="text-[10px] text-gray-600 dark:text-muted font-bold leading-tight">الأيقونة التي تظهر بجانب اسم الموقع في تبويب المتصفح.</p>
                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-card border border-primary/10 dark:border-white/10 rounded-lg text-xs font-black text-primary dark:text-ink cursor-pointer hover:bg-primary hover:text-white transition-all">
                                        <Upload size={14} />
                                        رفع أيقونة
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleUpload(e.target.files?.[0], "faviconUrl")}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notifications */}
                <section className="bg-white dark:bg-card rounded-[32px] p-8 border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-primary/5 dark:border-white/10 pb-4">
                        <Bell className="text-primary dark:text-ink" size={24} />
                        <h2 className="text-xl font-black text-primary dark:text-ink">التنبيهات والبريد</h2>
                    </div>

                    <div className="flex items-center justify-between p-2">
                        <div className="space-y-0.5">
                            <div className="font-black text-primary dark:text-ink">تنبيهات الطلبات الجديدة</div>
                            <div className="text-xs font-bold text-gray-600 dark:text-muted">إرسال بريد إلكتروني عند كل طلب جديد</div>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={config.orderEmails}
                            aria-label="تنبيهات الطلبات الجديدة"
                            onClick={() => setConfig({...config, orderEmails: !config.orderEmails})}
                            className={cn(
                                "w-14 h-8 rounded-full relative transition-all",
                                config.orderEmails ? "bg-primary" : "bg-gray-200 dark:bg-white/10"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-6 h-6 bg-white dark:bg-card rounded-full shadow-sm transition-all",
                                config.orderEmails ? "right-7" : "right-1"
                            )} />
                        </button>
                    </div>
                </section>

                {/* Shipping Settings */}
                <section className="bg-white dark:bg-card rounded-[32px] p-8 border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-primary/5 dark:border-white/10 pb-4">
                        <Truck className="text-primary dark:text-ink" size={24} />
                        <h2 className="text-xl font-black text-primary dark:text-ink">إعدادات الشحن المجاني</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-primary/5 dark:bg-white/5 rounded-2xl border border-primary/5 dark:border-white/10">
                        <div className="space-y-0.5">
                            <div className="font-black text-primary dark:text-ink">تفعيل الشحن المجاني</div>
                            <div className="text-xs font-bold text-gray-600 dark:text-muted">السماح للعملاء بالحصول على شحن مجاني عند تجاوز مبلغ معين</div>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={config.freeShippingEnabled}
                            aria-label="تفعيل الشحن المجاني"
                            onClick={() => setConfig({...config, freeShippingEnabled: !config.freeShippingEnabled})}
                            className={cn(
                                "w-14 h-8 rounded-full relative transition-all",
                                config.freeShippingEnabled ? "bg-secondary" : "bg-gray-200 dark:bg-white/10"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-6 h-6 bg-white dark:bg-card rounded-full shadow-sm transition-all",
                                config.freeShippingEnabled ? "right-7" : "right-1"
                            )} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="shipping-threshold" className="text-sm font-bold text-gray-600 dark:text-muted mr-2">الحد الأدنى للشحن المجاني (ر.س)</label>
                        <input 
                            id="shipping-threshold"
                            type="number" 
                            disabled={!config.freeShippingEnabled}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 p-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-primary dark:text-ink font-inter disabled:opacity-50"
                            value={config.freeShippingThreshold}
                            onChange={e => setConfig({...config, freeShippingThreshold: parseFloat(e.target.value)})}
                        />
                    </div>
                </section>

                {/* Announcement Bar */}
                <section className="bg-white dark:bg-card rounded-[32px] p-8 border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-primary/5 dark:border-white/10 pb-4">
                        <Bell className="text-primary dark:text-ink" size={24} />
                        <h2 className="text-xl font-black text-primary dark:text-ink">شريط الإعلانات</h2>
                    </div>

                    <div className="space-y-4">
                        <span id="announcement-texts" className="text-sm font-bold text-gray-600 dark:text-muted mr-2">نصوص الإعلانات المتحركة</span>
                        <div className="space-y-2" role="group" aria-labelledby="announcement-texts">
                            {(config.announcements || []).map((text: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                    <label htmlFor={`announcement-${index}`} className="sr-only">{`نص الإعلان ${index + 1}`}</label>
                                    <input
                                        id={`announcement-${index}`}
                                        type="text"
                                        className="flex-grow bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 p-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-primary dark:text-ink text-sm"
                                        value={text}
                                        onChange={(e) => {
                                            const newAnn = [...(config.announcements || [])];
                                            newAnn[index] = e.target.value;
                                            setConfig({...config, announcements: newAnn});
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newAnn = (config.announcements || []).filter((_, i: number) => i !== index);
                                            setConfig({...config, announcements: newAnn});
                                        }}
                                        aria-label={`حذف الإعلان ${index + 1}`}
                                        className="p-4 bg-red-50 dark:bg-red-500/15 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <X size={20} aria-hidden="true" />
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => setConfig({...config, announcements: [...(config.announcements || []), ""]})}
                                className="w-full py-4 border-2 border-dashed border-gray-500 dark:border-white/10 rounded-xl text-gray-600 dark:text-muted font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} />
                                إضافة إعلان جديد
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="announcement-speed" className="text-sm font-bold text-gray-600 dark:text-muted mr-2">سرعة التمرير (ثواني)</label>
                            <span className="text-xs font-inter font-black text-primary dark:text-ink bg-secondary/10 px-2 py-1 rounded-lg">{config.announcementSpeed}s</span>
                        </div>
                        <input
                            id="announcement-speed"
                            type="range"
                            min="5"
                            max="60"
                            step="1"
                            className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            value={config.announcementSpeed}
                            onChange={e => setConfig({...config, announcementSpeed: parseInt(e.target.value)})}
                        />
                        <div className="flex justify-between text-[10px] text-gray-600 dark:text-muted font-bold uppercase tracking-widest px-1">
                            <span>سريع (5ث)</span>
                            <span>بطيء (60ث)</span>
                        </div>
                    </div>
                </section>

                {/* Social Links Settings */}
                <section className="bg-white dark:bg-card rounded-[32px] p-8 border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 space-y-6">
                    <div className="flex items-center gap-3 border-b border-primary/5 dark:border-white/10 pb-4">
                        <Globe className="text-primary dark:text-ink" size={24} />
                        <h2 className="text-xl font-black text-primary dark:text-ink">روابط التواصل الاجتماعي</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['whatsapp', 'instagram', 'snapchat', 'tiktok', 'twitter', 'facebook', 'linkedin'].map((platform) => (
                            <div key={platform} className="space-y-2">
                                <label htmlFor={`social-${platform}`} className="text-sm font-bold text-gray-600 dark:text-muted mr-2 uppercase">{platform}</label>
                                <input
                                    id={`social-${platform}`}
                                    type="url"
                                    placeholder={`رابط حساب ${platform}`}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 p-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-primary dark:text-ink font-inter text-left"
                                    dir="ltr"
                                    value={config.socialLinks?.[platform] || ""}
                                    onChange={e => setConfig({
                                        ...config,
                                        socialLinks: {
                                            ...config.socialLinks,
                                            [platform]: e.target.value
                                        }
                                    })}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* System Info */}
                <section className="bg-gray-50 dark:bg-white/5 rounded-[32px] p-8 border border-primary/5 dark:border-white/10 space-y-4">
                    <div className="flex items-center gap-3">
                        <Database className="text-primary/40 dark:text-ink/40" size={20} aria-hidden="true" />
                        <span className="text-sm font-black text-gray-600 dark:text-muted uppercase tracking-widest">معلومات النظام</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-card p-4 rounded-2xl border border-primary/5 dark:border-white/10">
                            <div className="text-[10px] font-bold text-gray-600 dark:text-muted">Environment</div>
                            <div className="font-black text-primary dark:text-ink font-inter">Development</div>
                        </div>
                        <div className="bg-white dark:bg-card p-4 rounded-2xl border border-primary/5 dark:border-white/10">
                            <div className="text-[10px] font-bold text-gray-600 dark:text-muted">Version</div>
                            <div className="font-black text-primary dark:text-ink font-inter">v1.2.0-beta</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
