"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Truck, Package, Globe, Plus, Edit2, Trash2,
    ExternalLink, MapPin,
    Save, X, Settings
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/animations";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { queryKeys } from "@/lib/query/client";
import {
    createShippingZone,
    deleteShippingZone,
    fetchShippingZones,
    updateShippingZone,
} from "@/lib/api/commerce";
import {
    fetchShipments,
    fetchShippingProviders,
    updateShippingProvider,
} from "@/lib/api/admin";
import { SHIPMENT_STATUS_MAP, statusMeta } from "@/lib/maps";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";
import type { ShippingZone } from "@/types/commerce";

type Tab = 'shipments' | 'zones' | 'providers';

interface ZoneForm {
    name: string;
    cities: string;
    baseRate: string;
    freeShippingThreshold: string;
    isActive: boolean;
}

const EMPTY_ZONE_FORM: ZoneForm = {
    name: "",
    cities: "",
    baseRate: "",
    freeShippingThreshold: "",
    isActive: true,
};

export default function ShippingManagement() {
    useDocumentTitle('إدارة الشحن');
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab>('shipments');

    const { data: shipmentsData, isLoading: isLoadingShipments } = useQuery({
        queryKey: ['admin', 'shipments'],
        queryFn: fetchShipments,
        enabled: activeTab === 'shipments',
    });
    const { data: zonesData, isLoading: isLoadingZones } = useQuery({
        queryKey: queryKeys.adminShipping,
        queryFn: fetchShippingZones,
        enabled: activeTab === 'zones',
    });
    const { data: providersData, isLoading: isLoadingProviders } = useQuery({
        queryKey: ['admin', 'shipping-providers'],
        queryFn: fetchShippingProviders,
        enabled: activeTab === 'providers',
    });

    const shipments = shipmentsData?.items ?? [];
    const zones = zonesData ?? [];
    const providers = providersData ?? [];
    const isLoading = isLoadingShipments || isLoadingZones || isLoadingProviders;

    // Modal states
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
    const [zoneForm, setZoneForm] = useState<ZoneForm>(EMPTY_ZONE_FORM);

    const invalidateShipping = () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.adminShipping });
        void queryClient.invalidateQueries({ queryKey: ['admin', 'shipments'] });
        void queryClient.invalidateQueries({ queryKey: ['admin', 'shipping-providers'] });
    };

    const saveZoneMutation = useMutation({
        mutationFn: (payload: { id?: number; body: Record<string, unknown> }) =>
            payload.id != null ? updateShippingZone(payload.id, payload.body) : createShippingZone(payload.body),
        onSuccess: () => {
            setIsZoneModalOpen(false);
            setEditingZone(null);
            invalidateShipping();
            toast.success("تم حفظ المنطقة بنجاح");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حفظ المنطقة")),
    });

    const deleteZoneMutation = useMutation({
        mutationFn: deleteShippingZone,
        onSuccess: () => {
            invalidateShipping();
            toast.success("تم حذف المنطقة");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حذف المنطقة")),
    });

    const toggleProviderMutation = useMutation({
        mutationFn: (payload: { id: number; isActive: boolean }) =>
            updateShippingProvider(payload.id, { isActive: payload.isActive }),
        onSuccess: () => {
            invalidateShipping();
            toast.success("تم تحديث حالة الشركة");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل تحديث الشركة")),
    });

    const openZoneModal = (zone: ShippingZone | null) => {
        if (zone) {
            setEditingZone(zone);
            setZoneForm({
                name: zone.name,
                cities: zone.cities.join(', '),
                baseRate: String(zone.baseRate),
                freeShippingThreshold: zone.freeShippingThreshold != null ? String(zone.freeShippingThreshold) : "",
                isActive: zone.isActive,
            });
        } else {
            setEditingZone(null);
            setZoneForm(EMPTY_ZONE_FORM);
        }
        setIsZoneModalOpen(true);
    };

    const handleZoneSave = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: Record<string, unknown> = {
            ...zoneForm,
            cities: zoneForm.cities.split(',').map(c => c.trim()).filter(Boolean),
            baseRate: parseFloat(zoneForm.baseRate),
            freeShippingThreshold: zoneForm.freeShippingThreshold ? parseFloat(zoneForm.freeShippingThreshold) : null
        };

        saveZoneMutation.mutate({ id: editingZone?.id, body: payload });
    };

    const handleZoneDelete = (id: number) => {
        if (!confirm("هل أنت متأكد من حذف منطقة الشحن؟")) return;
        deleteZoneMutation.mutate(id);
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary dark:text-ink mb-2">إدارة <span className="text-bronze dark:text-secondary">الشحن والمناطق</span></h1>
                    <p className="text-gray-600 dark:text-muted font-medium">تحكم في الشحنات، المناطق الجغرافية، وأسعار التوصيل.</p>
                </div>
                {activeTab === 'zones' && (
                        <button
                            onClick={() => openZoneModal(null)}
                        className="bg-primary text-white py-4 px-8 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        إضافة منطقة جديدة
                    </button>
                )}
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1.5 bg-gray-100/50 dark:bg-white/10 rounded-2xl w-fit">
                {[
                    { id: 'shipments', label: 'الشحنات والطلبات', icon: Package },
                    { id: 'zones', label: 'مناطق الشحن والأسعار', icon: Globe },
                    { id: 'providers', label: 'شركات الشحن', icon: Truck },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm",
                            activeTab === tab.id
                                ? "bg-white dark:bg-card text-primary dark:text-ink shadow-sm"
                                : "text-gray-600 dark:text-muted hover:text-primary dark:hover:text-secondary"
                        )}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-card rounded-[40px] shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 overflow-hidden min-h-[500px]">
                {isLoading ? (
                    <div className="p-8"><TableSkeleton rows={5} cols={5} /></div>
                ) : (
                    <div className="p-8">
                        {activeTab === 'shipments' && (
                            <div className="space-y-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-white/5 text-gray-600 dark:text-muted text-[10px] font-black uppercase tracking-widest border-b border-primary/5 dark:border-white/10">
                                                <th scope="col" className="px-6 py-5">رقم التتبع / الطلب</th>
                                                <th scope="col" className="px-6 py-5">العميل والوجهة</th>
                                                <th scope="col" className="px-6 py-5">الشركة الناقلة</th>
                                                <th scope="col" className="px-6 py-5">الحالة</th>
                                                <th scope="col" className="px-6 py-5 text-center">الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/5 dark:divide-white/10">
                                            {shipments.map((s) => (
                                                <tr key={s.id} className="hover:bg-primary/5 transition-colors group">
                                                    <td className="px-6 py-6">
                                                        <div className="font-inter font-bold text-primary dark:text-ink">{s.trackingNumber || 'N/A'}</div>
                                                        <div className="text-[10px] text-gray-600 dark:text-muted font-bold uppercase">ORDER #MJM-{s.orderId}</div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="font-bold text-primary dark:text-ink">{s.order?.customer?.name}</div>
                                                        <div className="flex items-center gap-1 text-xs text-bronze dark:text-secondary font-medium">
                                                            <MapPin size={12} />
                                                            {s.order?.address?.city} - {s.order?.address?.district}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 font-bold text-gray-600 dark:text-muted">{s.provider?.name}</td>
                                                    <td className="px-6 py-6">
                                                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black", statusMeta(SHIPMENT_STATUS_MAP, s.status).style)}>
                                                            {statusMeta(SHIPMENT_STATUS_MAP, s.status).label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            {s.labelUrl && (
                                                                <a href={s.labelUrl} target="_blank" aria-label={`ملصق الشحنة ${s.trackingNumber || s.orderId}`} className="p-2 bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                                                                    <ExternalLink size={16} aria-hidden="true" />
                                                                </a>
                                                            )}
                                                            <button type="button" aria-label={`إعدادات الشحنة ${s.trackingNumber || s.orderId}`} className="p-2 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-muted rounded-lg hover:bg-primary hover:text-white transition-all">
                                                                <Settings size={16} aria-hidden="true" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {shipments.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-20 text-center text-gray-600 dark:text-muted font-bold">لا توجد شحنات مسجلة حالياً</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'zones' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {zones.map((zone) => (
                                    <motion.div 
                                        key={zone.id}
                                        {...fadeUp}
                                        className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-primary/5 dark:border-white/10 space-y-4 hover:border-secondary transition-all"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-12 bg-white dark:bg-card rounded-2xl flex items-center justify-center text-secondary shadow-sm">
                                                <Globe size={24} />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openZoneModal(zone)}
                                                    aria-label={`تعديل منطقة ${zone.name}`}
                                                    className="p-2 bg-white dark:bg-card text-gray-500 dark:text-muted rounded-lg hover:text-primary transition-all"
                                                >
                                                    <Edit2 size={16} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleZoneDelete(zone.id)}
                                                    aria-label={`حذف منطقة ${zone.name}`}
                                                    className="p-2 bg-white dark:bg-card text-gray-500 dark:text-muted rounded-lg hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={16} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-lg font-black text-primary dark:text-ink">{zone.name}</h2>
                                            <p className="text-xs text-gray-600 dark:text-muted font-bold uppercase truncate">
                                                {zone.cities.join(' • ')}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/5 dark:border-white/10">
                                            <div>
                                                <div className="text-[10px] font-black text-gray-600 dark:text-muted uppercase">سعر الشحن</div>
                                                <div className="text-xl font-black text-primary dark:text-ink font-inter">{zone.baseRate} <span className="text-xs">ر.س</span></div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-600 dark:text-muted uppercase">حد الشحن المجاني</div>
                                                <div className="text-xl font-black text-bronze dark:text-secondary font-inter">{zone.freeShippingThreshold || '—'} <span className="text-xs">ر.س</span></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'providers' && (
                            <div className="space-y-6">
                                {providers.map((p) => (
                                    <div key={p.id} className="p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-primary/5 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-6 text-right md:text-right">
                                            <div className="w-16 h-16 bg-white dark:bg-card rounded-2xl flex items-center justify-center text-primary dark:text-ink shadow-sm border border-primary/5 dark:border-white/10">
                                                <Truck size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-xl font-black text-primary dark:text-ink">{p.name}</h2>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("w-2 h-2 rounded-full", p.isActive ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-gray-300 dark:bg-white/25")} />
                                                    <span className="text-xs font-bold text-gray-600 dark:text-muted uppercase">{p.isActive ? 'مفعل' : 'غير مفعل'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => toggleProviderMutation.mutate({ id: p.id, isActive: !p.isActive })}
                                                disabled={toggleProviderMutation.isPending}
                                                className={cn(
                                                "py-3 px-6 rounded-xl font-bold transition-all disabled:opacity-50",
                                                p.isActive ? "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white" : "bg-green-50 text-green-700 hover:bg-green-500 hover:text-white"
                                            )}>
                                                {p.isActive ? 'تعطيل الخدمة' : 'تفعيل الخدمة'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Zone Modal */}
            <AnimatePresence>
                {isZoneModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
                            onClick={() => setIsZoneModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-card rounded-[40px] w-full max-w-lg relative z-10 shadow-3xl p-10 space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-primary dark:text-ink">
                                    {editingZone ? 'تعديل' : 'إضافة'} <span className="text-secondary">منطقة شحن</span>
                                </h2>
                                                <button type="button" onClick={() => setIsZoneModalOpen(false)} aria-label="إغلاق النافذة" className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-500 dark:text-muted hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all">
                                                    <X size={20} aria-hidden="true" />
                                                </button>
                            </div>

                            <form onSubmit={handleZoneSave} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="zone-name" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest">اسم المنطقة</label>
                                    <input 
                                        id="zone-name"
                                        required
                                        type="text" 
                                        placeholder="مثلاً: المنطقة الوسطى"
                                        value={zoneForm.name}
                                        onChange={(e) => setZoneForm({...zoneForm, name: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="zone-cities" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest">المدن (مفصولة بفاصلة)</label>
                                    <textarea 
                                        id="zone-cities"
                                        required
                                        placeholder="الرياض, الخرج, المجمعة..."
                                        value={zoneForm.cities}
                                        onChange={(e) => setZoneForm({...zoneForm, cities: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="base-rate" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest">سعر الشحن</label>
                                        <input 
                                            id="base-rate"
                                            required
                                            type="number" 
                                            placeholder="25.00"
                                            value={zoneForm.baseRate}
                                            onChange={(e) => setZoneForm({...zoneForm, baseRate: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold font-inter"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="threshold" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest">حد الشحن المجاني</label>
                                        <input 
                                            id="threshold"
                                            type="number" 
                                            placeholder="299.00"
                                            value={zoneForm.freeShippingThreshold}
                                            onChange={(e) => setZoneForm({...zoneForm, freeShippingThreshold: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold font-inter"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                    <Save size={20} />
                                    حفظ التغييرات
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
