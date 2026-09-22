"use client";

import { motion } from "framer-motion";
import { Shield, Mail, Calendar, Trash2, Edit2, Plus, X, Search, User, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useStaff } from "@/hooks/queries/use-admin";
import { createStaff, deleteStaff, updateStaff } from "@/lib/api/admin";
import { queryKeys } from "@/lib/query/client";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";
import type { AdminStaffUser } from "@/types/auth";

type StaffMember = AdminStaffUser;
type StaffRole = StaffMember["role"];

interface StaffForm {
    name: string;
    email: string;
    password: string;
    role: StaffRole;
}

const EMPTY_STAFF_FORM: StaffForm = {
    name: "",
    email: "",
    password: "",
    role: "staff",
};

export default function AdminStaffPage() {
    useDocumentTitle('فريق العمل');
    const queryClient = useQueryClient();
    const router = useRouter();
    const { adminUser } = useAuth();
    const { data: staffData, isLoading } = useStaff();
    const staff = staffData ?? [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);
    const [formData, setFormData] = useState<StaffForm>(EMPTY_STAFF_FORM);

    useEffect(() => {
        // Only super admins may manage staff (backend enforces this too).
        if (adminUser && adminUser.role !== "super_admin") {
            router.replace("/admin");
        }
    }, [adminUser, router]);

    const invalidateStaff = () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.adminStaff });
    };

    const saveMutation = useMutation({
        mutationFn: (payload: { id?: number; body: Record<string, unknown> }) =>
            payload.id != null ? updateStaff(payload.id, payload.body) : createStaff(payload.body as { name: string; email: string; password: string; role: string }),
        onSuccess: () => {
            setIsModalOpen(false);
            invalidateStaff();
            toast.success("تم حفظ العضو بنجاح");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل معالجة الطلب")),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStaff,
        onSuccess: () => {
            setIsDeleteModalOpen(false);
            setMemberToDelete(null);
            invalidateStaff();
            toast.success("تم حذف العضو");
        },
        onError: (err) => toast.error(toErrorMessage(err, "حدث خطأ أثناء الحذف")),
    });

    const handleOpenModal = (member: StaffMember | null = null) => {
        if (member) {
            setEditingMember(member);
            setFormData({
                name: member.name,
                email: member.email,
                password: "",
                role: member.role
            });
        } else {
            setEditingMember(null);
            setFormData(EMPTY_STAFF_FORM);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const body: Record<string, unknown> = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
        };
        if (formData.password) body.password = formData.password;

        saveMutation.mutate({ id: editingMember?.id, body });
    };

    const handleDelete = () => {
        if (!memberToDelete) return;
        deleteMutation.mutate(memberToDelete.id);
    };

    const openDeleteConfirm = (member: StaffMember) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const filteredStaff = staff.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleName = (role: string) => {
        switch (role) {
            case 'super_admin': return 'مدير عام';
            case 'manager': return 'مدير';
            case 'staff': return 'موظف';
            default: return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super_admin': return 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-400/25';
            case 'manager': return 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-400/25';
            case 'staff': return 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-400/25';
            default: return 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-muted border-gray-200 dark:border-white/10';
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary dark:text-ink mb-2">إدارة <span className="text-bronze dark:text-secondary">فريق العمل</span></h1>
                    <p className="text-gray-600 dark:text-muted font-medium">إضافة وتعديل صلاحيات المشرفين ومدراء المتجر</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative group flex-grow md:w-72">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-muted group-focus-within:text-secondary transition-colors" size={20} aria-hidden="true" />
                        <label htmlFor="staff-search" className="sr-only">بحث عن مشرف</label>
                        <input
                            id="staff-search"
                            name="search"
                            type="text"
                            placeholder="بحث عن مشرف..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-card border border-primary/5 dark:border-white/10 py-4 pr-12 pl-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 shadow-sm transition-all text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted"
                        />
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        <span className="font-bold">إضافة مشرف</span>
                    </button>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-card rounded-[40px] shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/10 dark:border-white/10 border-t-primary rounded-full animate-spin" />
                        <p className="text-gray-400 dark:text-muted font-bold">جاري تحميل فريق العمل...</p>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-200">
                            <Shield size={40} />
                        </div>
                        <h2 className="text-xl font-black text-primary dark:text-ink">لا يوجد نتائج</h2>
                        <p className="text-gray-600 dark:text-muted">لم يتم العثور على مشرفين يطابقون بحثك</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-primary/5 dark:border-white/10 text-gray-600 dark:text-muted text-xs font-black uppercase tracking-widest">
                                    <th scope="col" className="px-8 py-6">المشرف</th>
                                    <th scope="col" className="px-8 py-6">نوع الصلاحية</th>
                                    <th scope="col" className="px-8 py-6">البريد الإلكتروني</th>
                                    <th scope="col" className="px-8 py-6">تاريخ الإضافة</th>
                                    <th scope="col" className="px-8 py-6 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5 dark:divide-white/10">
                                {filteredStaff.map((member) => (
                                    <motion.tr 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={member.id} 
                                        className="hover:bg-gray-50/30 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-primary dark:text-ink group-hover:bg-primary group-hover:text-white transition-all">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-black text-primary dark:text-ink">{member.name}</div>
                                                    <div className="text-xs text-bronze dark:text-secondary font-black">Active Member</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase",
                                                getRoleColor(member.role)
                                            )}>
                                                <ShieldCheck size={12} />
                                                {getRoleName(member.role)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-muted">
                                                <Mail size={14} className="text-gray-500 dark:text-muted" aria-hidden="true" />
                                                {member.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-muted">
                                                <Calendar size={14} className="text-gray-500 dark:text-muted" aria-hidden="true" />
                                                {new Date(member.createdAt).toLocaleDateString('ar-SA')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenModal(member)}
                                                    aria-label={`تعديل المشرف ${member.name}`}
                                                    className="p-2.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-muted rounded-lg hover:bg-primary hover:text-white transition-all"
                                                >
                                                    <Edit2 size={16} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openDeleteConfirm(member)}
                                                    aria-label={`حذف المشرف ${member.name}`}
                                                    className="p-2.5 bg-red-50 dark:bg-red-500/15 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={16} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-card rounded-[40px] w-full max-w-lg relative z-10 shadow-2xl p-10 space-y-8"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-primary dark:text-ink">
                                {editingMember ? "تعديل" : "إضافة"} <span className="text-secondary">مشرف جديد</span>
                            </h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} aria-label="إغلاق النافذة" className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-500 dark:text-muted hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all">
                                <X size={20} aria-hidden="true" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="staff-name" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest">الاسم الكامل</label>
                                <input 
                                    id="staff-name"
                                    name="name"
                                    required
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="staff-email" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest">البريد الإلكتروني</label>
                                <input 
                                    id="staff-email"
                                    name="email"
                                    required
                                    disabled={!!editingMember}
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-inter font-bold lg:text-left shadow-inner disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="staff-password" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest">
                                    كلمة المرور {editingMember && "(اتركها فارغة لعدم التغيير)"}
                                </label>
                                <input 
                                    id="staff-password"
                                    name="password"
                                    required={!editingMember}
                                    type="password" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="staff-role" className="text-sm font-black text-primary dark:text-ink mr-2 uppercase tracking-widest">نوع الصلاحية</label>
                                <select 
                                    id="staff-role"
                                    name="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value as StaffRole})}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold"
                                >
                                    <option value="staff">موظف (Staff)</option>
                                    <option value="manager">مدير (Manager)</option>
                                    <option value="super_admin">مدير عام (Super Admin)</option>
                                </select>
                            </div>
                            <button className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all mt-4">
                                {editingMember ? "تحديث البيانات" : "تأكيد الإضافة"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-primary/60 backdrop-blur-md"
                        onClick={() => !deleteMutation.isPending && setIsDeleteModalOpen(false)}
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-card rounded-[40px] w-full max-w-md relative z-10 shadow-3xl p-10 text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/15 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <Trash2 size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-primary dark:text-ink">تأكيد الحذف</h2>
                            <p className="text-gray-500 dark:text-muted font-medium">
                                هل أنت متأكد من حذف المشرف <span className="text-primary dark:text-ink font-bold">«{memberToDelete?.name}»</span>؟ لا يمكن التراجع عن هذا الإجراء.
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
        </div>
    );
}
