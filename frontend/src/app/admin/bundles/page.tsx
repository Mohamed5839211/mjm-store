"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, Package, Edit2, Trash2, X, Loader2,
    Save, Info, List,
    ChevronDown, ChevronUp, MinusCircle
} from "lucide-react";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useBundles, useProducts } from "@/hooks/queries/use-catalog";
import { createBundle, deleteBundle, updateBundle } from "@/lib/api/catalog";
import { queryKeys } from "@/lib/query/client";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import type { Bundle } from "@/types/catalog";

interface BundleItemForm {
    productId: number;
    quantity: number;
}

interface BundleForm {
    name: string;
    description: string;
    bundlePrice: string;
    originalPrice: string;
    badgeText: string;
    imageUrl: string;
    isActive: boolean;
    items: BundleItemForm[];
}

const EMPTY_BUNDLE_FORM: BundleForm = {
    name: "",
    description: "",
    bundlePrice: "",
    originalPrice: "",
    badgeText: "",
    imageUrl: "",
    isActive: true,
    items: [],
};

export default function AdminBundles() {
    useDocumentTitle('إدارة البكجات');
    const queryClient = useQueryClient();
    const { formatPrice } = useCart();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: bundlesData, isLoading: isLoadingBundles } = useBundles();
    const { data: productsData } = useProducts({ limit: 100 });
    const allBundles = useMemo(() => bundlesData ?? [], [bundlesData]);
    const products = useMemo(() => productsData?.items ?? [], [productsData]);
    const loading = isLoadingBundles;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
    const [form, setForm] = useState<BundleForm>(EMPTY_BUNDLE_FORM);
    const [productQuery, setProductQuery] = useState("");

    const visibleProducts = useMemo(() => {
        const term = productQuery.trim().toLowerCase();
        const pool = term
            ? products.filter((p) => p.name.toLowerCase().includes(term))
            : products;
        return pool.slice(0, 8);
    }, [products, productQuery]);

    const filteredBundles = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return allBundles;
        return allBundles.filter((b) => b.name.toLowerCase().includes(term));
    }, [allBundles, searchTerm]);

    const invalidateBundles = () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.bundles });
        void queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts });
    };

    const saveMutation = useMutation({
        mutationFn: (payload: { id?: number; body: Record<string, unknown> }) =>
            payload.id != null ? updateBundle(payload.id, payload.body) : createBundle(payload.body),
        onSuccess: () => {
            setIsModalOpen(false);
            invalidateBundles();
            toast.success("تم حفظ البكج بنجاح");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حفظ البكج")),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBundle,
        onSuccess: () => {
            invalidateBundles();
            toast.success("تم حذف البكج");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حذف البكج")),
    });

    const handleDelete = (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا البكج؟")) return;
        deleteMutation.mutate(id);
    };

    const openModal = (bundle: Bundle | null = null) => {
        setProductQuery("");
        if (bundle) {
            setEditingBundle(bundle);
            setForm({
                name: bundle.name,
                description: bundle.description || "",
                bundlePrice: String(bundle.bundlePrice),
                originalPrice: String(bundle.originalPrice),
                badgeText: bundle.badgeText || "",
                imageUrl: bundle.imageUrl || "",
                isActive: bundle.isActive,
                items: bundle.items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity
                }))
            });
        } else {
            setEditingBundle(null);
            setForm(EMPTY_BUNDLE_FORM);
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.items.length === 0) {
            toast.error("يجب إضافة منتج واحد على الأقل للبكج");
            return;
        }
        const body: Record<string, unknown> = {
            ...form,
            bundlePrice: parseFloat(form.bundlePrice),
            originalPrice: parseFloat(form.originalPrice),
            items: form.items
        };

        saveMutation.mutate({ id: editingBundle?.id, body });
    };

    const addItem = (productId: number) => {
        if (form.items.find(i => i.productId === productId)) return;
        setForm({
            ...form,
            items: [...form.items, { productId, quantity: 1 }]
        });
    };

    const removeItem = (productId: number) => {
        setForm({
            ...form,
            items: form.items.filter(i => i.productId !== productId)
        });
    };

    const updateItemQty = (productId: number, qty: number) => {
        setForm({
            ...form,
            items: form.items.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i)
        });
    };

    // Search filtering is handled by the `filteredBundles` memo above.

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-primary dark:text-ink">إدارة <span className="text-bronze dark:text-secondary">البكجات العائلية</span></h1>
                    <p className="text-gray-600 dark:text-muted font-medium">تحكم في العروض المجمعة والباكجات الاقتصادية.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-primary text-white py-4 px-8 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all active:scale-95 shrink-0"
                >
                    <Plus size={20} />
                    إنشاء بكج جديد
                </button>
            </header>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-card p-4 rounded-[24px] border border-primary/5 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-muted" size={20} aria-hidden="true" />
                    <label htmlFor="bundle-search" className="sr-only">ابحث عن بكج</label>
                    <input
                        id="bundle-search"
                        type="text"
                        placeholder="ابحث عن بكج..."
                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 pr-12 pl-6 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-right text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {loading && <div className="flex items-center px-4"><Loader2 className="animate-spin text-primary dark:text-ink" size={20} /></div>}
            </div>

            {/* Bundles Table */}
            <div className="bg-white dark:bg-card rounded-[32px] border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8">
                            <TableSkeleton rows={3} cols={6} />
                        </div>
                    ) : (
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-primary/5 dark:border-white/10">
                                <tr>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">البكج</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">عدد المنتجات</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">السعر</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">التوفير</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الحالة</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الإجراءات</th>
                                </tr>
                            </thead>
                            <motion.tbody 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="divide-y divide-primary/5 dark:divide-white/10"
                            >
                                {filteredBundles.map((bundle) => (
                                    <motion.tr key={bundle.id} variants={fadeUp} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary dark:text-ink shrink-0">
                                                    {bundle.imageUrl ? (
                                                        <img src={bundle.imageUrl} alt={bundle.name} className="w-full h-full object-cover rounded-xl" />
                                                    ) : <Package size={24} />}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="font-bold text-primary dark:text-ink">{bundle.name}</div>
                                                    {bundle.badgeText && <div className="text-[10px] font-black text-bronze dark:text-secondary uppercase bg-secondary/10 w-fit px-2 py-0.5 rounded-full">{bundle.badgeText}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-bold text-gray-600 dark:text-muted">
                                            {bundle.items?.length || 0} منتجات
                                        </td>
                                        <td className="p-6">
                                            <div className="font-bold text-primary dark:text-ink font-inter">{bundle.bundlePrice} ر.س</div>
                                            <div className="text-xs text-gray-600 dark:text-muted line-through font-inter">{bundle.originalPrice} ر.س</div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-green-700 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">
                                                وفر {Number(bundle.originalPrice) - Number(bundle.bundlePrice)} ر.س
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", bundle.isActive ? "bg-green-500" : "bg-red-500")} />
                                                <span className="text-xs font-bold text-gray-600 dark:text-muted">{bundle.isActive ? "نشط" : "معطل"}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-left">
                                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => openModal(bundle)} aria-label={`تعديل البكج ${bundle.name}`} className="p-2 text-gray-500 dark:text-muted hover:text-secondary rounded-lg transition-all"><Edit2 size={18} aria-hidden="true" /></button>
                                                <button type="button" onClick={() => handleDelete(bundle.id)} aria-label={`حذف البكج ${bundle.name}`} className="p-2 text-gray-500 dark:text-muted hover:text-red-500 rounded-lg transition-all"><Trash2 size={18} aria-hidden="true" /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Bundle Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white dark:bg-card rounded-[40px] w-full max-w-4xl relative z-10 shadow-2xl h-[90vh] overflow-hidden flex flex-col">
                            
                            <div className="p-8 border-b border-primary/5 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <h2 className="text-2xl font-black text-primary dark:text-ink">
                                    {editingBundle ? "تعديل" : "إنشاء"} <span className="text-secondary">بكج</span>
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} aria-label="إغلاق النافذة" className="w-10 h-10 bg-white dark:bg-card rounded-full flex items-center justify-center text-gray-500 dark:text-muted hover:text-red-500 shadow-sm transition-all"><X size={20} aria-hidden="true" /></button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 no-scrollbar">
                                <form onSubmit={handleSave} className="space-y-10 text-right">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Basic Info */}
                                        <div className="space-y-6">
                                            <h3 className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 justify-end">معلومات أساسية <Info size={16} className="text-secondary" /></h3>
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label htmlFor="bundle-name" className="text-[10px] font-black text-gray-600 dark:text-muted uppercase mr-1">اسم البكج</label>
                                                    <input id="bundle-name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label htmlFor="bundle-description" className="text-[10px] font-black text-gray-600 dark:text-muted uppercase mr-1">الوصف</label>
                                                    <textarea id="bundle-description" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label htmlFor="bundle-price" className="text-[10px] font-black text-gray-600 dark:text-muted uppercase mr-1">سعر البكج</label>
                                                        <input id="bundle-price" type="number" step="0.01" required value={form.bundlePrice} onChange={e => setForm({...form, bundlePrice: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold font-inter text-right" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label htmlFor="bundle-original-price" className="text-[10px] font-black text-gray-600 dark:text-muted uppercase mr-1">السعر الأصلي</label>
                                                        <input id="bundle-original-price" type="number" step="0.01" required value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold font-inter text-right" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label htmlFor="bundle-badge" className="text-[10px] font-black text-gray-600 dark:text-muted uppercase mr-1">نص الشارة (Badge)</label>
                                                    <input id="bundle-badge" placeholder="وفر 20%، أفضل قيمة، إلخ..." value={form.badgeText} onChange={e => setForm({...form, badgeText: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Products Selection */}
                                        <div className="space-y-6">
                                            <h3 className="text-sm font-black text-primary dark:text-ink flex items-center gap-2 justify-end">المنتجات المختارة ({form.items.length}) <List size={16} className="text-secondary" /></h3>
                                            <div className="bg-primary/5 dark:bg-white/5 rounded-[32px] p-6 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar border border-primary/5 dark:border-white/10">
                                                {form.items.length === 0 ? (
                                                    <div className="py-10 text-center text-gray-400 dark:text-muted font-bold italic text-sm">لم تقم بإضافة أي منتجات لهذا البكج بعد.</div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {form.items.map((item, idx) => {
                                                            const prod = products.find(p => p.id === item.productId);
                                                            return (
                                                                <div key={idx} className="bg-white dark:bg-card p-4 rounded-2xl flex items-center justify-between shadow-sm border border-primary/5 dark:border-white/10">
                                                                    <button type="button" onClick={() => removeItem(item.productId)} aria-label={`حذف ${prod?.name || 'المنتج'} من البكج`} className="text-red-500 hover:text-red-600 transition-colors"><MinusCircle size={20} aria-hidden="true" /></button>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                                                                            <button type="button" onClick={() => updateItemQty(item.productId, item.quantity - 1)} aria-label={`إنقاص كمية ${prod?.name || 'المنتج'}`} className="p-1 text-gray-500 dark:text-muted hover:text-primary dark:hover:text-secondary"><ChevronDown size={14} aria-hidden="true" /></button>
                                                                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                                            <button type="button" onClick={() => updateItemQty(item.productId, item.quantity + 1)} aria-label={`زيادة كمية ${prod?.name || 'المنتج'}`} className="p-1 text-gray-500 dark:text-muted hover:text-primary dark:hover:text-secondary"><ChevronUp size={14} aria-hidden="true" /></button>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-xs font-bold text-primary dark:text-ink">{prod?.name || 'منتج غير معروف'}</div>
                                                                            <div className="text-[10px] text-gray-600 dark:text-muted font-bold">{formatPrice(prod?.price || 0)}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add Product Search */}
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-muted" size={16} aria-hidden="true" />
                                                    <label htmlFor="bundle-product-search" className="sr-only">ابحث لإضافة منتج</label>
                                                    <input
                                                        id="bundle-product-search"
                                                        type="text"
                                                        placeholder="ابحث لإضافة منتج..."
                                                        className="w-full bg-white dark:bg-card border border-primary/5 dark:border-white/10 py-3 pr-10 pl-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-sm text-right text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted"
                                                        value={productQuery}
                                                        onChange={(e) => setProductQuery(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2 justify-end">
                                                    {visibleProducts.map(p => (
                                                        <button 
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => addItem(p.id)}
                                                            disabled={form.items.some(i => i.productId === p.id)}
                                                            className="text-[10px] font-black py-2 px-3 bg-white dark:bg-card border border-primary/5 dark:border-white/10 rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                                                        >
                                                            + {p.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex gap-4">
                                        <button type="submit" disabled={saveMutation.isPending} className="flex-grow bg-primary text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all">
                                            {saveMutation.isPending ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                            حفظ البكج
                                        </button>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-muted rounded-2xl font-black text-lg hover:bg-gray-200 transition-all">إلغاء</button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
