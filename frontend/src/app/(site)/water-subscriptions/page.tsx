"use client";

import { motion } from "framer-motion";
import { Droplets, Calendar, CheckCircle2, ShieldCheck, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useDocumentTitle } from "@/hooks/use-document-title";

type PlanId = "standard" | "premium";

export default function WaterSubscriptionsPage() {
    useDocumentTitle('اشتراكات المياه');
    const [selectedPlan, setSelectedPlan] = useState<PlanId>("standard");
    const { currency } = useCart();

    const plans = [
        {
            id: "standard",
            name: "الباقة المعيارية",
            price: 199,
            period: "شهر",
            features: [
                "كرتون مياه (40 حبة) أسبوعياً",
                "توصيل مجاني في الرياض",
                "إمكانية التأجيل لمرة واحدة",
                "دعم فني عبر الواتساب"
            ]
        },
        {
            id: "premium",
            name: "الباقة العائلية / المكاتب",
            price: 450,
            period: "شهر",
            features: [
                "3 كراتين مياه أسبوعياً",
                "توصيل مجاني لجميع المناطق",
                "مرونة تامة في أوقات التوصيل",
                "أولوية قصوى في الطلبات",
                "خصم 10% على باقي المنتجات"
            ]
        }
    ];

    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-primary pt-20 pb-32 text-white">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl space-y-8 text-right">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 bg-white/10 dark:bg-card/10 px-4 py-2 rounded-full text-sm font-bold"
                        >
                            <Droplets size={16} className="text-secondary" />
                            خدمات اشتراكات المياه من MJM
                        </motion.div>
                        <h1 className="text-4xl lg:text-7xl font-black leading-tight">
                            اشترك مرة واحدة <br />
                            <span className="text-gold">وارتوِ</span> للأبد
                        </h1>
                        <p className="text-lg text-blue-100/80 leading-relaxed">
                            اجعل حياتك أسهل مع خدمة توريد المياه الدورية. نضمن لك وصول مياهك المفضلة لباب بيتك أو مكتبك حسب الجدول المفضل لديك وبأسعار حصرية.
                        </p>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-full -z-0 opacity-10">
                    <Droplets className="absolute top-20 left-20 text-white" size={300} strokeWidth={0.5} />
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 -mt-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "جدولة مرنة", desc: "اختر الأيام والأوقات التي تناسبك.", icon: Calendar },
                        { title: "جودة مضمونة", desc: "مياه نقية من أفضل المصادر المعتمدة.", icon: ShieldCheck },
                        { title: "توفير أكبر", desc: "اشتراكات توفر لك أكثر من الشراء الفردي.", icon: Clock }
                    ].map((f, i) => (
                        <div key={i} className="bg-white dark:bg-card p-10 rounded-[40px] shadow-2xl shadow-primary/5 border border-primary/10 dark:border-white/10 space-y-4 text-center group hover:border-secondary transition-all">
                            <div className="w-16 h-16 bg-primary/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-primary dark:text-ink group-hover:bg-primary group-hover:text-white transition-all">
                                <f.icon size={32} />
                            </div>
                            <h2 className="text-xl font-black text-primary dark:text-ink">{f.title}</h2>
                            <p className="text-gray-500 dark:text-muted text-sm font-medium">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing / Plans */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-right mb-16 space-y-4">
                    <h2 className="text-3xl lg:text-5xl font-black text-primary dark:text-ink">اختر <span className="text-bronze dark:text-secondary">باقتك</span></h2>
                    <p className="text-gray-500 dark:text-muted max-w-2xl mx-auto">خطط مدروسة لتناسب احتياج منزلك أو منشأتك.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            whileHover={{ y: -10 }}
                            onClick={() => setSelectedPlan(plan.id as PlanId)}
                            className={cn(
                                "bg-white dark:bg-card p-12 rounded-[50px] border-4 cursor-pointer transition-all relative overflow-hidden group",
                                selectedPlan === plan.id ? "border-secondary shadow-2xl shadow-secondary/10" : "border-primary/10 dark:border-white/10 hover:border-primary/20"
                            )}
                        >
                            {plan.id === "premium" && (
                                <div className="absolute top-12 left-[-40px] bg-secondary text-primary font-black py-2 px-12 -rotate-45 text-sm uppercase tracking-widest">
                                    الموصى به
                                </div>
                            )}

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-primary dark:text-ink">{plan.name}</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-primary dark:text-ink">{plan.price}</span>
                                        <span className="text-gray-600 dark:text-muted font-bold text-lg">{currency} / {plan.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-4">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className="flex items-center gap-4 text-gray-600 dark:text-muted font-medium">
                                            <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <button className={cn(
                                    "w-full py-5 rounded-[24px] font-black text-lg transition-all shadow-xl",
                                    selectedPlan === plan.id ? "bg-primary text-white shadow-primary/20" : "bg-gray-100 dark:bg-white/10 text-primary dark:text-ink hover:bg-primary hover:text-white"
                                )}>
                                    اشترك الآن
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Delivery Map Info */}
            <section className="container mx-auto px-4 py-20">
                <div className="bg-primary rounded-[50px] p-12 lg:p-20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-8 text-right">
                            <h2 className="text-3xl lg:text-5xl font-black leading-tight">نصل إليك <br /> أينما كنت في <span className="text-secondary">المملكة</span></h2>
                            <p className="text-lg text-blue-100/80 leading-relaxed">
                                نغطي جميع أحياء مدينة الرياض بتوصيل يومي، وباقي مدن المملكة بجدول أسبوعي منتظم لضمان عدم نفاد المياه لديك أبداً.
                            </p>
                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 bg-white/10 dark:bg-card/10 rounded-2xl flex items-center justify-center"><MapPin size={32} /></div>
                                    <span className="font-bold text-sm">تغطية شاملة</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 bg-white/10 dark:bg-card/10 rounded-2xl flex items-center justify-center"><Clock size={32} /></div>
                                    <span className="font-bold text-sm">دقة في المواعيد</span>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 w-full aspect-video bg-white/5 dark:bg-card/5 rounded-[40px] border border-white/10 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <MapPin size={64} className="text-secondary mx-auto" />
                                <div className="font-black text-xl">خارطة التوصيل التفاعلية</div>
                                <div className="text-sm text-blue-100/70">سيتم تفعيل هذا القسم قريباً لتتبع مندوبك</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
