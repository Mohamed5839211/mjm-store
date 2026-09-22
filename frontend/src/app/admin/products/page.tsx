"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, Edit2, Trash2, Package, X, Loader2,
    Save, Tag, DollarSign, Box as BoxIcon, Info, Image as ImageLucide
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useCategories, useProducts } from "@/hooks/queries/use-catalog";
import { createProduct, deleteProduct, updateProduct, uploadImages } from "@/lib/api/catalog";
import { queryKeys } from "@/lib/query/client";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";
import type { Product } from "@/types/catalog";

interface ProductForm {
    name: string;
    description: string;
    categoryId: string;
    price: string;
    discountPrice: string;
    stockQuantity: string;
    sku: string;
    images: string[];
    isActive: boolean;
}

const EMPTY_FORM: ProductForm = {
    name: "",
    description: "",
    categoryId: "",
    price: "",
    discountPrice: "",
    stockQuantity: "",
    sku: "",
    images: [""],
    isActive: true,
};

// Categories will be fetched dynamically

export default function AdminProducts() {
    useDocumentTitle('إدارة المنتجات');
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebouncedValue(searchTerm);

    const { data: productsData, isLoading } = useProducts({ limit: 50, search: debouncedSearch || undefined });
    const { data: categoriesData } = useCategories();
    const products = productsData?.items ?? [];
    const total = productsData?.meta.total ?? 0;
    const categories = categoriesData ?? [];

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

    const invalidateProducts = () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.products });
        void queryClient.invalidateQueries({ queryKey: queryKeys.adminProducts });
    };

    const saveMutation = useMutation({
        mutationFn: (payload: { id?: number; body: Record<string, unknown> }) =>
            payload.id != null ? updateProduct(payload.id, payload.body) : createProduct(payload.body),
        onSuccess: () => {
            setIsModalOpen(false);
            invalidateProducts();
            toast.success("تم حفظ المنتج بنجاح");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حفظ المنتج")),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            invalidateProducts();
            toast.success("تم حذف المنتج");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حذف المنتج")),
    });

    const handleDelete = (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
        deleteMutation.mutate(id);
    };

    const openModal = (product: Product | null = null) => {
        if (product) {
            setEditingProduct(product);
            setForm({
                name: product.name,
                description: product.description || "",
                categoryId: product.categoryId?.toString() || (categories[0]?.id?.toString() || ""),
                price: String(product.price),
                discountPrice: product.discountPrice != null ? String(product.discountPrice) : "",
                stockQuantity: String(product.stockQuantity),
                sku: product.sku,
                images: product.images && product.images.length > 0
                  ? product.images.map((img) => img.url)
                  : [""],
                isActive: product.isActive ?? true
            });
        } else {
            setEditingProduct(null);
            setForm({
                ...EMPTY_FORM,
                categoryId: categories[0]?.id?.toString() || "",
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Filter out empty image strings
        const validImages = form.images.filter(img => img.trim() !== "");

        const body: Record<string, unknown> = {
            ...form,
            categoryId: parseInt(form.categoryId),
            price: parseFloat(form.price),
            discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
            stockQuantity: parseInt(form.stockQuantity),
            images: validImages
        };

        saveMutation.mutate({ id: editingProduct?.id, body });
    };

    const removeImageField = (index: number) => {
        const newImages = form.images.filter((_, i) => i !== index);
        setForm({ ...form, images: newImages.length > 0 ? newImages : [""] });
    };

    // Search is debounced via useDebouncedValue and flows into the products query.

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-primary dark:text-ink">إدارة <span className="text-bronze dark:text-secondary">المنتجات الحقيقية</span></h1>
                    <p className="text-gray-600 dark:text-muted font-medium">عرض البيانات الحية من قاعدة بيانات MJM.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-primary text-white py-4 px-8 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all active:scale-95 shrink-0"
                >
                    <Plus size={20} />
                    إضافة منتج جديد
                </button>
            </header>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-card p-4 rounded-[24px] border border-primary/5 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-muted" size={20} aria-hidden="true" />
                    <label htmlFor="product-search" className="sr-only">ابحث عن منتج بالاسم أو الـ SKU</label>
                    <input
                        id="product-search"
                        type="text"
                        placeholder="ابحث عن منتج بالاسم أو الـ SKU..."
                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 pr-12 pl-6 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-right text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {isLoading && <div className="flex items-center px-4"><Loader2 className="animate-spin text-primary dark:text-ink" size={20} /></div>}
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-card rounded-[32px] border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-8">
                            <TableSkeleton rows={5} cols={6} />
                        </div>
                    ) : (
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-primary/5 dark:border-white/10">
                                <tr>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">المنتج</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">التصنيف</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">السعر</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">المخزون</th>
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
                            {products.length > 0 ? products.map((product) => (
                                <motion.tr
                                    key={product.id}
                                    variants={fadeUp}
                                    whileHover={{ backgroundColor: "rgba(235, 176, 57, 0.05)", scale: 0.995, zIndex: 10, transition: { duration: 0.2 } }}
                                    className="transition-colors group relative bg-white dark:bg-card"
                                >
                                    <td className="p-6 rounded-r-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-lg flex items-center justify-center text-primary dark:text-ink group-hover:bg-white dark:group-hover:bg-white/10 dark:hover:bg-white/10 transition-all shadow-sm overflow-hidden">
                                                {product.images && product.images[0] ? (
                                                    <img src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={24} />
                                                )}
                                            </div>
                                            <div className="space-y-0.5 text-right">
                                                <div className="font-bold text-primary dark:text-ink">{product.name}</div>
                                                <div className="text-[10px] font-black text-gray-600 dark:text-muted font-inter tracking-wider">SKU: {product.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-full text-[10px] font-black">
                                            {product.category?.name || 'غير مصنف'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className="font-bold text-primary dark:text-ink font-inter">{product.price} ر.س</span>
                                    </td>
                                    <td className="p-6">
                                        <span className={cn("font-bold font-inter", product.stockQuantity <= 10 ? "text-red-600" : "text-primary dark:text-ink")}>
                                            {product.stockQuantity}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full",
                                                product.isActive ? "bg-green-500" : "bg-red-500"
                                            )} />
                                            <span className="text-xs font-bold text-gray-600 dark:text-muted">{product.isActive ? "نشط" : "معطل"}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-left rounded-l-2xl">
                                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => openModal(product)}
                                                aria-label={`تعديل المنتج ${product.name}`}
                                                className="p-2 text-gray-500 dark:text-muted hover:text-secondary hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all shadow-sm"
                                            >
                                                <Edit2 size={18} aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(product.id)}
                                                aria-label={`حذف المنتج ${product.name}`}
                                                className="p-2 text-gray-500 dark:text-muted hover:text-red-500 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            )) : !isLoading && (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-gray-600 dark:text-muted font-bold">لم يتم العثور على منتجات</td>
                                </tr>
                            )}
                        </motion.tbody>
                        </table>
                    )}
                </div>
                <div className="p-6 bg-gray-50 dark:bg-white/5 flex justify-between items-center text-sm font-bold text-gray-600 dark:text-muted">
                    <span>عرض {products.length} من أصل {total} منتج</span>
                </div>
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-card rounded-[40px] w-full max-w-2xl relative z-10 shadow-2xl h-[90vh] overflow-y-auto no-scrollbar"
                        >
                            <div className="p-10 space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-primary dark:text-ink">
                                        {editingProduct ? "تعديل" : "إضافة"} <span className="text-secondary">منتج</span>
                                    </h2>
                                    <button type="button" onClick={() => setIsModalOpen(false)} aria-label="إغلاق النافذة" className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-500 dark:text-muted hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all">
                                        <X size={20} aria-hidden="true" />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-8 text-right">
                                    {/* Multi-column layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="product-name" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                اسم المنتج
                                                <Tag size={14} className="text-secondary" />
                                            </label>
                                            <input 
                                                id="product-name"
                                                name="name"
                                                required
                                                type="text" 
                                                value={form.name}
                                                onChange={(e) => setForm({...form, name: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="product-sku" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                SKU (رمز المنتج)
                                                <Info size={14} className="text-secondary" />
                                            </label>
                                            <input 
                                                id="product-sku"
                                                name="sku"
                                                required
                                                type="text" 
                                                value={form.sku}
                                                onChange={(e) => setForm({...form, sku: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right font-inter"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="product-description" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                            الوصف
                                            <Info size={14} className="text-secondary" />
                                        </label>
                                        <textarea 
                                            id="product-description"
                                            name="description"
                                            value={form.description}
                                            onChange={(e) => setForm({...form, description: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right min-h-[100px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="product-category" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                التصنيف
                                                <Package size={14} className="text-secondary" />
                                            </label>
                                            <select 
                                                id="product-category"
                                                name="categoryId"
                                                value={form.categoryId}
                                                onChange={(e) => setForm({...form, categoryId: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right appearance-none"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="product-price" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                السعر الافتراضي
                                                <DollarSign size={14} className="text-secondary" />
                                            </label>
                                            <input 
                                                id="product-price"
                                                name="price"
                                                required
                                                type="number" step="0.01"
                                                value={form.price}
                                                onChange={(e) => setForm({...form, price: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="product-discount-price" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                السعر المخفض (اختياري)
                                                <DollarSign size={14} className="text-green-500" />
                                            </label>
                                            <input 
                                                id="product-discount-price"
                                                name="discountPrice"
                                                type="number" step="0.01"
                                                value={form.discountPrice}
                                                onChange={(e) => setForm({...form, discountPrice: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="product-stock" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                الكمية المتوفرة
                                                <BoxIcon size={14} className="text-secondary" />
                                            </label>
                                            <input 
                                                id="product-stock"
                                                name="stockQuantity"
                                                required
                                                type="number"
                                                value={form.stockQuantity}
                                                onChange={(e) => setForm({...form, stockQuantity: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-primary/5 dark:border-white/10 mt-auto">
                                            <label className="flex items-center justify-between cursor-pointer w-full">
                                                <span className="text-xs font-black text-primary dark:text-ink">حالة المنتج (نشط / معطل)</span>
                                                <div className="relative">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={form.isActive}
                                                        onChange={(e) => setForm({...form, isActive: e.target.checked})}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-14 h-7 bg-gray-200 dark:bg-white/10 peer-checked:bg-secondary rounded-full transition-all" />
                                                    <div className="absolute top-0.5 left-0.5 peer-checked:translate-x-7 w-6 h-6 bg-white dark:bg-card rounded-full shadow-md transition-transform" />
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Images Section */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 dark:text-muted uppercase tracking-widest">
                                                الصور الحالية ({form.images.length}/5)
                                            </span>
                                            <label className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                صور المنتج (رفع ملفات)
                                                <ImageLucide size={14} className="text-secondary" />
                                            </label>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                            {form.images.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square bg-gray-50 dark:bg-white/5 rounded-2xl border border-primary/5 dark:border-white/10 overflow-hidden group/img">
                                                    {img ? (
                                                        <>
                                                            <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImageField(idx)}
                                                                aria-label={`حذف الصورة ${idx + 1}`}
                                                                className="absolute top-2 right-2 w-8 h-8 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 group-focus-within/img:opacity-100 focus-within:opacity-100 transition-all hover:bg-red-500"
                                                            >
                                                                <X size={14} aria-hidden="true" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-muted">
                                                            <ImageLucide size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            {form.images.length < 5 && (
                                                <label className="aspect-square border-2 border-dashed border-primary/10 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all text-primary/40 dark:text-ink/40 hover:text-secondary group/add">
                                                    <Plus size={24} className="group-hover/add:scale-110 transition-transform" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">رفع صورة</span>
                                                    <input 
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files || []);
                                                            if (files.length === 0) return;

                                                            // Calculate how many more we can add
                                                            const remaining = 5 - form.images.length;
                                                            const filesToUpload = files.slice(0, remaining);

                                                            if (files.length > remaining) {
                                                                toast.error(`يمكنك رفع بحد أقصى 5 صور فقط. سيتم رفع أول ${remaining} صور.`);
                                                            }

                                                            void uploadImages(filesToUpload).then(
                                                                (uploaded) => {
                                                                    const uploadedUrls = uploaded.map((f) => f.url);
                                                                    setForm(prev => ({
                                                                        ...prev,
                                                                        images: [...prev.images.filter(url => url !== ""), ...uploadedUrls].slice(0, 5)
                                                                    }));
                                                                },
                                                                (err: unknown) => {
                                                                    toast.error(toErrorMessage(err, "خطأ في الاتصال بالخادم أثناء الرفع"));
                                                                },
                                                            );
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 dark:text-muted text-center font-bold">بحد أقصى 5 صور (JPG, PNG, WebP) - الحجم الأقصى 5MB لكل صورة</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saveMutation.isPending}
                                        className="w-full bg-primary text-white py-6 rounded-[24px] font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saveMutation.isPending ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                        حفظ المنتج
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
