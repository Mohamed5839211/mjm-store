"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, User, Phone, Mail, Package,
    CheckCircle2,
    Edit2, Trash2, Save, X, Download, MessageCircle
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { queryKeys } from "@/lib/query/client";
import {
    deletePrintingRequest,
    fetchAdminPrintingRequests,
    updatePrintingRequest,
} from "@/lib/api/commerce";
import { PRINTING_STATUS_MAP, businessTypeLabel, statusMeta } from "@/lib/maps";
import { getMediaUrl } from "@/lib/media";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";
import type { PrintingRequest } from "@/types/commerce";

// We need an Arabic font base64 for jsPDF to render Arabic correctly.
// For the sake of this prompt, we'll implement a basic standard export,
// as embedding a full 1MB+ base64 TTF file is too large for file content.
// A typical solution is fetching the font dynamically or using a smaller font.

export default function AdminRequests() {
    useDocumentTitle('طلبات الطباعة');
    const queryClient = useQueryClient();
    const { data: requestsData, isLoading: loading } = useQuery({
        queryKey: queryKeys.adminRequests,
        queryFn: fetchAdminPrintingRequests,
    });
    const requests = requestsData ?? [];

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<PrintingRequest | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState<PrintingRequest | null>(null);

    const invalidateRequests = () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.adminRequests });
    };

    const statusMutation = useMutation({
        mutationFn: (payload: { id: number; status: string }) =>
            updatePrintingRequest(payload.id, { status: payload.status }),
        onSuccess: () => {
            invalidateRequests();
            toast.success("تم تحديث الحالة");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل تحديث الحالة")),
    });

    const saveMutation = useMutation({
        mutationFn: (payload: { id: number; body: Record<string, unknown> }) =>
            updatePrintingRequest(payload.id, payload.body),
        onSuccess: () => {
            setIsEditModalOpen(false);
            invalidateRequests();
            toast.success("تم تحديث الطلب");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل تحديث الطلب")),
    });

    const deleteMutation = useMutation({
        mutationFn: deletePrintingRequest,
        onSuccess: () => {
            setIsDeleteModalOpen(false);
            setRequestToDelete(null);
            invalidateRequests();
            toast.success("تم حذف الطلب");
        },
        onError: (err) => toast.error(toErrorMessage(err, "حدث خطأ أثناء الحذف")),
    });

    const handleStatusUpdate = (id: number, newStatus: string) => {
        statusMutation.mutate({ id, status: newStatus });
    };

    const openEditModal = (req: PrintingRequest) => {
        setEditingRequest({ ...req });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRequest) return;
        const body: Record<string, unknown> = {
            businessName: editingRequest.businessName,
            businessType: editingRequest.businessType,
            contactPerson: editingRequest.contactPerson,
            phone: editingRequest.phone,
            email: editingRequest.email,
            productType: editingRequest.productType,
            expectedQuantity: Number(editingRequest.expectedQuantity) || 0,
            notes: editingRequest.notes,
            quotedPrice: editingRequest.quotedPrice != null ? Number(editingRequest.quotedPrice) : null,
            internalNotes: editingRequest.internalNotes
        };

        saveMutation.mutate({ id: editingRequest.id, body });
    };

    const openDeleteConfirm = (req: PrintingRequest) => {
        setRequestToDelete(req);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (!requestToDelete) return;
        deleteMutation.mutate(requestToDelete.id);
    };

    const openWhatsApp = (phone: string, name: string, business: string) => {
        // Format phone number to international format (assuming Saudi Arabia 966)
        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith('05')) {
            formattedPhone = '966' + formattedPhone.substring(1);
        }
        
        const message = `مرحباً ${name} (مسؤول مؤسسة ${business})،\nنتواصل معك من متجر MJM بخصوص طلب الطباعة المخصص الخاص بك...`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
    };

    const exportToPDF = async (req: PrintingRequest) => {
        const invoice = document.createElement('div');
        invoice.style.position = 'absolute';
        invoice.style.left = '-9999px';
        invoice.style.top = '0';
        invoice.style.width = '800px';
        invoice.style.padding = '60px';
        invoice.style.backgroundColor = '#ffffff';
        invoice.dir = 'rtl';
        invoice.innerHTML = `
            <div style="font-family: Arial, sans-serif; border: 3px solid #EBB039; padding: 50px; border-radius: 30px; background: #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f0f0f0; padding-bottom: 30px; margin-bottom: 40px;">
                    <div style="text-align: right;">
                        <h1 style="color: #1A1A1A; margin: 0; font-size: 32px; font-weight: 900;">طلب طباعة مخصص</h1>
                        <p style="color: #EBB039; margin: 10px 0 0 0; font-weight: bold; font-size: 18px;">رقم الطلب: #${req.id}</p>
                        <p style="color: #666; margin: 5px 0 0 0;">تاريخ الطلب: ${new Date(req.createdAt).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div style="text-align: left;">
                        <div style="font-size: 40px; font-weight: 900; color: #1A1A1A; letter-spacing: -1px;">MJM<span style="color: #EBB039;">STORE</span></div>
                        <p style="color: #666; margin: 5px 0 0 0; font-weight: bold;">متخصصون في التعبئة والتغليف</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
                    <div style="background: #fdfaf4; padding: 25px; border-radius: 20px; border: 1px solid rgba(235, 176, 57, 0.1);">
                        <h3 style="color: #1A1A1A; margin-top: 0; border-bottom: 2px solid #EBB039; padding-bottom: 15px; display: inline-block;">بيانات العميل</h3>
                        <div style="margin-top: 15px; space-y: 10px;">
                            <p style="margin: 8px 0;"><strong>اسم المنشأة:</strong> ${req.businessName}</p>
                            <p style="margin: 8px 0;"><strong>نوع النشاط:</strong> ${businessTypeLabel(req.businessType)}</p>
                            <p style="margin: 8px 0;"><strong>اسم المسؤول:</strong> ${req.contactPerson}</p>
                            <p style="margin: 8px 0;"><strong>رقم الجوال:</strong> <span dir="ltr">${req.phone}</span></p>
                            <p style="margin: 8px 0;"><strong>البريد:</strong> <span dir="ltr">${req.email}</span></p>
                        </div>
                    </div>
                    <div style="background: #fdfaf4; padding: 25px; border-radius: 20px; border: 1px solid rgba(235, 176, 57, 0.1);">
                        <h3 style="color: #1A1A1A; margin-top: 0; border-bottom: 2px solid #EBB039; padding-bottom: 15px; display: inline-block;">تفاصيل المنتج</h3>
                        <div style="margin-top: 15px; space-y: 10px;">
                            <p style="margin: 8px 0;"><strong>نوع المنتج:</strong> ${req.productType}</p>
                            <p style="margin: 8px 0;"><strong>الكمية المتوقعة:</strong> ${Number(req.expectedQuantity).toLocaleString()}</p>
                            ${req.quotedPrice ? `<p style="margin: 8px 0; color: #EBB039; font-size: 18px;"><strong>السعر المعروض:</strong> ${Number(req.quotedPrice).toLocaleString()} ر.س</p>` : ''}
                            <p style="margin: 8px 0;"><strong>حالة الطلب:</strong> <span style="background: #eee; padding: 2px 8px; border-radius: 5px;">${statusMeta(PRINTING_STATUS_MAP, req.status).label}</span></p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 50px; background: #fafafa; padding: 30px; border-radius: 20px;">
                    <h3 style="color: #1A1A1A; margin-top: 0; margin-bottom: 15px;">الملاحظات والطلبات الخاصة</h3>
                    <p style="color: #444; line-height: 1.8; margin: 0; font-size: 14px;">${req.notes || "لا يوجد ملاحظات إضافية تم تقديمها مع هذا الطلب."}</p>
                </div>

                <div style="border-top: 2px solid #f0f0f0; padding-top: 30px; text-align: center; color: #999; font-size: 12px;">
                    <p style="margin: 0; font-weight: bold;">MJM Store - الرياض، المملكة العربية السعودية</p>
                    <p style="margin: 5px 0 0 0;">هذا المستند معتمد وصادر من النظام الإليكتروني للمتجر</p>
                </div>
            </div>
        `;

        document.body.appendChild(invoice);

        try {
            const canvas = await html2canvas(invoice, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            pdf.save(`MJM_Request_${req.id}_${req.businessName}.pdf`);
            toast.success('تم تصدير الملف بنجاح');
        } catch (error) {
            toast.error(toErrorMessage(error, "حدث خطأ أثناء تصدير الملف"));
        } finally {
            document.body.removeChild(invoice);
        }
    };

    return (
        <div className="space-y-8">
            <header className="space-y-1">
                <h1 className="text-3xl font-black text-primary dark:text-ink">طلبات <span className="text-bronze dark:text-secondary">الطباعة المخصصة</span></h1>
                <p className="text-gray-600 dark:text-muted font-medium">مراجعة طلبات الـ B2B، تقديم عروض الأسعار، والتواصل مع العملاء.</p>
            </header>

            {/* Requests Grid */}
            <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6 min-h-[400px]"
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-primary/10 dark:border-white/10 border-t-primary rounded-full animate-spin" />
                        <p className="text-gray-400 dark:text-muted font-bold">جاري جلب الطلبات...</p>
                    </div>
                ) : requests.length > 0 ? requests.map((request) => (
                    <motion.div
                        key={request.id}
                        variants={fadeUp}
                        className="bg-white dark:bg-card rounded-[40px] p-8 border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 group hover:border-secondary transition-all"
                    >
                        <div className="flex flex-col lg:flex-row justify-between gap-8">
                            {/* Business Info */}
                            <div className="space-y-4 flex-grow">
                                <div className="flex items-center gap-3">
                                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase", statusMeta(PRINTING_STATUS_MAP, request.status).style)}>
                                        {statusMeta(PRINTING_STATUS_MAP, request.status).label}
                                    </span>
                                    <span className="text-xs font-bold text-gray-600 dark:text-muted font-inter">{new Date(request.createdAt).toLocaleDateString('ar-SA')}</span>
                                    <span className="text-xs font-bold text-gray-600 dark:text-muted font-inter">| ID: #{request.id}</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-primary dark:text-ink flex items-center gap-2">
                                        {request.businessName}
                                        {request.businessType && (
                                            <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-muted px-2 py-1 rounded-md">
                                                {businessTypeLabel(request.businessType)}
                                            </span>
                                        )}
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-muted">
                                        <div className="w-8 h-8 bg-gray-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-primary dark:text-ink group-hover:bg-primary/5 transition-all"><User size={16} aria-hidden="true" /></div>
                                        {request.contactPerson}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-muted">
                                        <div className="w-8 h-8 bg-gray-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-primary dark:text-ink group-hover:bg-primary/5 transition-all"><Phone size={16} aria-hidden="true" /></div>
                                        <span dir="ltr">{request.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-muted">
                                        <div className="w-8 h-8 bg-gray-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-primary dark:text-ink group-hover:bg-primary/5 transition-all"><Mail size={16} aria-hidden="true" /></div>
                                        <span dir="ltr">{request.email}</span>
                                    </div>
                                    {request.quotedPrice && (
                                        <div className="flex items-center gap-3 text-sm font-bold text-bronze dark:text-secondary">
                                            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary group-hover:bg-secondary/20 transition-all"><CheckCircle2 size={16} /></div>
                                            عرض السعر: {Number(request.quotedPrice).toLocaleString()} ر.س
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="bg-gray-50/50 dark:bg-white/5 rounded-[32px] p-6 lg:p-8 border border-primary/5 dark:border-white/10 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-6 lg:min-w-[400px]">
                                <div className="space-y-2 flex-grow">
                                    <div className="text-[10px] font-black text-bronze dark:text-secondary tracking-widest uppercase">المنتج المطلوب</div>
                                    <div className="font-black text-primary dark:text-ink flex items-center gap-2">
                                        <Package size={18} className="text-primary/20 dark:text-ink/20" />
                                        {request.productType}
                                    </div>
                                </div>
                                <div className="space-y-2 flex-grow">
                                    <div className="text-[10px] font-black text-bronze dark:text-secondary tracking-widest uppercase">الكمية المتوقعة</div>
                                    <div className="font-black text-primary dark:text-ink font-inter flex items-center gap-2">
                                        {Number(request.expectedQuantity).toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    {request.logoUrl ? (
                                        <a href={getMediaUrl(request.logoUrl) ?? '#'} target="_blank" rel="noreferrer" className="bg-white dark:bg-card p-4 rounded-2xl border border-primary/5 dark:border-white/10 text-primary dark:text-ink hover:bg-primary hover:text-white transition-all shadow-sm flex flex-col items-center gap-2 font-black text-xs w-24">
                                            {/* Preview if image */}
                                            {request.logoUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                                <img src={getMediaUrl(request.logoUrl) ?? ''} alt="" className="w-10 h-10 object-contain" />
                                            ) : (
                                                <FileText size={24} />
                                            )}
                                            عرض الشعار
                                        </a>
                                    ) : (
                                        <div className="bg-gray-100/50 dark:bg-white/10 p-4 rounded-2xl border border-primary/5 dark:border-white/10 text-gray-400 dark:text-muted flex flex-col items-center justify-center gap-2 font-black text-[10px] w-24 h-full text-center">
                                            <FileText size={20} className="opacity-50" />
                                            بدون شعار
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col justify-between gap-3 shrink-0 min-w-[200px]">
                                <select
                                    aria-label={`تغيير حالة طلب ${request.businessName}`}
                                    value={request.status}
                                    onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                                    className={cn("bg-primary text-white py-4 px-6 rounded-2xl font-black text-sm hover:bg-secondary hover:text-primary transition-all shadow-lg shadow-primary/20 active:scale-95 outline-none cursor-pointer text-center w-full")}
                                >
                                    {Object.entries(PRINTING_STATUS_MAP).map(([key, val]) => (
                                        <option key={key} value={key} className="bg-white dark:bg-card text-primary dark:text-ink font-bold">{val.label}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={() => openWhatsApp(request.phone, request.contactPerson, request.businessName)}
                                    className="w-full bg-[#25D366]/10 text-[#25D366] py-3 rounded-xl font-black text-xs hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={16} /> تواصل واتساب
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(request)}
                                        className="flex-1 p-3 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-muted hover:text-primary rounded-xl transition-all shadow-sm flex items-center justify-center group"
                                        title="تعديل تفاصيل الطلب"
                                        aria-label={`تعديل تفاصيل طلب ${request.businessName}`}
                                    >
                                        <Edit2 size={16} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => exportToPDF(request)}
                                        className="flex-1 p-3 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-muted hover:text-blue-500 rounded-xl transition-all shadow-sm flex items-center justify-center group"
                                        title="تصدير PDF"
                                        aria-label={`تصدير طلب ${request.businessName} PDF`}
                                    >
                                        <Download size={16} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openDeleteConfirm(request)}
                                        className="flex-1 p-3 bg-red-50 dark:bg-red-500/15 text-red-500 hover:text-red-600 rounded-xl transition-all shadow-sm flex items-center justify-center group"
                                        title="حذف الطلب"
                                        aria-label={`حذف طلب ${request.businessName}`}
                                    >
                                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="py-20 text-center space-y-4 bg-white dark:bg-card rounded-[40px] border border-primary/5 dark:border-white/10">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-200">
                            <Package size={40} />
                        </div>
                        <h2 className="text-xl font-black text-primary dark:text-ink">لا توجد طلبات طباعة</h2>
                        <p className="text-gray-600 dark:text-muted">لم يتم استلام أي طلبات B2B حتى الآن</p>
                    </div>
                )}
            </motion.div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingRequest && (
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
                            className="bg-white dark:bg-card rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl p-8 space-y-8 custom-scrollbar"
                        >
                            <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-card z-10 pb-4 border-b border-gray-100 dark:border-white/10">
                            <h2 className="text-2xl font-black text-primary dark:text-ink">
                                تعديل الطلب <span className="text-secondary">#{editingRequest.id}</span>
                            </h2>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} aria-label="إغلاق النافذة" className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-500 dark:text-muted hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all">
                                <X size={20} aria-hidden="true" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="req-business" className="text-xs font-black text-gray-600 dark:text-muted uppercase">اسم المنشأة</label>
                                    <input
                                        id="req-business"
                                        type="text" required
                                        value={editingRequest.businessName}
                                        onChange={(e) => setEditingRequest({...editingRequest, businessName: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="req-contact" className="text-xs font-black text-gray-600 dark:text-muted uppercase">اسم المسؤول</label>
                                    <input
                                        id="req-contact"
                                        type="text" required
                                        value={editingRequest.contactPerson}
                                        onChange={(e) => setEditingRequest({...editingRequest, contactPerson: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="req-phone" className="text-xs font-black text-gray-600 dark:text-muted uppercase">رقم الجوال</label>
                                    <input
                                        id="req-phone"
                                        type="text" required dir="ltr"
                                        value={editingRequest.phone}
                                        onChange={(e) => setEditingRequest({...editingRequest, phone: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-left"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="req-email" className="text-xs font-black text-gray-600 dark:text-muted uppercase">البريد الإلكتروني</label>
                                    <input
                                        id="req-email"
                                        type="email" required dir="ltr"
                                        value={editingRequest.email}
                                        onChange={(e) => setEditingRequest({...editingRequest, email: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-left"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="req-product" className="text-xs font-black text-gray-600 dark:text-muted uppercase">المنتج المطلوب</label>
                                    <input
                                        id="req-product"
                                        type="text" required
                                        value={editingRequest.productType}
                                        onChange={(e) => setEditingRequest({...editingRequest, productType: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="req-qty" className="text-xs font-black text-gray-600 dark:text-muted uppercase">الكمية المتوقعة</label>
                                    <input
                                        id="req-qty"
                                        type="number" required
                                        value={editingRequest.expectedQuantity}
                                        onChange={(e) => setEditingRequest({...editingRequest, expectedQuantity: Number(e.target.value)})}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold"
                                    />
                                </div>
                            </div>
                            
                            <hr className="border-gray-100 dark:border-white/10" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="req-price" className="text-xs font-black text-bronze dark:text-secondary uppercase bg-secondary/10 px-2 py-1 rounded inline-block">سعر العرض (SAR)</label>
                                    <input
                                        id="req-price"
                                        type="number" step="0.01"
                                        value={editingRequest.quotedPrice || ''}
                                        onChange={(e) => setEditingRequest({...editingRequest, quotedPrice: e.target.value})}
                                        className="w-full bg-white dark:bg-card border border-secondary/20 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold text-primary dark:text-ink"
                                        placeholder="قيمة عرض السعر المقدم للعميل"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="req-notes" className="text-xs font-black text-gray-600 dark:text-muted uppercase">ملاحظات العميل</label>
                                <textarea
                                    id="req-notes"
                                    rows={3} readOnly
                                    value={editingRequest.notes || 'لا يوجد'}
                                    className="w-full bg-gray-100 dark:bg-white/10 border border-transparent py-3 px-4 rounded-xl font-medium text-gray-600 dark:text-muted resize-none cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="req-internal" className="text-xs font-black text-gray-600 dark:text-muted uppercase flex items-center justify-between">
                                    <span>ملاحظات إدارية داخلية (لا تظهر للعميل)</span>
                                    <span className="text-primary dark:text-ink bg-primary/10 px-2 py-0.5 rounded text-[10px]">خاص</span>
                                </label>
                                <textarea
                                    id="req-internal"
                                    rows={3}
                                    value={editingRequest.internalNotes || ''}
                                    onChange={(e) => setEditingRequest({...editingRequest, internalNotes: e.target.value})}
                                    className="w-full bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold resize-none"
                                    placeholder="ملاحظات للفريق الداخلي..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saveMutation.isPending}
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                {saveMutation.isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} /> حفظ التعديلات
                                    </>
                                )}
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
                                هل أنت متأكد من حذف طلب الطباعة <span className="text-primary dark:text-ink font-bold">«{requestToDelete?.businessName}»</span>؟ لا يمكن التراجع عن هذا الإجراء.
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
