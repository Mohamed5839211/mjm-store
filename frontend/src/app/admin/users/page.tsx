"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Search, Edit2, Trash2, Mail, Phone, Lock, X,
    User, Briefcase, Calendar, Building2
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useAdminCustomers, useAdminMutation } from "@/hooks/queries/use-admin";
import { deleteAdminCustomer, updateAdminCustomer } from "@/lib/api/admin";
import { queryKeys } from "@/lib/query/client";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";
import type { SessionUser } from "@/types/auth";

type Customer = SessionUser & { createdAt: string; _count?: { orders: number } };

interface CustomerEditForm {
    name: string;
    phone: string;
    password: string;
    isBusiness: boolean;
    businessName: string;
}

const EMPTY_CUSTOMER_FORM: CustomerEditForm = {
    name: "",
    phone: "",
    password: "",
    isBusiness: false,
    businessName: "",
};

export default function AdminUsersPage() {
    useDocumentTitle('إدارة المستخدمين');
    const queryClient = useQueryClient();
    const { data: customersData, isLoading, isError } = useAdminCustomers();
    const customers = (customersData ?? []) as Customer[];
    const [searchQuery, setSearchQuery] = useState("");

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [editForm, setEditForm] = useState<CustomerEditForm>(EMPTY_CUSTOMER_FORM);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

    const invalidateCustomers = () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    };

    const updateMutation = useAdminMutation({
        mutationFn: (payload: { id: number; body: Record<string, unknown> }) =>
            updateAdminCustomer(payload.id, payload.body),
        invalidate: [queryKeys.adminUsers],
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAdminCustomer,
        onSuccess: () => {
            invalidateCustomers();
            setIsDeleteModalOpen(false);
            setCustomerToDelete(null);
            toast.success("تم حذف المستخدم");
        },
        onError: (err) => toast.error(toErrorMessage(err, "حدث خطأ أثناء الحذف")),
    });

    const openEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setEditForm({
            name: customer.name,
            phone: customer.phone ?? "",
            password: "",
            isBusiness: customer.isBusiness ?? false,
            businessName: customer.businessName || ""
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;

        const body: Record<string, unknown> = {
            name: editForm.name,
            phone: editForm.phone,
            isBusiness: editForm.isBusiness,
            businessName: editForm.isBusiness ? editForm.businessName : null
        };
        if (editForm.password) {
            body.password = editForm.password;
        }

        updateMutation.mutate(
            { id: editingCustomer.id, body },
            {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setEditingCustomer(null);
                    toast.success("تم تحديث البيانات");
                },
                onError: (err) => toast.error(toErrorMessage(err, "فشل تحديث البيانات")),
            },
        );
    };

    const openDeleteConfirm = (customer: Customer) => {
        setCustomerToDelete(customer);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!customerToDelete) return;
        deleteMutation.mutate(customerToDelete.id);
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone ?? "").includes(searchQuery)
    );

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary dark:text-ink mb-2">إدارة <span className="text-bronze dark:text-secondary">المستخدمين</span></h1>
                    <p className="text-gray-600 dark:text-muted font-medium">عرض وإدارة جميع العملاء المسجلين في المتجر</p>
                </div>
                <div className="relative group w-full md:w-80">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-muted group-focus-within:text-secondary transition-colors" size={20} aria-hidden="true" />
                    <label htmlFor="user-search" className="sr-only">ابحث بالاسم، البريد، أو الهاتف</label>
                    <input
                        id="user-search"
                        name="search"
                        type="text"
                        placeholder="ابحث بالاسم، البريد، أو الهاتف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-card border border-primary/5 dark:border-white/10 py-4 pr-12 pl-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm transition-all text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-card rounded-[40px] shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 overflow-hidden">
                {isError && (
                    <div className="p-6 bg-red-50 dark:bg-red-500/15 text-red-500 font-bold text-sm text-center border-b border-red-100">
                        فشل تحميل قائمة المستخدمين
                    </div>
                )}
                {isLoading ? (
                    <div className="p-8">
                        <TableSkeleton rows={5} cols={6} />
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-200">
                            <Users size={40} />
                        </div>
                        <h2 className="text-xl font-black text-primary dark:text-ink">لا يوجد مستخدمين</h2>
                        <p className="text-gray-600 dark:text-muted">لم يتم العثور على أي نتائج تطابق بحثك</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-primary/5 dark:border-white/10 text-gray-600 dark:text-muted text-xs font-black uppercase tracking-widest">
                                    <th scope="col" className="px-8 py-6">المستخدم</th>
                                    <th scope="col" className="px-8 py-6">نوع الحساب</th>
                                    <th scope="col" className="px-8 py-6">التواصل</th>
                                    <th scope="col" className="px-8 py-6">الطلبات</th>
                                    <th scope="col" className="px-8 py-6">تاريخ الانضمام</th>
                                    <th scope="col" className="px-8 py-6 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5 dark:divide-white/10">
                                {filteredCustomers.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="transition-colors group relative bg-white dark:bg-card"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary dark:text-ink group-hover:bg-primary group-hover:text-white transition-all">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-primary dark:text-ink">{customer.name}</div>
                                                    <div className="text-xs text-gray-600 dark:text-muted font-inter font-bold">ID: #{customer.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase",
                                                customer.isBusiness ? "bg-secondary/10 text-bronze dark:text-secondary" : "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                            )}>
                                                {customer.isBusiness ? <Briefcase size={12} /> : <User size={12} />}
                                                {customer.isBusiness ? `شركة: ${customer.businessName || 'N/A'}` : 'فرد'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-muted">
                                                    <Mail size={12} className="text-gray-500 dark:text-muted" aria-hidden="true" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-muted" dir="ltr">
                                                    <Phone size={12} className="text-gray-500 dark:text-muted" aria-hidden="true" />
                                                    {customer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-primary dark:text-ink">{customer._count?.orders ?? 0} طلب</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-muted">
                                                <Calendar size={12} className="text-gray-500 dark:text-muted" aria-hidden="true" />
                                                {new Date(customer.createdAt).toLocaleDateString('ar-SA')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(customer)}
                                                    className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-muted rounded-lg hover:bg-primary hover:text-white transition-all"
                                                    title="تعديل البيانات"
                                                    aria-label={`تعديل بيانات ${customer.name}`}
                                                >
                                                    <Edit2 size={16} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openDeleteConfirm(customer)}
                                                    className="p-2.5 bg-red-50 dark:bg-red-500/15 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                    title="حذف المستخدم"
                                                    aria-label={`حذف المستخدم ${customer.name}`}
                                                >
                                                    <Trash2 size={16} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
                            onClick={() => setIsEditModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="bg-white dark:bg-card rounded-[40px] w-full max-w-lg relative z-10 shadow-2xl p-10 space-y-8"
                        >
                            <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-primary dark:text-ink">
                                تعديل بيانات <span className="text-secondary">العميل</span>
                            </h2>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} aria-label="إغلاق النافذة" className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-500 dark:text-muted hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all">
                                <X size={20} aria-hidden="true" />
                            </button>
                        </div>

                        {/* Read-only email display */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-primary/5 dark:border-white/10">
                            <Mail size={18} className="text-gray-400 dark:text-muted" />
                            <div>
                                <div className="text-[10px] font-black text-gray-400 dark:text-muted uppercase tracking-widest">البريد الإلكتروني (لا يمكن تعديله)</div>
                                <div className="font-bold text-primary dark:text-ink font-inter">{editingCustomer?.email}</div>
                            </div>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="edit-user-name" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest flex items-center gap-2">
                                    <User size={14} className="text-secondary" />
                                    الاسم الكامل
                                </label>
                                <input 
                                    id="edit-user-name"
                                    name="name"
                                    required
                                    type="text" 
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="edit-user-phone" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest flex items-center gap-2">
                                    <Phone size={14} className="text-secondary" />
                                    رقم الهاتف
                                </label>
                                <input 
                                    id="edit-user-phone"
                                    name="phone"
                                    required
                                    type="tel" 
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-left"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="edit-user-password" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest flex items-center gap-2">
                                    <Lock size={14} className="text-secondary" />
                                    كلمة المرور الجديدة (اتركها فارغة لعدم التغيير)
                                </label>
                                <input 
                                    id="edit-user-password"
                                    name="password"
                                    type="password" 
                                    value={editForm.password}
                                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Business toggle */}
                            <div className="space-y-4 p-5 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-primary/5 dark:border-white/10">
                                <label htmlFor="edit-is-business" className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm font-black text-primary dark:text-ink flex items-center gap-2">
                                        <Briefcase size={14} className="text-secondary" />
                                        حساب شركة / مؤسسة
                                    </span>
                                    <div className="relative">
                                        <input 
                                            id="edit-is-business"
                                            name="isBusiness"
                                            type="checkbox" 
                                            checked={editForm.isBusiness}
                                            onChange={(e) => setEditForm({...editForm, isBusiness: e.target.checked})}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 dark:bg-white/10 peer-checked:bg-secondary rounded-full transition-all peer-focus:ring-4 peer-focus:ring-secondary/20" />
                                        <div className="absolute top-0.5 left-0.5 peer-checked:translate-x-7 w-6 h-6 bg-white dark:bg-card rounded-full shadow-md transition-transform" />
                                    </div>
                                </label>
                                {editForm.isBusiness && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2"
                                    >
                                        <label htmlFor="edit-business-name" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest flex items-center gap-2">
                                            <Building2 size={14} className="text-secondary" />
                                            اسم الشركة
                                        </label>
                                        <input 
                                            id="edit-business-name"
                                            name="businessName"
                                            type="text" 
                                            value={editForm.businessName}
                                            onChange={(e) => setEditForm({...editForm, businessName: e.target.value})}
                                            className="w-full bg-white dark:bg-card border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold"
                                            placeholder="اسم المنشأة"
                                        />
                                    </motion.div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : "حفظ التعديلات"}
                            </button>
                        </form>
                    </motion.div>
                </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary/60 backdrop-blur-md"
                            onClick={() => !deleteMutation.isPending && setIsDeleteModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="bg-white dark:bg-card rounded-[40px] w-full max-w-md relative z-10 shadow-3xl p-10 text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/15 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <Trash2 size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-primary dark:text-ink">تأكيد الحذف</h2>
                            <p className="text-gray-500 dark:text-muted font-medium">
                                هل أنت متأكد من حذف العميل <span className="text-primary dark:text-ink font-bold">«{customerToDelete?.name}»</span>؟ لا يمكن التراجع عن هذا الإجراء.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                disabled={deleteMutation.isPending}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-4 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-muted rounded-2xl font-black hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                            <button
                                disabled={deleteMutation.isPending}
                                onClick={handleDelete}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        جاري الحذف...
                                    </>
                                ) : "تأكيد الحذف"}
                            </button>
                        </div>
                    </motion.div>
                </div>
                )}
            </AnimatePresence>
        </div>
    );
}
