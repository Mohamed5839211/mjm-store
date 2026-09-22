"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Package, MapPin, Settings, LogOut, ChevronLeft, Calendar, Shield, Factory, LifeBuoy, ShieldCheck, Send, CreditCard, Plus, Trash2, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { queryKeys } from "@/lib/query/client";
import { changePassword, updateProfile } from "@/lib/api/auth";
import {
    createAddress,
    createSupportTicket,
    deleteAddress,
    fetchAddresses,
    fetchMyOrders,
    fetchMyPrintingRequests,
    fetchMyTickets,
    fetchTicketMessages,
    sendTicketMessage,
    updateAddress,
} from "@/lib/api/commerce";
import type {
    Address,
    AddressPayload,
    Order,
    PrintingRequest,
    SupportTicket,
} from "@/types/commerce";
import { ORDER_STATUS_MAP, PRINTING_STATUS_MAP, paymentMethodLabel, statusMeta } from "@/lib/maps";
import { toNumber } from "@/types/common";
import { toErrorMessage } from "@/hooks/use-error-message";
import { useDocumentTitle } from "@/hooks/use-document-title";
import toast from "react-hot-toast";

type ProfileSection = "orders" | "addresses" | "b2b_requests" | "support" | "settings" | "security";

interface Feedback {
    text: string;
    type: "success" | "error";
}

const EMPTY_FEEDBACK: Feedback = { text: "", type: "success" };

const ADDRESS_FORM_DEFAULT: AddressPayload = {
    city: "",
    district: "",
    street: "",
    buildingNo: "",
    additionalInfo: "",
    isDefault: false,
};

