"use client";

import { motion } from "framer-motion";
import { Eye, Download } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useAdminOrders } from "@/hooks/queries/use-commerce";
import { updateOrderStatus } from "@/lib/api/commerce";
import { queryKeys } from "@/lib/query/client";
import { ORDER_STATUS_MAP, paymentMethodLabel, statusMeta } from "@/lib/maps";
import { downloadCsv } from "@/lib/export-csv";
import { toNumber } from "@/types/common";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";
import type { OrderStatus } from "@/types/commerce";

export default function AdminOrders() {
    useDocumentTitle('إدارة الطلبات');
    const queryClient = useQueryClient();
    const { data, isLoading: loading } = useAdminOrders();
    const orders = data?.items ?? [];
    const meta = data?.meta ?? { total: 0 };

    const statusMutation = useMutation({
        mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
            updateOrderStatus(orderId, status),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders });
            toast.success("تم تحديث حالة الطلب");
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل تحديث الحالة")),
    });

    const updateStatus = (orderId: number, status: string) => {
        statusMutation.mutate({ orderId, status: status as OrderStatus });
    };

    const exportReport = () => {
        downloadCsv(
            `orders-${new Date().toISOString().split('T')[0]}`,
            [
                { key: 'id', label: 'رقم الطلب' },
                { key: 'customer', label: 'العميل' },
                { key: 'phone', label: 'الجوال' },
                { key: 'total', label: 'الإجمالي' },
                { key: 'payment', label: 'الدفع' },
                { key: 'status', label: 'الحالة' },
                { key: 'date', label: 'التاريخ' },
            ],
            orders.map((order) => ({
                id: order.id,
                customer: order.customer?.name ?? '',
                phone: order.customer?.phone ?? '',
                total: toNumber(order.totalAmount),
                payment: paymentMethodLabel(order.paymentMethod),
                status: statusMeta(ORDER_STATUS_MAP, order.status).label,
                date: new Date(order.createdAt).toLocaleDateString('ar-SA'),
            })),
        );
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-primary dark:text-ink">إدارة <span className="text-bronze dark:text-secondary">الطلبات الحقيقية</span></h1>
                    <p className="text-gray-600 dark:text-muted font-medium">تتبع حالة الشراء الحية من قاعدة بيانات MJM.</p>
                </div>
                <button
                    onClick={exportReport}
                    disabled={orders.length === 0}
                    className="bg-white dark:bg-card border border-primary/5 dark:border-white/10 text-primary dark:text-ink py-4 px-8 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/5 hover:bg-primary hover:text-white transition-all active:scale-95 shrink-0 disabled:opacity-50"
                >
                    <Download size={20} />
                    تصدير التقارير (Excel)
                </button>
            </header>

            {/* Orders Table */}
            <div className="bg-white dark:bg-card rounded-[32px] border border-primary/5 dark:border-white/10 shadow-xl shadow-primary/5 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    {loading ? (
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-primary/5 dark:border-white/10">
                                <tr>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">رقم الطلب</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">العميل</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">التاريخ</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الإجمالي</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الدفع</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الحالة</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={7} className="p-8">
                                        <TableSkeleton rows={5} cols={7} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-white/5 border-b border-primary/5 dark:border-white/10">
                                <tr>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">رقم الطلب</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">العميل</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">التاريخ</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الإجمالي</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الدفع</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">الحالة</th>
                                    <th scope="col" className="p-6 text-sm font-black text-primary dark:text-ink">إجراء</th>
                                </tr>
                            </thead>
                            <motion.tbody 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="divide-y divide-primary/5 dark:divide-white/10"
                            >
                                {orders.length > 0 ? orders.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        variants={fadeUp}
                                        whileHover={{ backgroundColor: "rgba(235, 176, 57, 0.05)", scale: 0.995, zIndex: 10, transition: { duration: 0.2 } }}
                                        className="transition-colors group relative bg-white dark:bg-card"
                                    >
                                        <td className="p-6 rounded-r-2xl">
                                            <span className="font-black text-primary dark:text-ink font-inter">#MJM-{order.id}</span>
                                        </td>
                                        <td className="p-6">
                                            <div className="font-bold text-primary dark:text-ink">{order.customer?.name || 'عميل'}</div>
                                            <div className="text-[10px] text-gray-600 dark:text-muted font-inter">{order.customer?.phone}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xs font-bold text-gray-600 dark:text-muted font-inter">
                                                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="font-black text-bronze dark:text-secondary font-inter">{toNumber(order.totalAmount).toLocaleString()} ر.س</div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-xs font-bold text-gray-600 dark:text-muted">{paymentMethodLabel(order.paymentMethod)}</span>
                                        </td>
                                        <td className="p-6">
                                            <select
                                                aria-label={`تغيير حالة الطلب #MJM-${order.id}`}
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase outline-none border-none cursor-pointer", statusMeta(ORDER_STATUS_MAP, order.status)?.style || 'bg-gray-100')}
                                            >
                                                {Object.entries(ORDER_STATUS_MAP).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-6 text-left rounded-l-2xl">
                                            <button type="button" aria-label={`عرض الطلب #MJM-${order.id}`} className="p-3 bg-gray-50 dark:bg-white/5 text-primary dark:text-ink hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm">
                                                <Eye size={18} aria-hidden="true" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="p-20 text-center text-gray-600 dark:text-muted font-bold">لا توجد طلبات حقيقية حالياً</td>
                                    </tr>
                                )}
                            </motion.tbody>
                        </table>
                    )}
                </div>
                {!loading && (
                        <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-primary/5 dark:border-white/10 flex justify-between items-center text-sm font-bold text-gray-600 dark:text-muted">
                        <span>عرض {orders.length} من أصل {meta.total} طلب</span>
                    </div>
                )}
            </div>
        </div>
    );
}
