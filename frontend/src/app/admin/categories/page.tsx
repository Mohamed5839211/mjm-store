"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, Edit2, Trash2, LayoutGrid, X, Loader2,
    Save, Tag, Palette, Layers, Info, Image as ImageLucide
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useCategories } from "@/hooks/queries/use-catalog";
import { createCategory, deleteCategory, updateCategory } from "@/lib/api/catalog";
import { queryKeys } from "@/lib/query/client";
import { categoryIcon } from "@/lib/maps";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";
import type { Category } from "@/types/catalog";

interface CategoryForm {
    slug: string;
    name: string;
    nameEn: string;
    description: string;
    icon: string;
    image: string;
    color: string;
    accent: string;
    order: string;
    isActive: boolean;
}

const EMPTY_CATEGORY_FORM: CategoryForm = {
    slug: "",
    name: "",
    nameEn: "",
    description: "",
    icon: "LayoutGrid",
    image: "",
    color: "blue",
    accent: "primary",
    order: "0",
    isActive: true,
};

const availableIcons = ['ShoppingBag', 'Droplets', 'Box', 'Coffee', 'LayoutGrid', 'Tag', 'Layers', 'Palette'];
const availableColors = ['blue', 'sky', 'amber', 'rose', 'emerald', 'indigo', 'orange', 'purple'];

/** Arabic names for the identifier-color swatches (used as accessible names). */
function colorNameAr(color: string): string {
    const names: Record<string, string> = {
        blue: 'الأزرق',
        sky: 'السماوي',
        amber: 'الكهرماني',
        rose: 'الوردي',
        emerald: 'الزمردي',
        indigo: 'النيلي',
        orange: 'البرتقالي',
        purple: 'البنفسجي',
    };
    return names[color] ?? color;
}