export default function ProfilePage() {
    useDocumentTitle('حسابي');
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, logout, isLoading: authLoading, refreshUser } = useAuth();
    const { formatPrice } = useCart();
    const [activeSection, setActiveSection] = useState<ProfileSection>("orders");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newTicketForm, setNewTicketForm] = useState({ subject: "", priority: "medium", message: "" });
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [message, setMessage] = useState<Feedback>(EMPTY_FEEDBACK);
    const [settingsForm, setSettingsForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "", businessName: user?.businessName ?? "", crNumber: user?.crNumber ?? "" });
    const [securityForm, setSecurityForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressForm, setAddressForm] = useState<AddressPayload>(ADDRESS_FORM_DEFAULT);

    // Sync the editable form when the session account changes (login/logout/
    // refresh). Form state cannot be derived during render because the user
    // edits it. Runs only when the account identity changes.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (user) {
            setSettingsForm({
                name: user.name ?? "",
                phone: user.phone ?? "",
                businessName: user.businessName ?? "",
                crNumber: user.crNumber ?? "",
            });
        }
    }, [user]);
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/auth/login');
        }
    }, [user, authLoading, router]);

    const enabled = !!user;
    const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
        queryKey: queryKeys.orders, queryFn: fetchMyOrders, enabled,
    });
    const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
        queryKey: ['addresses'], queryFn: fetchAddresses, enabled,
    });
    const { data: b2bRequests = [], isLoading: isLoadingB2B } = useQuery({
        queryKey: ['printing-requests'], queryFn: fetchMyPrintingRequests, enabled,
    });
    const { data: tickets = [], isLoading: isLoadingTickets } = useQuery({
        queryKey: ['support-tickets'], queryFn: fetchMyTickets, enabled,
    });
    const { data: ticketMessages = [] } = useQuery({
        queryKey: ['support-tickets', selectedTicket?.id, 'messages'],
        queryFn: () => fetchTicketMessages(selectedTicket?.id as number),
        enabled: selectedTicket != null,
    });

    const invalidate = (...keys: readonly unknown[]) => {
        for (const key of keys) void queryClient.invalidateQueries({ queryKey: key as string[] });
    };

    const createTicketMutation = useMutation({
        mutationFn: createSupportTicket,
        onSuccess: () => {
            toast.success("تم إنشاء التذكرة بنجاح");
            setNewTicketForm({ subject: "", priority: "medium", message: "" });
            setIsCreatingTicket(false);
            invalidate(['support-tickets']);
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل إنشاء التذكرة")),
    });

    const sendMessageMutation = useMutation({
        mutationFn: (content: string) => sendTicketMessage((selectedTicket as SupportTicket).id, content),
        onSuccess: () => {
            setNewMessage("");
            invalidate(['support-tickets', selectedTicket?.id, 'messages']);
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل إرسال الرسالة")),
    });

    const updateSettingsMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            setMessage({ text: "تم تحديث البيانات بنجاح", type: "success" });
            void refreshUser();
        },
        onError: (err) => setMessage({ text: toErrorMessage(err, "فشل تحديث البيانات"), type: "error" }),
    });

    const changePasswordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            setMessage({ text: "تم تغيير كلمة المرور بنجاح", type: "success" });
            setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: (err) => setMessage({ text: toErrorMessage(err, "فشل تغيير كلمة المرور"), type: "error" }),
    });

    const saveAddressMutation = useMutation({
        mutationFn: (payload: { id?: number; data: AddressPayload }) =>
            payload.id != null ? updateAddress(payload.id, payload.data) : createAddress(payload.data),
        onSuccess: () => {
            toast.success("تم حفظ العنوان بنجاح");
            setAddressModalOpen(false);
            setEditingAddress(null);
            setAddressForm(ADDRESS_FORM_DEFAULT);
            invalidate(['addresses']);
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حفظ العنوان")),
    });

    const deleteAddressMutation = useMutation({
        mutationFn: deleteAddress,
        onSuccess: () => {
            toast.success("تم حذف العنوان");
            invalidate(['addresses']);
        },
        onError: (err) => toast.error(toErrorMessage(err, "فشل حذف العنوان")),
    });

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        createTicketMutation.mutate(newTicketForm);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;
        sendMessageMutation.mutate(newMessage.trim());
    };

    const handleUpdateSettings = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(EMPTY_FEEDBACK);
        updateSettingsMutation.mutate({
            name: settingsForm.name,
            phone: settingsForm.phone,
            businessName: settingsForm.businessName || undefined,
            crNumber: settingsForm.crNumber || undefined,
        });
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (securityForm.newPassword !== securityForm.confirmPassword) {
            setMessage({ text: "كلمات المرور غير متطابقة", type: "error" });
            return;
        }
        setMessage(EMPTY_FEEDBACK);
        changePasswordMutation.mutate({
            currentPassword: securityForm.currentPassword,
            newPassword: securityForm.newPassword,
        });
    };

    const openNewAddress = () => {
        setEditingAddress(null);
        setAddressForm(ADDRESS_FORM_DEFAULT);
        setAddressModalOpen(true);
    };

    const openEditAddress = (address: Address) => {
        setEditingAddress(address);
        setAddressForm({
            city: address.city,
            district: address.district,
            street: address.street,
            buildingNo: address.buildingNo,
            additionalInfo: address.additionalInfo ?? "",
            isDefault: address.isDefault,
        });
        setAddressModalOpen(true);
    };

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        saveAddressMutation.mutate({ id: editingAddress?.id, data: addressForm });
    };

    const handleLogout = () => {
        logout('/');
    };

    const isSubmitting =
        createTicketMutation.isPending ||
        sendMessageMutation.isPending ||
        updateSettingsMutation.isPending ||
        changePasswordMutation.isPending ||
        saveAddressMutation.isPending;

    const ORDER_STEPS: Record<string, number> = {
        new_order: 1,
        processing: 2,
        packed: 3,
        shipped: 4,
        delivered: 5,
        cancelled: 0,
    };

    const getStatusInfo = (status: string): { label: string; color: string; step: number } => {
        const meta = statusMeta(ORDER_STATUS_MAP, status);
        return { label: meta.label, color: meta.style, step: ORDER_STEPS[status] ?? 1 };
    };

    const StatusStepper = ({ currentStatus }: { currentStatus: string }) => {
        const { step } = getStatusInfo(currentStatus);
        if (currentStatus === 'cancelled') return null;

        const steps = [
            { id: 1, label: 'الاستلام' },
            { id: 2, label: 'التجهيز' },
            { id: 3, label: 'التغليف' },
            { id: 4, label: 'الشحن' },
            { id: 5, label: 'التوصيل' }
        ];

        return (
            <div className="w-full py-6">
                <div className="relative flex justify-between">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 dark:bg-white/10 -translate-y-1/2 -z-0" />
                    <div 
                        className="absolute top-1/2 right-0 h-1 bg-secondary transition-all duration-700 -translate-y-1/2 -z-0" 
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                    {steps.map((s) => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 border-2",
                                step >= s.id ? "bg-secondary border-secondary text-white shadow-lg" : "bg-white dark:bg-card border-gray-100 dark:border-white/10 text-gray-300 dark:text-muted"
                            )}>
                                {step > s.id ? <Check size={14} /> : s.id}
                            </div>
                            <span className={cn("text-[9px] font-black mt-2", step >= s.id ? "text-primary dark:text-ink" : "text-gray-400 dark:text-muted")}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const menuItems: { id: ProfileSection; name: string; icon: typeof Package }[] = [
        { id: "orders", name: "طلباتي", icon: Package },
        { id: "addresses", name: "عناوين التوصيل", icon: MapPin },
        { id: "b2b_requests", name: "طلبات الطباعة B2B", icon: Factory },
        { id: "support", name: "الدعم الفني", icon: LifeBuoy },
        { id: "settings", name: "إعدادات الحساب", icon: Settings },
        { id: "security", name: "الأمان", icon: Shield },
    ];

    if (authLoading || !user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-muted font-bold">جاري التحقق من الهوية...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
                {/* Sidebar Nav */}
                <aside className="w-full lg:w-80 space-y-8">
                    <div className="bg-white dark:bg-card rounded-[40px] p-8 shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 text-center space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="w-24 h-24 bg-primary/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg relative z-10">
                            <User size={48} className="text-primary dark:text-ink" />
                        </div>
                        <div className="space-y-1 relative z-10">
                            <h2 className="text-xl font-black text-primary dark:text-ink">{user?.name || "المستخدم"}</h2>
                            <p className="text-xs text-gray-500 dark:text-muted font-bold font-inter tracking-wider">{user?.email}</p>
                        </div>
                        <div className="pt-4 border-t border-primary/5 dark:border-white/10 flex justify-center gap-4 relative z-10">
                            <div className="text-center">
                                <div className="text-lg font-black text-primary dark:text-ink">{orders.length}</div>
                                <div className="text-[10px] text-gray-400 dark:text-muted font-bold uppercase">طلب</div>
                            </div>
                            <div className="w-[1px] bg-primary/5 dark:bg-white/5" />
                            <div className="text-center">
                                <div className="text-lg font-black text-primary dark:text-ink">{addresses.length}</div>
                                <div className="text-[10px] text-gray-400 dark:text-muted font-bold uppercase">عنوان</div>
                            </div>
                        </div>
                    </div>

                    <nav className="bg-white dark:bg-card rounded-[40px] p-4 shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-[20px] transition-all group",
                                    activeSection === item.id ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-gray-500 dark:text-muted hover:bg-primary/5 hover:text-primary"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", activeSection === item.id ? "bg-white/10 dark:bg-card/10" : "bg-primary/5 dark:bg-white/5")}>
                                        <item.icon size={20} />
                                    </div>
                                    <span className="font-bold">{item.name}</span>
                                </div>
                                <ChevronLeft size={18} className={cn("transition-transform", activeSection === item.id ? "translate-x-[-4px]" : "group-hover:translate-x-[-4px]")} />
                            </button>
                        ))}
                        <div className="pt-4 mt-4 border-t border-primary/5 dark:border-white/10">
                            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-[20px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-all font-bold">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><LogOut size={20} /></div>
                                تسجيل الخروج
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* Content Area */}
                <div className="flex-grow bg-white dark:bg-card rounded-[50px] shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 p-8 lg:p-16 min-h-[600px]">
                    {activeSection === "orders" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                            <div className="flex justify-between items-center">
                                <h1 className="text-3xl font-black text-primary dark:text-ink">طلباتي <span className="text-secondary">الأخيرة</span></h1>
                                <div className="bg-primary/5 dark:bg-white/5 py-2 px-4 rounded-xl text-xs font-bold text-primary dark:text-ink flex items-center gap-2">
                                    <Calendar size={14} />
                                    آخر 6 أشهر
                                </div>
                            </div>

                            <div className="space-y-6">
                                {isLoadingOrders ? (
                                    <div className="flex flex-col items-center py-20 gap-4">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <p className="text-gray-500 dark:text-muted font-bold">جاري تحميل طلباتك...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-20 space-y-4">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto text-gray-300 dark:text-muted">
                                            <Package size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-primary dark:text-ink">لا توجد طلبات بعد</h3>
                                        <p className="text-gray-500 dark:text-muted font-medium">ابدأ التسوق الآن وسيظهر تاريخ طلباتك هنا.</p>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order.id} className="bg-gray-50/50 dark:bg-white/5 rounded-[32px] p-8 border border-primary/5 dark:border-white/10 group hover:border-secondary transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-xl hover:shadow-primary/5">
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex flex-col flex-grow">
                                                    <div className="flex gap-6">
                                                        <div className="w-20 h-20 bg-white dark:bg-card rounded-2xl flex items-center justify-center text-primary/10 dark:text-ink/10 shadow-sm shrink-0 border border-primary/5 dark:border-white/10">
                                                            <Package size={40} />
                                                        </div>
                                                        <div className="space-y-1 flex-grow">
                                                            <div className="flex justify-between">
                                                                <div className="text-xs font-black text-gray-400 dark:text-muted font-inter">#{order.id}</div>
                                                                <div className="text-xs text-gray-400 dark:text-muted font-bold">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</div>
                                                            </div>
                                                            <h3 className="font-bold text-primary dark:text-ink">طلب رقم {order.id}</h3>
                                                            <div className="flex items-center gap-4 pt-2">
                                                                <span className="text-sm font-black text-secondary">{formatPrice(order.totalAmount)}</span>
                                                                <span className={cn(
                                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                                                                    getStatusInfo(order.status).color
                                                                )}>
                                                                    {getStatusInfo(order.status).label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Visual Tracking Stepper */}
                                                    <StatusStepper currentStatus={order.status} />
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0 lg:self-center">
                                                    <button 
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="bg-white dark:bg-card border border-primary/5 dark:border-white/10 py-3 px-6 rounded-xl text-sm font-bold text-primary dark:text-ink hover:bg-primary hover:text-white transition-all shadow-sm"
                                                    >
                                                        تفاصيل الطلب
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeSection === "addresses" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                            <div className="flex justify-between items-center">
                                <h1 className="text-3xl font-black text-primary dark:text-ink">عناوين <span className="text-secondary">التوصيل</span></h1>
                                <button
                                    onClick={openNewAddress}
                                    className="bg-primary text-white py-3 px-8 rounded-xl font-bold text-sm shadow-lg shadow-primary/10 hover:bg-secondary hover:text-primary transition-all inline-flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    إضافة عنوان جديد
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {isLoadingAddresses ? (
                                    <div className="col-span-full flex flex-col items-center py-20 gap-4">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <p className="text-gray-500 dark:text-muted font-bold">جاري تحميل عناوينك...</p>
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="col-span-full text-center py-20 space-y-4">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto text-gray-300 dark:text-muted">
                                            <MapPin size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-primary dark:text-ink">لا توجد عناوين مسجلة</h3>
                                        <p className="text-gray-500 dark:text-muted font-medium">أضف عنواناً جديداً لتسهيل عملية التوصيل.</p>
                                    </div>
                                ) : (
                                    addresses.map((addr) => (
                                        <div key={addr.id} className="bg-gray-50/50 dark:bg-white/5 p-8 rounded-[32px] border border-primary/5 dark:border-white/10 hover:border-secondary transition-all relative group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-10 h-10 bg-white dark:bg-card rounded-xl flex items-center justify-center text-primary dark:text-ink shadow-sm">
                                                    <MapPin size={22} />
                                                </div>
                                                <h3 className="font-bold text-primary dark:text-ink">{addr.city} - {addr.district}</h3>
                                                {addr.isDefault && <span className="text-[10px] font-black bg-secondary/10 text-bronze dark:text-secondary px-2 py-0.5 rounded-full">افتراضي</span>}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-muted font-medium leading-relaxed mb-6">
                                                {addr.street}، مبنى {addr.buildingNo}
                                                {addr.additionalInfo ? ` — ${addr.additionalInfo}` : ""}
                                            </p>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => openEditAddress(addr)}
                                                    className="text-primary dark:text-ink font-bold text-xs hover:text-secondary inline-flex items-center gap-1"
                                                >
                                                    <Pencil size={14} />
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => deleteAddressMutation.mutate(addr.id)}
                                                    disabled={deleteAddressMutation.isPending}
                                                    className="text-red-500 font-bold text-xs hover:text-red-600 inline-flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    <Trash2 size={14} />
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeSection === "b2b_requests" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                            <h1 className="text-3xl font-black text-primary dark:text-ink">طلبات <span className="text-secondary">التعميد B2B</span></h1>

                            <div className="space-y-6">
                                {isLoadingB2B ? (
                                    <div className="flex flex-col items-center py-20 gap-4">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        <p className="text-gray-500 dark:text-muted font-bold">جاري تحميل طلبات الطباعة...</p>
                                    </div>
                                ) : b2bRequests.length === 0 ? (
                                    <div className="text-center py-20 space-y-4">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto text-gray-300 dark:text-muted">
                                            <Factory size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-primary dark:text-ink">لا توجد طلبات طباعة</h3>
                                        <p className="text-gray-500 dark:text-muted font-medium">لم تقم بإرسال أي طلبات طباعة خاصة حتى الآن.</p>
                                    </div>
                                ) : (
                                    b2bRequests.map((req: PrintingRequest) => {
                                        const reqStatus = statusMeta(PRINTING_STATUS_MAP, req.status);
                                        return (
                                        <div key={req.id} className="bg-gray-50/50 dark:bg-white/5 rounded-[32px] p-8 border border-primary/5 dark:border-white/10 group hover:border-secondary transition-all">
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex gap-6">
                                                    <div className="w-20 h-20 bg-white dark:bg-card rounded-2xl flex items-center justify-center text-primary/10 dark:text-ink/10 shadow-sm shrink-0 border border-primary/5 dark:border-white/10">
                                                        <Factory size={40} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-black text-gray-400 dark:text-muted font-inter">#B2B-{req.id}</div>
                                                        <h3 className="font-bold text-primary dark:text-ink">طلب {req.productType} - {req.expectedQuantity} قطعة</h3>
                                                        <div className="flex items-center gap-4 pt-2">
                                                            <span className={cn(
                                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                                                                reqStatus.style
                                                            )}>
                                                                {reqStatus.label}
                                                            </span>
                                                            <span className="text-xs text-gray-400 dark:text-muted font-bold">{new Date(req.createdAt).toLocaleDateString('ar-SA')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0">
                                                    <button className="bg-white dark:bg-card border border-primary/5 dark:border-white/10 py-3 px-6 rounded-xl text-sm font-bold text-primary dark:text-ink hover:bg-primary hover:text-white transition-all shadow-sm">مشاهدة التفاصيل</button>
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeSection === "settings" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                            <h1 className="text-3xl font-black text-primary dark:text-ink">إعدادات <span className="text-secondary">الحساب</span></h1>
                            
                            {message.text && (
                                <div className={cn("p-4 rounded-xl text-sm font-bold", message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 dark:bg-red-500/15 text-red-600")}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="user-name" className="text-xs font-black text-gray-400 dark:text-muted uppercase">الاسم الكامل</label>
                                        <input 
                                            id="user-name"
                                            name="name"
                                            type="text" 
                                            value={settingsForm.name}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                                            autoComplete="name"
                                            className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="user-phone" className="text-xs font-black text-gray-400 dark:text-muted uppercase">رقم الجوال</label>
                                        <input 
                                            id="user-phone"
                                            name="phone"
                                            type="text" 
                                            value={settingsForm.phone}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                                            autoComplete="tel"
                                            className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all font-inter" 
                                        />
                                    </div>
                                    {user?.isBusiness && (
                                        <>
                                            <div className="space-y-2">
                                                <label htmlFor="business-name" className="text-xs font-black text-gray-400 dark:text-muted uppercase">اسم المنشأة</label>
                                                <input 
                                                    id="business-name"
                                                    name="businessName"
                                                    type="text" 
                                                    value={settingsForm.businessName}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                                                    autoComplete="organization"
                                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="cr-number" className="text-xs font-black text-gray-400 dark:text-muted uppercase">السجل التجاري</label>
                                                <input 
                                                    id="cr-number"
                                                    name="crNumber"
                                                    type="text" 
                                                    value={settingsForm.crNumber}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, crNumber: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all font-inter" 
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button 
                                    disabled={isSubmitting}
                                    type="submit" 
                                    className="bg-primary text-white py-4 px-10 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeSection === "security" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                            <h1 className="text-3xl font-black text-primary dark:text-ink">الأمان <span className="text-secondary">وكلمة المرور</span></h1>

                            {message.text && (
                                <div className={cn("p-4 rounded-xl text-sm font-bold", message.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 dark:bg-red-500/15 text-red-600")}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="current-password" className="text-xs font-black text-gray-400 dark:text-muted uppercase">كلمة المرور الحالية</label>
                                        <input 
                                            id="current-password"
                                            name="currentPassword"
                                            type="password" 
                                            value={securityForm.currentPassword}
                                            onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                                            autoComplete="current-password"
                                            className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="new-password" className="text-xs font-black text-gray-400 dark:text-muted uppercase">كلمة المرور الجديدة</label>
                                        <input 
                                            id="new-password"
                                            name="newPassword"
                                            type="password" 
                                            value={securityForm.newPassword}
                                            onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                                            autoComplete="new-password"
                                            className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="confirm-password" className="text-xs font-black text-gray-400 dark:text-muted uppercase">تأكيد كلمة المرور الجديدة</label>
                                        <input 
                                            id="confirm-password"
                                            name="confirmPassword"
                                            type="password" 
                                            value={securityForm.confirmPassword}
                                            onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                                            autoComplete="new-password"
                                            className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all" 
                                        />
                                    </div>
                                </div>
                                <button 
                                    disabled={isSubmitting}
                                    type="submit" 
                                    className="bg-primary text-white py-4 px-10 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? "جاري التحديث..." : "تحديث كلمة المرور"}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeSection === "support" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <h1 className="text-3xl font-black text-primary dark:text-ink">الدعم <span className="text-secondary">الفني</span></h1>
                                {!isCreatingTicket && !selectedTicket && (
                                    <button 
                                        onClick={() => setIsCreatingTicket(true)}
                                        className="bg-primary text-white py-4 px-8 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all"
                                    >
                                        فتح تذكرة جديدة
                                    </button>
                                )}
                            </div>

                            {isCreatingTicket ? (
                                <div className="bg-white dark:bg-card rounded-[32px] p-8 border border-primary/5 dark:border-white/10 shadow-2xl shadow-primary/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-primary dark:text-ink">تذكرة دعم جديدة</h2>
                                        <button onClick={() => setIsCreatingTicket(false)} className="text-xs font-bold text-gray-400 dark:text-muted hover:text-red-500 transition-all">إلغاء</button>
                                    </div>
                                    <form onSubmit={handleCreateTicket} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="ticket-subject" className="text-xs font-black text-gray-400 dark:text-muted uppercase">موضوع التذكرة</label>
                                                <input 
                                                    id="ticket-subject"
                                                    name="subject"
                                                    type="text" 
                                                    required
                                                    value={newTicketForm.subject}
                                                    onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                                                    placeholder="مثال: مشكلة في الدفع، استفسار عن منتج..."
                                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="ticket-priority" className="text-xs font-black text-gray-400 dark:text-muted uppercase">الأولوية</label>
                                                <select 
                                                    id="ticket-priority"
                                                    name="priority"
                                                    value={newTicketForm.priority}
                                                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all"
                                                >
                                                    <option value="low">منخفضة</option>
                                                    <option value="medium">متوسطة</option>
                                                    <option value="high">عالية</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="ticket-message" className="text-xs font-black text-gray-400 dark:text-muted uppercase">تفاصيل الرسالة</label>
                                            <textarea 
                                                id="ticket-message"
                                                name="message"
                                                required
                                                rows={5}
                                                value={newTicketForm.message}
                                                onChange={(e) => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                                                placeholder="يرجى كتابة تفاصيل المشكلة أو الاستفسار لكي نتمكن من مساعدتك بأفضل شكل..."
                                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                            />
                                        </div>
                                        <button 
                                            disabled={isSubmitting}
                                            type="submit" 
                                            className="bg-primary text-white py-4 px-10 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? "جاري الإرسال..." : "إرسال التذكرة"}
                                        </button>
                                    </form>
                                </div>
                            ) : selectedTicket ? (
                                <div className="space-y-6">
                                    <button 
                                        onClick={() => setSelectedTicket(null)}
                                        className="flex items-center gap-2 text-sm font-black text-bronze dark:text-secondary hover:underline mb-4"
                                    >
                                        &larr; العودة لقائمة التذاكر
                                    </button>
                                    <div className="bg-white dark:bg-card rounded-[32px] overflow-hidden border border-primary/5 dark:border-white/10 shadow-2xl shadow-primary/5 flex flex-col h-[600px]">
                                        <div className="p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                            <div>
                                                <h3 className="text-xl font-black text-primary dark:text-ink">{selectedTicket.subject}</h3>
                                                <p className="text-xs font-bold text-gray-400 dark:text-muted">تذكرة #{selectedTicket.id}</p>
                                            </div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                                                selectedTicket.status === 'open' ? "bg-green-100 text-green-600" : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-muted"
                                            )}>
                                                {selectedTicket.status === 'open' ? 'نشطة' : 'مغلقة'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                            {ticketMessages.map((msg) => (
                                                <div key={msg.id} className={cn(
                                                    "flex flex-col max-w-[80%]",
                                                    msg.senderType === 'customer' ? "mr-auto items-end" : "ml-auto items-start"
                                                )}>
                                                    <div className={cn(
                                                        "p-5 rounded-[24px] text-sm font-bold shadow-sm",
                                                        msg.senderType === 'customer' 
                                                            ? "bg-primary text-white rounded-br-none" 
                                                            : "bg-gray-100 dark:bg-white/10 text-primary dark:text-ink rounded-bl-none border border-gray-200 dark:border-white/10"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 dark:text-muted font-bold mt-2">
                                                        {msg.senderType === 'customer' ? 'أنت' : 'الدعم الفني'} — {new Date(msg.createdAt).toLocaleTimeString('ar-SA')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-6 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10">
                                            <form onSubmit={handleSendMessage} className="flex gap-4">
                                                <input 
                                                    id="chat-message"
                                                    name="chatMessage"
                                                    type="text" 
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="اكتب ردك هنا..."
                                                    className="flex-1 bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                                />
                                                <button 
                                                    disabled={isSubmitting || !newMessage.trim()}
                                                    type="submit"
                                                    className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-secondary hover:text-primary transition-all disabled:opacity-50 shrink-0"
                                                >
                                                    <Send size={24} />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {isLoadingTickets ? (
                                        <div className="flex flex-col items-center py-20 gap-4">
                                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <p className="text-gray-500 dark:text-muted font-bold">جاري تحميل تذاكر الدعم...</p>
                                        </div>
                                    ) : tickets.length === 0 ? (
                                        <div className="text-center py-20 space-y-4 bg-gray-50/50 dark:bg-white/5 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10">
                                            <div className="w-16 h-16 bg-white dark:bg-card rounded-full flex items-center justify-center mx-auto text-gray-300 dark:text-muted shadow-sm">
                                                <ShieldCheck size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-primary dark:text-ink">لا توجد تذاكر حالياً</h3>
                                                <p className="text-gray-500 dark:text-muted font-medium">إذا واجهتك أي مشكلة، لا تتردد في فتح تذكرة دعم جديدة.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        tickets.map((ticket) => (
                                            <div key={ticket.id} className="bg-gray-50/50 dark:bg-white/5 rounded-[32px] p-8 border border-primary/5 dark:border-white/10 group hover:border-secondary transition-all">
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="flex gap-6">
                                                        <div className="w-16 h-16 bg-white dark:bg-card rounded-2xl flex items-center justify-center text-primary dark:text-ink shadow-sm shrink-0 border border-primary/5 dark:border-white/10">
                                                            <ShieldCheck size={32} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-xs font-black text-gray-400 dark:text-muted font-inter uppercase tracking-tight">#{ticket.id} — {ticket.priority}</div>
                                                            <h3 className="font-bold text-primary dark:text-ink text-lg">{ticket.subject}</h3>
                                                            <div className="flex items-center gap-4 pt-2">
                                                                <span className={cn(
                                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                                                                    ticket.status === 'open' ? "bg-green-100 text-green-600" : 
                                                                    ticket.status === 'in_progress' ? "bg-blue-100 text-blue-600" : 
                                                                    "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-muted"
                                                                )}>
                                                                    {ticket.status === 'open' ? 'نشطة' : ticket.status === 'in_progress' ? 'قيد المعالجة' : 'مغلقة'}
                                                                </span>
                                                                <span className="text-xs text-gray-400 dark:text-muted font-bold">{new Date(ticket.createdAt).toLocaleDateString('ar-SA')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 shrink-0">
                                                        <button 
                                                            onClick={() => setSelectedTicket(ticket)}
                                                            className="bg-white dark:bg-card border border-primary/5 dark:border-white/10 py-3 px-6 rounded-xl text-sm font-bold text-primary dark:text-ink hover:bg-primary hover:text-white transition-all shadow-sm"
                                                        >
                                                            دخول المحادثة
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                </div>

                <AnimatePresence>
                    {addressModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setAddressModalOpen(false)}
                                className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white dark:bg-card w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
                            >
                                <form onSubmit={handleSaveAddress} className="p-8 lg:p-12 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-black text-primary dark:text-ink">
                                            {editingAddress ? "تعديل العنوان" : "عنوان جديد"}
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => setAddressModalOpen(false)}
                                            className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all"
                                        >
                                            <ChevronLeft size={20} className="rotate-180" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="addr-city" className="text-xs font-black text-gray-400 dark:text-muted uppercase">المدينة</label>
                                            <input
                                                id="addr-city" required
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="addr-district" className="text-xs font-black text-gray-400 dark:text-muted uppercase">الحي</label>
                                            <input
                                                id="addr-district" required
                                                value={addressForm.district}
                                                onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="addr-street" className="text-xs font-black text-gray-400 dark:text-muted uppercase">الشارع</label>
                                            <input
                                                id="addr-street" required
                                                value={addressForm.street}
                                                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="addr-building" className="text-xs font-black text-gray-400 dark:text-muted uppercase">رقم المبنى</label>
                                            <input
                                                id="addr-building" required
                                                value={addressForm.buildingNo}
                                                onChange={(e) => setAddressForm({ ...addressForm, buildingNo: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label htmlFor="addr-notes" className="text-xs font-black text-gray-400 dark:text-muted uppercase">معلومات إضافية</label>
                                            <input
                                                id="addr-notes"
                                                value={addressForm.additionalInfo ?? ""}
                                                onChange={(e) => setAddressForm({ ...addressForm, additionalInfo: e.target.value })}
                                                placeholder="شقة، دور، علامة مميزة..."
                                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 font-bold text-primary dark:text-ink focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <label className="flex items-center gap-3 md:col-span-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={addressForm.isDefault ?? false}
                                                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                                className="w-5 h-5 accent-primary"
                                            />
                                            <span className="text-sm font-bold text-primary dark:text-ink">تعيين كعنوان افتراضي</span>
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saveAddressMutation.isPending}
                                        className="w-full bg-primary text-white py-4 rounded-2xl font-black hover:bg-secondary hover:text-primary transition-all disabled:opacity-50"
                                    >
                                        {saveAddressMutation.isPending ? "جاري الحفظ..." : "حفظ العنوان"}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedOrder && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedOrder(null)}
                                className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
                            />
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white dark:bg-card w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
                            >
                                <div className="p-8 lg:p-12 space-y-8 overflow-y-auto max-h-[90vh] scrollbar-hide">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black text-primary dark:text-ink">تفاصيل الطلب</h2>
                                            <p className="text-xs font-bold text-gray-400 dark:text-muted">#{selectedOrder.id} — {new Date(selectedOrder.createdAt).toLocaleDateString('ar-SA')}</p>
                                        </div>
                                        <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all">
                                            <ChevronLeft size={20} className="rotate-180" />
                                        </button>
                                    </div>

                                    {/* Items List */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-primary dark:text-ink uppercase">المنتجات</h3>
                                        <div className="space-y-3">
                                            {selectedOrder.items?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-primary/5 dark:border-white/10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white dark:bg-card rounded-lg flex items-center justify-center text-primary/10 dark:text-ink/10 shadow-sm border border-primary/5 dark:border-white/10">
                                                            <Package size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-primary dark:text-ink">{item.product?.name || item.bundle?.name || 'منتج غير معروف'}</p>
                                                            <p className="text-[10px] text-gray-400 dark:text-muted font-bold">الكمية: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-black text-secondary text-sm">{formatPrice(item.finalPrice)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="pt-6 border-t border-primary/5 dark:border-white/10 space-y-3">
                                        <div className="flex justify-between text-sm font-bold text-gray-400 dark:text-muted">
                                            <span>رسوم الشحن</span>
                                            <span className="text-primary dark:text-ink">{formatPrice(selectedOrder.shippingFee)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-gray-400 dark:text-muted">
                                            <span>ضريبة القيمة المضافة (15%)</span>
                                            <span className="text-primary dark:text-ink">{formatPrice(toNumber(selectedOrder.totalAmount) * 0.15 / 1.15)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-lg font-black text-primary dark:text-ink">الإجمالي النهائي</span>
                                            <span className="text-2xl font-black text-secondary">{formatPrice(selectedOrder.totalAmount)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 dark:bg-white/5 p-6 rounded-[24px] border border-primary/5 dark:border-white/10">
                                        <h4 className="text-xs font-black text-primary dark:text-ink uppercase mb-2">طريقة الدفع</h4>
                                        <div className="flex items-center gap-2 text-primary dark:text-ink font-bold">
                                            <CreditCard size={16} className="text-secondary" />
                                            <span>{paymentMethodLabel(selectedOrder.paymentMethod)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Helper icons
const Check = ({ size, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);
