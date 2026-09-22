"use client";

import PolicyLayout from "@/components/PolicyLayout";
import { Truck, CreditCard, ShieldCheck, MapPin, Clock } from "lucide-react";

export default function ShippingPolicy() {
    return (
        <PolicyLayout title="سياسة الشحن والتوصيل" lastUpdated="10 مارس 2026">
            <div className="space-y-16">
                <section className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <MapPin size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">1. التغطية اللوجستية</h2>
                    </div>
                    <div className="pr-16">
                        <p>نحن في MJM نعتز بتقديم خدماتنا اللوجستية المتكاملة التي تغطي كافة أرجاء <strong>المملكة العربية السعودية</strong>. نركز جهودنا الفنية والتشغيلية لضمان وصول طلباتكم في وقت قياسي وبأعلى معايير السلامة.</p>
                    </div>
                </section>

                <section className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <CreditCard size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">2. رسوم الخدمة</h2>
                    </div>
                    <div className="pr-16">
                        <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[32px] border border-slate-100 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                            <div className="space-y-1">
                                <span className="block font-black text-primary dark:text-ink text-lg">الشحن المجاني</span>
                                <span className="text-slate-400 dark:text-muted text-sm font-bold">متاح رسمياً للطلبات التي تتجاوز قيمتها 299 ر.س</span>
                            </div>
                            <div className="h-px md:h-12 md:w-px bg-slate-200 dark:bg-white/20" />
                            <div className="space-y-1 text-left">
                                <span className="block font-black text-primary dark:text-ink text-lg">25 ريالاً سعودياً</span>
                                <span className="text-slate-400 dark:text-muted text-sm font-bold">الرسوم الثابتة للشحن القياسي لكافة مدن المملكة</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <Clock size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">3. الجداول الزمنية المتوقعة</h2>
                    </div>
                    <div className="pr-16">
                        <p className="mb-8">السرعة هي أحد أركان الجودة في MJM، لذا نلتزم بالمدد التالية:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <li>
                                <span className="block text-primary dark:text-ink font-black mb-1">داخل الرياض</span>
                                <span className="text-slate-500 dark:text-muted">من 24 إلى 48 ساعة عمل كحد أقصى.</span>
                            </li>
                            <li>
                                <span className="block text-primary dark:text-ink font-black mb-1">خارج الرياض</span>
                                <span className="text-slate-500 dark:text-muted">من 2 إلى 5 أيام عمل، حسب المنطقة الجغرافية.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <Truck size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">4. الشحن المتخصص والطلبات الكبيرة</h2>
                    </div>
                    <div className="pr-16">
                        <p>نحن نمتلك أسطولاً خاصاً مجهزاً لنقل طلبيات الجملة والمياه والمنظفات الكبيرة داخل الرياض، مما يضمن لكم تكلفة أقل ومعالجة احترافية للمنتجات الحساسة للكسر أو الرطوبة.</p>
                    </div>
                </section>

                <section className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">5. التتبع والأمان الرقمي</h2>
                    </div>
                    <div className="pr-16">
                        <p>بمجرد تأكيد الطلب، ستصلك رسالة عبر الواتساب تحتوي على رابط تتبع تفاعلي. جميع الشحنات مؤمن عليها بالكامل ضد الضياع أو التلف لضمان حقوق عملائنا الكرام.</p>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    );
}



