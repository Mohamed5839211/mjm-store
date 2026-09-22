"use client";

import PolicyLayout from "@/components/PolicyLayout";
import { Scale, FileText, AlertCircle, ShoppingBag, Lock } from "lucide-react";

export default function TermsAndConditions() {
    return (
        <PolicyLayout title="الشروط والأحكام" lastUpdated="10 مارس 2026">
            <div className="space-y-16">
                <section className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <FileText size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">1. مقدمة واستخدام الموقع</h2>
                    </div>
                    <div className="pr-16">
                        <p>استخدامك لمتجر MJM يعني موافقتك الكاملة على هذه الشروط. نحن نحرص على تقديم تجربة تسوق آمنة وراقية، ونتوقع من عملائنا استخدام المنصة بما يتوافق مع القوانين والأنظمة المعمول بها في المملكة العربية السعودية.</p>
                    </div>
                </section>

                <section className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <ShoppingBag size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">2. الطلبات والأسعار</h2>
                    </div>
                    <div className="pr-16">
                        <p className="italic text-slate-400 dark:text-muted mb-6 font-bold">نحن ملتزمون بالوضوح والنزاهة في كافة تعاملاتنا:</p>
                        <ul className="grid grid-cols-1 gap-2">
                            <li>جميع الأسعار المعروضة تشمل ضريبة القيمة المضافة (VAT) المقررة قانوناً.</li>
                            <li>يحتفظ المتجر بحق تعديل الأسعار في أي وقت قبل إتمام عملية الشراء.</li>
                            <li>يعتبر الطلب مؤكداً فقط بعد استلام رسالة التأكيد الرسمية عبر الواتساب أو الجوال.</li>
                        </ul>
                    </div>
                </section>

                <section className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <Scale size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">3. الملكية الفكرية</h2>
                    </div>
                    <div className="pr-16">
                        <p>جميع المحتويات المتوفرة على الموقع، بما في ذلك النصوص، الجرافيكس، الشعارات، الصور، والبرمجيات هي ملكية خاصة لمؤسسة MJM ومحمية بموجب قوانين الملكية الفكرية السعودية والدولية.</p>
                    </div>
                </section>

                <section className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <Lock size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">4. حماية البيانات والخصوصية</h2>
                    </div>
                    <div className="pr-16">
                        <p>خصوصيتكم هي رأس مالنا. نحن نستخدم أحدث تقنيات التشفير والحلول الأمنية المتقدمة لحماية بياناتكم الشخصية والبنكية. لا يتم مشاركة بياناتكم مع أي طرف ثالث خارج نطاق تنفيذ الطلب.</p>
                    </div>
                </section>

                <section className="group">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 dark:bg-white/5 text-primary dark:text-ink rounded-xl flex items-center justify-center shrink-0 border border-primary/10 dark:border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <AlertCircle size={24} />
                        </div>
                        <h2 className="m-0 text-3xl font-black text-primary dark:text-ink">5. حدود المسؤولية</h2>
                    </div>
                    <div className="pr-16">
                        <p>بينما نسعى جاهدين لضمان دقة معلومات المنتجات وتوافرها، لا يتحمل المتجر مسؤولية الأخطاء المطبعية غير المقصودة أو نفاد المخزون المفاجئ، وسيتم التواصل مع العميل فوراً في حال حدوث ذلك.</p>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    );
}


