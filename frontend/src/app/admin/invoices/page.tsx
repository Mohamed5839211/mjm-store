"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    FileText, Search, Download, Printer, Eye,
    User, CreditCard,
    X, CheckCircle2, AlertCircle,
    DollarSign, Filter, RefreshCw,
    Phone
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useAdminInvoices } from "@/hooks/queries/use-commerce";
import { downloadBlob } from "@/lib/http/client";
import { fetchInvoiceDetail } from "@/lib/api/commerce";
import { paymentMethodLabel } from "@/lib/maps";
import { toNumber } from "@/types/common";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { toast } from 'react-hot-toast';
import type { Invoice } from "@/types/commerce";

// Standard Hex colors for MJM branding to avoid Tailwind 4 oklch issues with html2canvas
const COLORS = {
    primary: "#1b2a4a",
    secondary: "#d4a853",
    background: "#ffffff",
    gray50: "#f9fafb",
    gray100: "#f3f4f6",
    gray400: "#9ca3af",
    gray500: "#6b7280"
};

export default function InvoicesPage() {
    useDocumentTitle('إدارة الفواتير');
    const { data: invoicesData, isLoading, refetch: refetchInvoices } = useAdminInvoices();
    const invoices = invoicesData?.items ?? [];
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const triggerAction = useRef<string | null>(null);

    const detailMutation = useMutation({
        mutationFn: (id: number) => fetchInvoiceDetail(id),
        onSuccess: (data) => {
            setSelectedInvoice(data);
            setIsPreviewOpen(true);
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل جلب تفاصيل الفاتورة")),
    });

    const fetchInvoiceDetailAndOpen = (id: number, action: string | null = null) => {
        if (action) triggerAction.current = action;
        detailMutation.mutate(id);
    };

    const handleDownload = useCallback(async () => {
        if (!selectedInvoice) return;
        setIsDownloading(true);

        try {
            await downloadBlob(
                `/admin/invoices/${selectedInvoice.id}/download-pdf`,
                `invoice-${selectedInvoice.invoiceNumber}.pdf`,
            );

            toast.success('تم تحميل الفاتورة بنجاح');
        } catch (error) {
            toast.error(toErrorMessage(error, 'حدث خطأ أثناء تحميل الفاتورة'));
        } finally {
            setIsDownloading(false);
        }
    }, [selectedInvoice]);

    useEffect(() => {
        if (isPreviewOpen && selectedInvoice && triggerAction.current) {
            const action = triggerAction.current;
            triggerAction.current = null;
            if (action === 'print') {
                setTimeout(() => window.print(), 800);
            } else if (action === 'download') {
                setTimeout(() => { void handleDownload(); }, 800);
            }
        }
    }, [isPreviewOpen, selectedInvoice, handleDownload]);

    const handlePrint = async () => {
        if (!selectedInvoice) return;
        setIsPrinting(true);
        try {
            const blob = await downloadBlob(`/admin/invoices/${selectedInvoice.id}/download-pdf`);

            // Create hidden iframe for printing
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            const url = window.URL.createObjectURL(blob);
            iframe.src = url;
            document.body.appendChild(iframe);

            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow?.print();
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                        window.URL.revokeObjectURL(url);
                    }, 1000);
                }, 500);
            };
        } catch (error) {
            toast.error(toErrorMessage(error, 'حدث خطأ أثناء محاولة الطباعة'));
        } finally {
            setIsPrinting(false);
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.order?.customer?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary dark:text-ink mb-2">إدارة <span className="text-bronze dark:text-secondary">الفواتير الضريبية</span></h1>
                    <p className="text-gray-500 dark:text-muted font-medium">استعرض وتتبع الفواتير الضريبية المبسطة الصادرة لعملائك.</p>
                </div>
                <button
                    type="button"
                    onClick={() => void refetchInvoices()}
                    aria-label="تحديث الفواتير"
                    className="p-4 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-muted rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                    <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} aria-hidden="true" />
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-gradient-to-br from-primary to-primary/90 text-white rounded-[32px] shadow-xl shadow-primary/20 space-y-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div className="text-primary-foreground/60 font-bold text-sm uppercase tracking-wider">إجمالي المبيعات الضريبية</div>
                        <div className="text-3xl font-black font-inter" suppressHydrationWarning>
                            {invoices.reduce((acc, inv) => acc + toNumber(inv.totalAmount), 0).toLocaleString('en-US')} <span className="text-sm text-white/80">ر.س</span>
                        </div>
                    </div>
                </div>
                <div className="p-8 bg-white dark:bg-card border border-primary/5 dark:border-white/10 rounded-[32px] shadow-2xl shadow-primary/5 space-y-4">
                    <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <div className="text-gray-600 dark:text-muted font-bold text-sm uppercase tracking-wider">إجمالي الضريبة (15%)</div>
                        <div className="text-3xl font-black font-inter text-primary dark:text-ink" suppressHydrationWarning>
                            {invoices.reduce((acc, inv) => acc + toNumber(inv.vatAmount), 0).toLocaleString('en-US')} <span className="text-sm text-gray-600 dark:text-muted">ر.س</span>
                        </div>
                    </div>
                </div>
                <div className="p-8 bg-white dark:bg-card border border-primary/5 dark:border-white/10 rounded-[32px] shadow-2xl shadow-primary/5 space-y-4">
                    <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <div className="text-gray-600 dark:text-muted font-bold text-sm uppercase tracking-wider">الفواتير المصدرة</div>
                        <div className="text-3xl font-black font-inter text-primary dark:text-ink" suppressHydrationWarning>{invoices.length}</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-muted group-focus-within:text-primary transition-colors" size={20} aria-hidden="true" />
                    <label htmlFor="invoice-search" className="sr-only">ابحث برقم الفاتورة أو اسم العميل</label>
                    <input
                        id="invoice-search"
                        type="text"
                        placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-card border border-primary/5 dark:border-white/10 py-5 pr-14 pl-6 rounded-[24px] outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-primary dark:text-ink placeholder:text-gray-600 dark:placeholder:text-muted shadow-sm"
                    />
                </div>
                                                <button className="px-8 py-5 bg-white dark:bg-card border border-primary/5 dark:border-white/10 rounded-[24px] text-gray-600 dark:text-muted font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
                    <Filter size={20} />
                    تصفية متقدمة
                </button>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-card rounded-[40px] shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 overflow-hidden">
                {isLoading ? (
                    <div className="p-8"><TableSkeleton rows={5} cols={6} /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5 text-gray-600 dark:text-muted text-[10px] font-black uppercase tracking-widest border-b border-primary/5 dark:border-white/10">
                                    <th scope="col" className="px-8 py-6">رقم الفاتورة</th>
                                    <th scope="col" className="px-8 py-6">العميل</th>
                                    <th scope="col" className="px-8 py-6">التاريخ</th>
                                    <th scope="col" className="px-8 py-6 text-center">المبلغ الإجمالي</th>
                                    <th scope="col" className="px-8 py-6 text-center">الضريبة (15%)</th>
                                    <th scope="col" className="px-8 py-6 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5 dark:divide-white/10">
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-8 py-7">
                                            <div className="font-inter font-black text-primary dark:text-ink" suppressHydrationWarning>{inv.invoiceNumber}</div>
                                            <div className="text-[10px] text-gray-600 dark:text-muted font-bold uppercase" suppressHydrationWarning>ORDER #MJM-{inv.orderId}</div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="font-bold text-primary dark:text-ink">{inv.order?.customer?.name}</div>
                                            <div className="text-xs text-bronze dark:text-secondary font-medium">{inv.order?.customer?.phone}</div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="font-bold text-gray-600 dark:text-muted" suppressHydrationWarning>{new Date(inv.createdAt).toLocaleDateString('en-US')}</div>
                                            <div className="text-[10px] text-gray-600 dark:text-muted font-bold uppercase" suppressHydrationWarning>{new Date(inv.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-8 py-7 text-center">
                                            <div className="font-inter font-black text-primary dark:text-ink" suppressHydrationWarning>{toNumber(inv.totalAmount).toFixed(2)} <span className="text-[10px] text-gray-600 dark:text-muted" suppressHydrationWarning>ر.س</span></div>
                                        </td>
                                        <td className="px-8 py-7 text-center">
                                            <div className="font-inter font-bold text-bronze dark:text-secondary" suppressHydrationWarning>{toNumber(inv.vatAmount).toFixed(2)} <span className="text-[10px] text-gray-600 dark:text-muted" suppressHydrationWarning>ر.س</span></div>
                                        </td>
                                        <td className="px-8 py-7 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => fetchInvoiceDetailAndOpen(inv.id)}
                                                    aria-label={`عرض الفاتورة ${inv.invoiceNumber}`}
                                                    className="p-3 bg-white dark:bg-card text-gray-500 dark:text-muted rounded-xl hover:text-primary hover:bg-primary/10 transition-all border border-primary/5 dark:border-white/10"
                                                >
                                                    <Eye size={18} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => fetchInvoiceDetailAndOpen(inv.id, 'print')}
                                                    aria-label={`طباعة الفاتورة ${inv.invoiceNumber}`}
                                                    className="p-3 bg-white dark:bg-card text-gray-500 dark:text-muted rounded-xl hover:text-secondary hover:bg-secondary/10 transition-all border border-primary/5 dark:border-white/10"
                                                >
                                                    <Printer size={18} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => fetchInvoiceDetailAndOpen(inv.id, 'download')}
                                                    aria-label={`تحميل الفاتورة ${inv.invoiceNumber}`}
                                                    className="p-3 bg-white dark:bg-card text-gray-500 dark:text-muted rounded-xl hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/15 transition-all border border-primary/5 dark:border-white/10"
                                                >
                                                    <Download size={18} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 text-gray-600 dark:text-muted">
                                                <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-[32px]">
                                                    <FileText size={48} />
                                                </div>
                                                <div className="font-black text-xl text-primary dark:text-ink">لا توجد فواتير حالياً</div>
                                                <p className="max-w-xs mx-auto text-sm font-medium">لم يتم العثور على أي فواتير تطابق بحثك أو لم يتم إصدار فواتير بعد.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Invoice Preview Modal */}
            <AnimatePresence>
                {isPreviewOpen && selectedInvoice && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 print:p-0">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute inset-0 bg-primary/40 backdrop-blur-md print:hidden"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-card rounded-[40px] w-full max-w-4xl relative z-10 shadow-3xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-primary/5 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                                        <FileText size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black text-primary dark:text-ink">
                                        معاينة <span className="text-secondary">الفاتورة الضريبية</span>
                                    </h2>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={handlePrint}
                                        disabled={isPrinting}
                                        className={cn(
                                            "py-3 px-6 bg-white dark:bg-card border border-primary/5 dark:border-white/10 text-primary dark:text-ink rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm",
                                            isPrinting ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:text-white"
                                        )}
                                    >
                                        <Printer size={18} className={isPrinting ? "animate-spin" : ""} />
                                        {isPrinting ? "جاري التجهيز..." : "طباعة"}
                                    </button>
                                    <button 
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className={cn(
                                            "py-3 px-6 bg-secondary text-primary rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-secondary/20",
                                            isDownloading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
                                        )}
                                    >
                                        <Download size={18} className={isDownloading ? "animate-bounce" : ""} />
                                        {isDownloading ? "جاري التجهيز..." : "تحميل PDF"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsPreviewOpen(false)}
                                        aria-label="إغلاق المعاينة"
                                        className="w-12 h-12 bg-white dark:bg-card border border-primary/5 dark:border-white/10 text-gray-500 dark:text-muted flex items-center justify-center rounded-xl hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-all shadow-sm"
                                    >
                                        <X size={20} aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body (Printable Area) */}
                            <div className="flex-1 overflow-y-auto p-0 print:overflow-visible" id="printable-invoice-root">
                                <div 
                                    className="p-16 space-y-12 print-container min-h-screen relative overflow-hidden"
                                    id="printable-content"
                                    style={{ backgroundColor: "#ffffff", color: "#1b2a4a" }}
                                >
                                    {/* Decorative Watermark/Pattern */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center overflow-hidden">
                                        <div className="text-[200px] font-black rotate-[-35deg] whitespace-nowrap">MJM STORE MJM STORE MJM STORE</div>
                                    </div>

                                    {/* Invoice Header with Branding */}
                                    <div 
                                        className="flex justify-between items-start pb-12 border-b-2 relative"
                                        style={{ borderColor: "rgba(212, 168, 83, 0.15)" }}
                                    >
                                        <div className="space-y-6 relative z-10">
                                            <div className="text-6xl font-black tracking-tighter" style={{ 
                                                color: COLORS.primary,
                                                backgroundImage: "linear-gradient(135deg, #1b2a4a 0%, #d4a853 100%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent"
                                            }}>
                                                MJM STORE
                                            </div>
                                            <div className="space-y-2 text-sm font-bold" style={{ color: COLORS.gray500 }}>
                                                <p className="border-r-4 pr-4" style={{ borderColor: COLORS.secondary }}>شركة مجم للتجارة والمقاولات</p>
                                                <p className="pr-5">الرقم الضريبي: <span className="font-inter">310555544400003</span></p>
                                                <p className="pr-5">المملكة العربية السعودية، الرياض</p>
                                            </div>
                                        </div>
                                        <div className="text-left space-y-4 relative z-10">
                                            <div 
                                                className="py-6 px-12 rounded-[24px] font-black text-2xl shadow-xl shadow-primary/10"
                                                style={{ 
                                                    background: "linear-gradient(135deg, #1b2a4a 0%, #2a3d66 100%)", 
                                                    color: "#ffffff",
                                                    borderBottom: `4px solid ${COLORS.secondary}`
                                                }}
                                            >
                                                فاتورة ضريبية مبسطة
                                            </div>
                                            <div 
                                                className="space-y-3 text-sm font-bold p-6 rounded-[24px] border-2"
                                                style={{ color: COLORS.primary, backgroundColor: "rgba(249, 250, 251, 0.8)", borderColor: "rgba(212, 168, 83, 0.1)" }}
                                            >
                                                <p className="flex justify-between gap-12"><span style={{ color: COLORS.gray400 }}>رقم الفاتورة:</span> <span className="font-inter" suppressHydrationWarning>{selectedInvoice.invoiceNumber}</span></p>
                                                <p className="flex justify-between gap-12"><span style={{ color: COLORS.gray400 }}>التاريخ:</span> <span suppressHydrationWarning>{new Date(selectedInvoice.createdAt).toLocaleDateString('ar-SA')}</span></p>
                                                <p className="flex justify-between gap-12"><span style={{ color: COLORS.gray400 }}>رقم الطلب:</span> <span className="font-inter" style={{ color: COLORS.secondary }} suppressHydrationWarning>#MJM-{selectedInvoice.orderId}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Client & Shipping Info - Stable Layout */}
                                    <div className="w-full flex gap-8">
                                        <div 
                                            className="flex-1 space-y-4 p-8 rounded-[40px] border relative overflow-hidden"
                                            style={{ backgroundColor: COLORS.gray50, borderColor: "rgba(27, 42, 74, 0.05)", textAlign: 'right' }}
                                        >
                                            <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: COLORS.secondary }} />
                                            <h3 className="text-lg font-black flex items-center gap-3" style={{ color: COLORS.primary }}>
                                                <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(212, 168, 83, 0.1)", color: COLORS.secondary }}>
                                                    <User size={18} />
                                                </div>
                                                العميل المستلم
                                            </h3>
                                            <div className="space-y-2 text-sm font-bold" style={{ color: COLORS.primary }}>
                                                <p className="text-2xl font-black">{selectedInvoice.order?.customer?.name}</p>
                                                <div className="flex items-center gap-2 font-medium h-6" style={{ color: COLORS.gray500 }}>
                                                    <Phone size={14} style={{ color: COLORS.secondary }} />
                                                    <span className="font-inter">{selectedInvoice.order?.customer?.phone}</span>
                                                </div>
                                                <p className="font-medium truncate" style={{ color: COLORS.gray400 }}>{selectedInvoice.order?.customer?.email}</p>
                                            </div>
                                        </div>
                                        <div 
                                            className="flex-1 space-y-4 p-8 text-white rounded-[40px] relative overflow-hidden"
                                            style={{ backgroundColor: COLORS.primary, textAlign: 'right' }}
                                        >
                                            <h3 className="text-lg font-black flex items-center gap-3 relative z-10">
                                                <div className="p-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                                                    <CreditCard size={18} />
                                                </div>
                                                معلومات السداد
                                            </h3>
                                            <div 
                                                className="flex justify-between items-center p-6 rounded-[32px] border"
                                                style={{ 
                                                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                                                    borderColor: "rgba(255, 255, 255, 0.1)"
                                                }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10">
                                                        <CreditCard size={24} style={{ color: COLORS.secondary }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">وسيلة السداد</p>
                                                        <p className="text-sm font-black text-white">{paymentMethodLabel(selectedInvoice.order?.paymentMethod)}</p>
                                                    </div>
                                                </div>
                                                <div className="h-10 w-px bg-white/10" />
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10">
                                                        <CheckCircle2 size={24} style={{ color: COLORS.secondary }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">حالة الدفع</p>
                                                        <p className="text-sm font-black text-white">تـم الســداد</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items - Professional Stable Table */}
                                     <div className="space-y-6">
                                        <div className="flex items-center gap-4 px-4 overflow-hidden">
                                            <div className="h-px w-12" style={{ backgroundColor: "rgba(212, 168, 83, 0.2)" }} />
                                            <h3 className="text-xl font-black shrink-0" style={{ color: COLORS.primary }}>بيان بالمنتجات والخدمات</h3>
                                            <div className="h-px flex-1" style={{ backgroundColor: "rgba(212, 168, 83, 0.2)" }} />
                                        </div>
                                        <div 
                                            className="rounded-[32px] border-2 overflow-hidden shadow-2xl shadow-primary/5"
                                            style={{ borderColor: "rgba(212, 168, 83, 0.1)" }}
                                        >
                                            <table className="w-full text-right border-collapse table-fixed">
                                                <thead>
                                                    <tr className="text-[10px] font-black uppercase tracking-widest" style={{ 
                                                        background: COLORS.primary, // Solid color for capture stability
                                                        color: "#ffffff" 
                                                    }}>
                                                        <th scope="col" className="px-10 py-8 w-[45%] text-right">المنتجات المختارة</th>
                                                        <th scope="col" className="px-4 py-8 text-center w-[15%]">الكمية</th>
                                                        <th scope="col" className="px-4 py-8 text-center w-[20%]">السعر</th>
                                                        <th scope="col" className="px-10 py-8 text-center w-[20%]">الإجمالي</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y bg-white" style={{ borderColor: "rgba(212, 168, 83, 0.05)" }}>
                                                    {selectedInvoice.order?.items.map((item, idx) => (
                                                        <tr key={idx} className="text-sm font-bold transition-colors" style={{ color: COLORS.primary }}>
                                                            <td className="px-10 py-8 text-right">
                                                                <div className="text-base truncate">{item.product?.name || item.bundle?.name}</div>
                                                                <div className="text-[10px] font-medium mt-1 uppercase tracking-tight" style={{ color: COLORS.gray400 }}>Code: {item.product?.id || idx + 100}</div>
                                                            </td>
                                                            <td className="px-10 py-8 text-center font-inter" suppressHydrationWarning>{item.quantity}</td>
                                                            <td className="px-10 py-8 text-center font-inter" suppressHydrationWarning>{toNumber(item.unitPrice).toFixed(2)}</td>
                                                            <td className="px-10 py-8 text-center font-inter" style={{ color: "#d4a853", fontSize: "1.1rem" }} suppressHydrationWarning>{(toNumber(item.unitPrice) * item.quantity).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="text-sm font-black" style={{ color: COLORS.primary, backgroundColor: "rgba(212, 168, 83, 0.03)" }}>
                                                        <td colSpan={3} className="px-10 py-8 text-right">رسوم التجهيز والشحن الضريبية</td>
                                                            <td className="px-10 py-8 text-center font-inter" style={{ color: COLORS.secondary }} suppressHydrationWarning>{toNumber(selectedInvoice.order?.shippingFee).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Final Summary - Stable Horizontal Layout */}
                                    <div className="w-full flex justify-between items-end gap-12 pt-8">
                                        <div 
                                            className="flex items-center gap-8 p-8 rounded-[40px] border"
                                            style={{ backgroundColor: COLORS.gray50, borderColor: "rgba(27, 42, 74, 0.05)", flex: '1' }}
                                        >
                                            <div
                                                className="w-32 h-32 bg-white rounded-3xl p-2 border flex items-center justify-center shrink-0"
                                                style={{ borderColor: "rgba(27, 42, 74, 0.05)" }}
                                            >
                                                <div 
                                                    className="text-[8px] font-bold text-center select-none uppercase leading-tight"
                                                    style={{ color: "rgba(27, 42, 74, 0.3)" }}
                                                >
                                                    <div style={{ color: COLORS.secondary, marginBottom: "4px" }}>E-INVOICE</div>
                                                    QR CODE<br/>MJM STORE<br/>310555544400003
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-[10px] font-bold" style={{ color: COLORS.gray400 }}>
                                                <p>تخضع هذه الفاتورة لأنظمة هيئة الزكاة والضريبة والجمارك بالمملكة العربية السعودية.</p>
                                                <p style={{ color: COLORS.secondary }}>يرجى الاحتفاظ بها لضمان حقوق الضمان والاسترجاع.</p>
                                            </div>
                                        </div>
                                        
                                        <div 
                                            className="w-[400px] space-y-4 p-10 rounded-[48px] text-white relative overflow-hidden"
                                            style={{ backgroundColor: COLORS.primary, flex: 'none', textAlign: 'right' }}
                                        >
                                            <div className="flex justify-between items-center font-bold text-xs uppercase tracking-widest h-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                                                <span>المجموع قبل الضريبة</span>
                                                <span className="font-inter" style={{ direction: 'ltr' }}>{(toNumber(selectedInvoice.totalAmount) - toNumber(selectedInvoice.vatAmount)).toFixed(2)}</span>
                                            </div>
                                            <div 
                                                className="flex justify-between items-center font-black text-[10px] uppercase tracking-widest p-4 rounded-2xl h-12"
                                                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: COLORS.secondary }}
                                            >
                                                <span>ضريبة القيمة المضافة (15%)</span>
                                                <span className="font-inter" style={{ direction: 'ltr' }}>{toNumber(selectedInvoice.vatAmount).toFixed(2)}</span>
                                            </div>
                                            <div className="h-px my-2" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-lg font-black shrink-0 ml-4">الإجمالي النهائي</span>
                                                <div className="flex items-center gap-2" style={{ direction: 'ltr' }}>
                                                    <span className="text-4xl font-black font-inter tracking-tighter">
                                                        {toNumber(selectedInvoice.totalAmount).toFixed(2)}
                                                    </span>
                                                    <span className="text-xs font-bold uppercase" style={{ color: COLORS.secondary }}>SAR</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thank You Note & Footer Decorative */}
                                    <div className="pt-12 border-t text-center space-y-6" style={{ borderColor: "rgba(212, 168, 83, 0.1)" }}>
                                        <div className="flex justify-center items-center gap-6">
                                            <div className="h-px w-24" style={{ background: `linear-gradient(to left, transparent, ${COLORS.secondary})` }} />
                                            <p style={{ color: COLORS.primary }} className="text-lg font-black italic">شكراً لثقتكم في متجرنا</p>
                                            <div className="h-px w-24" style={{ background: `linear-gradient(to right, transparent, ${COLORS.secondary})` }} />
                                        </div>
                                        <p className="text-xs font-bold" style={{ color: COLORS.gray400 }}>نحن فخورون باختيارك لمتجرنا، ثقتك هي مصدر قوتنا وسر نجاحنا.</p>
                                        <div className="flex justify-center gap-2 mt-8">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.secondary, opacity: 0.2 + (i * 0.2) }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @media print {
                    /* Reset everything */
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    html, body {
                        height: 100%;
                        background: white !important;
                    }
                    /* Complete isolation of the printable content */
                    body {
                        visibility: hidden !important;
                        background: white !important;
                    }
                    #printable-invoice-root, #printable-invoice-root * {
                        visibility: visible !important;
                    }
                    #printable-invoice-root {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        display: block !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .print-container {
                        margin: 0 auto !important;
                        padding: 1.5cm !important;
                        min-height: auto !important;
                        box-shadow: none !important;
                        border: none !important;
                        width: 210mm !important; /* Fixed A4 width for print */
                    }
                    /* Ensure no UI elements are printed */
                    .no-print, button, nav, header, aside, footer, .print-hidden, [role="button"] {
                        display: none !important;
                    }
                    /* Fix for Chromium based browsers white page */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