export default function AdminCategories() {
    useDocumentTitle('إدارة الفئات');
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const { data: categoriesData, isLoading: loading } = useCategories();
    const categories = categoriesData ?? [];

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form, setForm] = useState<CategoryForm>(EMPTY_CATEGORY_FORM);

    const invalidateCategories = () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.categories });
        void queryClient.invalidateQueries({ queryKey: queryKeys.products });
    };

    const saveMutation = useMutation({
        mutationFn: (payload: { id?: number; body: Record<string, unknown> }) =>
            payload.id != null ? updateCategory(payload.id, payload.body) : createCategory(payload.body),
        onSuccess: () => {
            setIsModalOpen(false);
            invalidateCategories();
            toast.success("تم حفظ القسم بنجاح");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حفظ القسم")),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            invalidateCategories();
            toast.success("تم حذف القسم");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حذف القسم")),
    });

    const handleDelete = (id: number) => {
        if (!confirm("هل أنت متأكد من حذف هذا القسم؟ قد يؤثر ذلك على المنتجات المرتبطة به.")) return;
        deleteMutation.mutate(id);
    };

    const openModal = (category: Category | null = null) => {
        if (category) {
            setEditingCategory(category);
            setForm({
                slug: category.slug,
                name: category.name,
                nameEn: category.nameEn || "",
                description: category.description || "",
                icon: category.icon || "LayoutGrid",
                image: category.image || "",
                color: category.color || "blue",
                accent: category.accent || "primary",
                order: String(category.order),
                isActive: category.isActive
            });
        } else {
            setEditingCategory(null);
            setForm({
                ...EMPTY_CATEGORY_FORM,
                order: (categories.length + 1).toString(),
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const body: Record<string, unknown> = {
            ...form,
            order: parseInt(form.order)
        };

        saveMutation.mutate({ id: editingCategory?.id, body });
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-primary dark:text-ink">إدارة <span className="text-bronze dark:text-secondary">الأقسام</span></h1>
                    <p className="text-gray-600 dark:text-muted font-medium">تحكم في أقسام الموقع وتصنيفات المنتجات بشكل ديناميكي.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-primary text-white py-4 px-8 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all active:scale-95 shrink-0"
                >
                    <Plus size={20} />
                    إضافة قسم جديد
                </button>
            </header>

            {/* Search */}
            <div className="bg-white dark:bg-card p-4 rounded-[24px] border border-primary/5 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-muted" size={20} aria-hidden="true" />
                    <label htmlFor="category-search" className="sr-only">ابحث عن قسم بالاسم أو الرابط المختصر</label>
                    <input
                        id="category-search"
                        name="search"
                        type="text"
                        placeholder="ابحث عن قسم بالاسم أو الرابط المختصر..."
                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 pr-12 pl-6 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-right text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {loading && <div className="flex items-center px-4"><Loader2 className="animate-spin text-primary dark:text-ink" size={20} /></div>}
            </div>

            {/* Categories Table */}
            <div className="bg-white dark:bg-card rounded-[32px] border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8">
                            <TableSkeleton rows={5} cols={6} />
                        </div>
                    ) : (
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-primary/5 dark:border-white/10">
                                <tr>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">القسم</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الرابط (Slug)</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الترتيب</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">المنتجات</th>
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
                            {filteredCategories.length > 0 ? filteredCategories.map((cat) => {
                                const IconComp = categoryIcon(cat.icon);
                                return (
                                    <motion.tr
                                        key={cat.id}
                                        variants={fadeUp}
                                        whileHover={{ backgroundColor: "rgba(235, 176, 57, 0.05)", scale: 0.995, transition: { duration: 0.2 } }}
                                        className="transition-colors group relative bg-white dark:bg-card"
                                    >
                                        <td className="p-6 rounded-r-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm overflow-hidden",
                                                    cat.color === 'blue' ? 'bg-blue-500' :
                                                    cat.color === 'sky' ? 'bg-sky-400' :
                                                    cat.color === 'amber' ? 'bg-amber-500' :
                                                    cat.color === 'rose' ? 'bg-rose-500' : 'bg-primary'
                                                )}>
                                                    {cat.image ? (
                                                        <img 
                                                            src={cat.image.replace('/images/categories/', '/categories/')} 
                                                            alt={cat.name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <IconComp size={24} />
                                                    )}
                                                </div>
                                                <div className="space-y-0.5 text-right">
                                                    <div className="font-bold text-primary dark:text-ink">{cat.name}</div>
                                                    <div className="text-[10px] font-black text-gray-600 dark:text-muted font-inter tracking-wider uppercase">{cat.nameEn || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <code className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-muted rounded text-xs font-inter uppercase tracking-tight">{cat.slug}</code>
                                        </td>
                                        <td className="p-6">
                                            <span className="font-bold text-primary dark:text-ink font-inter">{cat.order}</span>
                                        </td>
                                        <td className="p-6">
                                            <span className="font-bold text-bronze dark:text-secondary font-inter">{cat._count?.products || 0}</span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full",
                                                    cat.isActive ? "bg-green-500" : "bg-red-500"
                                                )} />
                                                <span className="text-xs font-bold text-gray-600 dark:text-muted">{cat.isActive ? "نشط" : "معطل"}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-left rounded-l-2xl">
                                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => openModal(cat)}
                                                    aria-label={`تعديل القسم ${cat.name}`}
                                                    className="p-2 text-gray-500 dark:text-muted hover:text-secondary hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all shadow-sm"
                                                >
                                                    <Edit2 size={18} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(cat.id)}
                                                    aria-label={`حذف القسم ${cat.name}`}
                                                    className="p-2 text-gray-500 dark:text-muted hover:text-red-500 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all shadow-sm"
                                                >
                                                    <Trash2 size={18} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            }) : !loading && (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-gray-600 dark:text-muted font-bold">لم يتم العثور على أقسام</td>
                                </tr>
                            )}
                        </motion.tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Category Modal */}
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
                                        {editingCategory ? "تعديل" : "إضافة"} <span className="text-secondary">قسم</span>
                                    </h2>
                                    <button type="button" onClick={() => setIsModalOpen(false)} aria-label="إغلاق النافذة" className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-500 dark:text-muted hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all">
                                        <X size={20} aria-hidden="true" />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-8 text-right">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="category-name-ar" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                اسم القسم (بالعربية)
                                                <Tag size={14} className="text-secondary" />
                                            </label>
                                            <input 
                                                id="category-name-ar"
                                                name="name"
                                                required
                                                type="text" 
                                                value={form.name}
                                                onChange={(e) => setForm({...form, name: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="category-name-en" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                اسم القسم (بالإنجليزية)
                                                <Tag size={14} className="text-secondary" />
                                            </label>
                                            <input 
                                                id="category-name-en"
                                                name="nameEn"
                                                required
                                                type="text" 
                                                value={form.nameEn}
                                                onChange={(e) => setForm({...form, nameEn: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right font-inter"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="category-slug" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                الرابط المختصر (Slug)
                                                <Info size={14} className="text-secondary" />
                                            </label>
                                            <input 
                                                id="category-slug"
                                                name="slug"
                                                required
                                                type="text" 
                                                value={form.slug}
                                                onChange={(e) => setForm({...form, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right font-inter"
                                                placeholder="e.g. coffee-supplies"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="category-order" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                ترتيب العرض
                                                <Layers size={14} className="text-secondary" />
                                            </label>
                                            <input 
                                                id="category-order"
                                                name="order"
                                                required
                                                type="number" 
                                                value={form.order}
                                                onChange={(e) => setForm({...form, order: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right font-inter"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="category-description" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                            الوصف
                                            <Info size={14} className="text-secondary" />
                                        </label>
                                        <textarea 
                                            id="category-description"
                                            name="description"
                                            value={form.description}
                                            onChange={(e) => setForm({...form, description: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right min-h-[100px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                اللون التعريفي
                                                <Palette size={14} className="text-secondary" />
                                            </label>
                                            <div className="flex flex-wrap gap-3 justify-end" role="group" aria-label="اللون التعريفي">
                                                {availableColors.map(color => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setForm({...form, color})}
                                                        aria-label={`اللون ${colorNameAr(color)}`}
                                                        aria-pressed={form.color === color}
                                                        className={cn(
                                                            "w-8 h-8 rounded-full border-2 transition-all",
                                                            form.color === color ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100",
                                                            color === 'blue' ? 'bg-blue-500' :
                                                            color === 'sky' ? 'bg-sky-400' :
                                                            color === 'amber' ? 'bg-amber-500' :
                                                            color === 'rose' ? 'bg-rose-500' : 
                                                            color === 'emerald' ? 'bg-emerald-500' :
                                                            color === 'indigo' ? 'bg-indigo-500' :
                                                            color === 'orange' ? 'bg-orange-500' : 'bg-purple-500'
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                الأيقونة
                                                <LayoutGrid size={14} className="text-secondary" />
                                            </label>
                                            <div className="flex flex-wrap gap-2 justify-end" role="group" aria-label="أيقونة القسم">
                                                {availableIcons.map(iconName => {
                                                    const IconIcon = categoryIcon(iconName);
                                                    return (
                                                        <button
                                                            key={iconName}
                                                            type="button"
                                                            onClick={() => setForm({...form, icon: iconName})}
                                                            aria-label={`أيقونة ${iconName}`}
                                                            aria-pressed={form.icon === iconName}
                                                            className={cn(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                                form.icon === iconName ? "bg-primary text-white shadow-lg scale-105" : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-muted hover:bg-gray-100 dark:hover:bg-white/10"
                                                            )}
                                                        >
                                                            <IconIcon size={20} aria-hidden="true" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                        <div className="space-y-4">
                                            <label htmlFor="category-image" className="text-xs font-black text-primary dark:text-ink uppercase tracking-widest flex items-center gap-2 justify-end">
                                                رابط الصورة المعبرة
                                                <ImageLucide size={14} className="text-secondary" />
                                            </label>
                                            <input
                                                id="category-image"
                                                type="text"
                                                value={form.image}
                                                onChange={(e) => setForm({...form, image: e.target.value})}
                                                className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right font-inter"
                                                placeholder="/categories/example.png"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-primary/5 dark:border-white/10">
                                            <label className="flex items-center justify-between cursor-pointer w-full">
                                                <span className="text-xs font-black text-primary dark:text-ink">حالة القسم (نشط / معطل)</span>
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

                                    <button
                                        type="submit"
                                        disabled={saveMutation.isPending}
                                        className="w-full bg-primary text-white py-6 rounded-[24px] font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saveMutation.isPending ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                        حفظ القسم
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
