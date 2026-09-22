"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, Edit2, Trash2, Check, X, Loader2,
    Percent, ShoppingBag, Save, Info
} from "lucide-react";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useOffers, useProducts } from "@/hooks/queries/use-catalog";
import { createOffer, deleteOffer, updateOffer } from "@/lib/api/catalog";
import { queryKeys } from "@/lib/query/client";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";
import type { Offer } from "@/types/catalog";

interface OfferForm {
    type: string;
    discountValue: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    productIds: number[];
}

function defaultOfferForm(): OfferForm {
    const today = new Date().toISOString().split('T')[0] as string;
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as string;
    return {
        type: "percentage",
        discountValue: "",
        startDate: today,
        endDate: nextWeek,
        isActive: true,
        productIds: [],
    };
}

export default function AdminOffers() {
    useDocumentTitle('إدارة العروض');
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: offersData, isLoading } = useOffers();
    const { data: productsData } = useProducts({ limit: 100 });
    const allOffers = useMemo(() => offersData ?? [], [offersData]);
    const products = useMemo(() => productsData?.items ?? [], [productsData]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [form, setForm] = useState<OfferForm>(defaultOfferForm());

    const filteredOffers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return allOffers;
        return allOffers.filter((o) => o.type.toLowerCase().includes(term));
    }, [allOffers, searchTerm]);

    const invalidateOffers = () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.offers });
        void queryClient.invalidateQueries({ queryKey: queryKeys.products });
    };

    const saveMutation = useMutation({
        mutationFn: (payload: { id?: number; body: Record<string, unknown> }) =>
            payload.id != null ? updateOffer(payload.id, payload.body) : createOffer(payload.body),
        onSuccess: () => {
            setIsModalOpen(false);
            invalidateOffers();
            toast.success("تم حفظ العرض بنجاح");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حفظ العرض")),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOffer,
        onSuccess: () => {
            invalidateOffers();
            toast.success("تم حذف العرض");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حذف العرض")),
    });

    const handleDelete = (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
        deleteMutation.mutate(id);
    };

    const openModal = (offer: Offer | null = null) => {
        if (offer) {
            setEditingOffer(offer);
            setForm({
                type: offer.type,
                discountValue: String(offer.discountValue),
                startDate: new Date(offer.startDate).toISOString().split('T')[0] as string,
                endDate: new Date(offer.endDate).toISOString().split('T')[0] as string,
                isActive: offer.isActive,
                productIds: offer.offerProducts?.map((op) => op.productId) ?? []
            });
        } else {
            setEditingOffer(null);
            setForm(defaultOfferForm());
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.productIds.length === 0) {
            toast.error("يجب اختيار منتج واحد على الأقل لهذا العرض");
            return;
        }
        const body: Record<string, unknown> = {
            ...form,
            discountValue: parseFloat(form.discountValue),
        };

        saveMutation.mutate({ id: editingOffer?.id, body });
    };

    const toggleProduct = (productId: number) => {
        setForm(prev => ({
            ...prev,
            productIds: prev.productIds.includes(productId) 
                ? prev.productIds.filter(id => id !== productId)
                : [...prev.productIds, productId]
        }));
    };

    const offerTypes = [
        { id: "percentage", name: "خصم مئوي (%)" },
        { id: "second_item_for_1_sar", name: "القطعة الثانية بـ 1 ريال" },
        { id: "B1G1", name: "اشترِ واحد واحصل على الثاني مجاناً" },
        { id: "fixed_bundle_offer", name: "سعر ثابت للمجموعة" }
    ];

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-primary dark:text-ink">إدارة <span className="text-bronze dark:text-secondary">العروض الترويجية</span></h1>
                    <p className="text-gray-600 dark:text-muted font-medium">خطط ونفذ حملات الخصومات والعروض الخاصة.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary text-white py-4 px-8 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all active:scale-95 shrink-0"
                >
                    <Plus size={20} />
                    إضافة عرض جديد
                </button>
            </header>

            {/* Search */}
            <div className="bg-white dark:bg-card p-4 rounded-[24px] border border-primary/5 dark:border-white/10 shadow-sm flex gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-muted" size={20} aria-hidden="true" />
                    <label htmlFor="offer-search" className="sr-only">ابحث عن عرض</label>
                    <input
                        id="offer-search"
                        type="text"
                        placeholder="ابحث عن عرض..."
                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 pr-12 pl-6 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-right text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Offers Table */}
            <div className="bg-white dark:bg-card rounded-[32px] border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8">
                            <TableSkeleton rows={3} cols={6} />
                        </div>
                    ) : (
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-primary/5 dark:border-white/10">
                                <tr>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">نوع العرض</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">القيمة / الميزة</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">المنتجات المشمولة</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الفترة</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الحالة</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5 dark:divide-white/10">
                                {filteredOffers.map((offer) => (
                                    <tr key={offer.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
                                                    <Percent size={20} />
                                                </div>
                                                <div className="font-bold text-primary dark:text-ink">
                                                    {offerTypes.find(t => t.id === offer.type)?.name || offer.type}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-black text-bronze dark:text-secondary">
                                            {offer.type === 'percentage' ? `${offer.discountValue}%` : 'ميزة خاصة'}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex -space-x-2 justify-end">
                                                {(offer.offerProducts ?? []).slice(0, 3).map((op, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-white dark:bg-card border border-primary/10 dark:border-white/10 flex items-center justify-center text-[8px] font-black text-primary dark:text-ink overflow-hidden shadow-sm" title={op.product?.name}>
                                                        {op.product?.images?.[0]?.url ? <img src={op.product.images[0].url} alt={op.product?.name ?? 'منتج'} /> : (op.product?.name?.[0] || 'P')}
                                                    </div>
                                                ))}
                                                {(offer.offerProducts ?? []).length > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 border border-primary/10 dark:border-white/10 flex items-center justify-center text-[8px] font-black text-gray-600 dark:text-muted shadow-sm">
                                                        +{(offer.offerProducts ?? []).length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 text-xs font-bold text-gray-600 dark:text-muted">
                                            {new Date(offer.startDate).toLocaleDateString('ar-SA')} - {new Date(offer.endDate).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", offer.isActive ? "bg-green-500" : "bg-red-500")} />
                                                <span className="text-xs font-bold text-gray-600 dark:text-muted">{offer.isActive ? "نشط" : "معطل"}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-left">
                                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => openModal(offer)} aria-label={`تعديل العرض ${offerTypes.find(t => t.id === offer.type)?.name || offer.type}`} className="p-2 text-gray-500 dark:text-muted hover:text-secondary rounded-lg transition-all"><Edit2 size={18} aria-hidden="true" /></button>
                                                <button type="button" onClick={() => handleDelete(offer.id)} aria-label={`حذف العرض ${offerTypes.find(t => t.id === offer.type)?.name || offer.type}`} className="p-2 text-gray-500 dark:text-muted hover:text-red-500 rounded-lg transition-all"><Trash2 size={18} aria-hidden="true" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Offer Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white dark:bg-card rounded-[40px] w-full max-w-4xl relative z-10 shadow-2xl h-[90vh] overflow-hidden flex flex-col">
                            
                            <div className="p-8 border-b border-primary/5 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5 text-right">
                                <h2 className="text-2xl font-black text-primary dark:text-ink">
                                    {editingOffer ? "تعديل" : "إنشاء"} <span className="text-secondary">عرض ترويجي</span>
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} aria-label="إغلاق النافذة" className="w-10 h-10 bg-white dark:bg-card rounded-full flex items-center justify-center text-gray-500 dark:text-muted hover:text-red-500 shadow-sm transition-all"><X size={20} aria-hidden="true" /></button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 no-scrollbar">
                                <form onSubmit={handleSave} className="space-y-10 text-right">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h3 className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 justify-end">إعدادات العرض <Info size={16} className="text-secondary" /></h3>
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label htmlFor="offer-type" className="text-[10px] font-black text-gray-600 dark:text-muted uppercase mr-1">نوع العرض</label>
                                                    <select id="offer-type" value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right">
                                                        {offerTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </select>
                                                </div>
                                                {form.type === 'percentage' && (
                                                    <div className="space-y-1">
                                                        <label htmlFor="offer-discount" className="text-[10px] font-black text-gray-600 dark:text-muted uppercase mr-1">نسبة الخصم (%)</label>
                                                        <input id="offer-discount" type="number" required value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right" />
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label htmlFor="offer-start" className="text-[10px] font-black text-gray-600 dark:text-muted uppercase mr-1">تاريخ البدء</label>
                                                        <input id="offer-start" type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label htmlFor="offer-end" className="text-[10px] font-black text-gray-600 dark:text-muted uppercase mr-1">تاريخ الانتهاء</label>
                                                        <input id="offer-end" type="date" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-primary/5 dark:border-white/10">
                                                    <label className="flex items-center justify-between cursor-pointer w-full">
                                                        <span className="text-xs font-black text-primary dark:text-ink">حالة العرض (نشط / معطل)</span>
                                                        <div className="relative">
                                                            <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="sr-only peer" />
                                                            <div className="w-14 h-7 bg-gray-200 dark:bg-white/10 peer-checked:bg-secondary rounded-full transition-all" />
                                                            <div className="absolute top-0.5 left-0.5 peer-checked:translate-x-7 w-6 h-6 bg-white dark:bg-card rounded-full shadow-md transition-transform" />
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 justify-end">المنتجات المشمولة <ShoppingBag size={16} className="text-secondary" /></h3>
                                            <div className="bg-primary/5 dark:bg-white/5 rounded-[32px] p-6 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar border border-primary/5 dark:border-white/10">
                                                <div className="grid grid-cols-1 gap-2">
                                                    {products.map(p => (
                                                        <label key={p.id} className="flex items-center justify-between bg-white dark:bg-card p-3 rounded-xl border border-primary/5 dark:border-white/10 cursor-pointer group hover:border-secondary transition-all">
                                                            <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all", form.productIds.includes(p.id) ? "bg-secondary border-secondary" : "border-gray-200 dark:border-white/10")}>
                                                                {form.productIds.includes(p.id) && <Check size={14} className="text-white" />}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-bold text-primary dark:text-ink">{p.name}</span>
                                                                <input type="checkbox" className="sr-only" checked={form.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={saveMutation.isPending} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all">
                                        {saveMutation.isPending ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                        حفظ العرض الترويجي
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
