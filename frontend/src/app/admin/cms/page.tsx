"use client";

import { Layout, Save, Image as ImageIcon, Send, Edit3, Trash2, Plus, Bell } from "lucide-react";
import { useState } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function AdminCmsPage() {
    useDocumentTitle('إدارة المحتوى');
    const [sections] = useState([
        { id: "hero", name: "Hero Section", lastUpdate: "منذ ساعتين", status: "نشط" },
        { id: "offers", name: "Promotional Banners", lastUpdate: "يوم أمس", status: "نشط" },
        { id: "announcements", name: "Announcement Bar", lastUpdate: "منذ أسبوع", status: "مسودة" },
    ]);

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-primary dark:text-ink">إدارة المحتوى <span className="text-bronze dark:text-secondary">CMS</span></h1>
                    <p className="text-gray-600 dark:text-muted text-sm font-medium">تحكم في محتوى الصفحة الرئيسية والبنرات الإعلانية.</p>
                </div>
                <button className="bg-primary text-white py-4 px-10 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all active:scale-95 flex items-center gap-2">
                    <Save size={20} />
                    حفظ جميع التغييرات
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sections List */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-card rounded-[40px] p-8 shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 space-y-6">
                        <h2 className="text-xl font-black text-primary dark:text-ink flex items-center gap-3">
                            <Layout size={24} className="text-secondary" aria-hidden="true" />
                            أقسام الصفحة
                        </h2>
                        <div className="space-y-2">
                            {sections.map((s) => (
                                <button key={s.id} className="w-full flex items-center justify-between p-4 rounded-3xl hover:bg-primary/5 text-right group transition-all">
                                    <div className="space-y-1">
                                        <div className="font-bold text-primary dark:text-ink group-hover:text-secondary transition-colors">{s.name}</div>
                                        <div className="text-[10px] text-gray-600 dark:text-muted font-bold uppercase">{s.lastUpdate}</div>
                                    </div>
                                    <Edit3 size={18} className="text-gray-300 dark:text-muted group-hover:text-primary dark:group-hover:text-secondary" />
                                </button>
                            ))}
                        </div>
                        <button className="w-full py-4 border-2 border-dashed border-primary/10 dark:border-white/10 rounded-3xl text-primary dark:text-ink font-bold text-sm hover:border-primary/30 transition-all flex items-center justify-center gap-2">
                            <Plus size={18} />
                            إضافة قسم جديد
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-card rounded-[40px] p-10 lg:p-16 shadow-2xl shadow-primary/5 border border-primary/5 dark:border-white/10 space-y-10">
                        <div className="flex justify-between items-center border-b border-primary/5 dark:border-white/10 pb-8">
                            <h2 className="text-2xl font-black text-primary dark:text-ink">تعديل: <span className="text-bronze dark:text-secondary">Hero Section</span></h2>
                            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">تعديل حي</span>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label htmlFor="content-title-ar" className="block text-sm font-black text-primary dark:text-ink uppercase tracking-widest">العنوان الرئيسي (AR)</label>
                                <textarea
                                    id="content-title-ar"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 p-6 rounded-[24px] outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold text-right text-lg"
                                    defaultValue="حلول التغليف المثالية لمشروعك القادم"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-black text-primary dark:text-ink uppercase tracking-widest">الصورة الخلفية</label>
                                <div className="border-4 border-dashed border-primary/5 dark:border-white/10 rounded-[32px] p-12 text-center space-y-4 group cursor-pointer hover:border-secondary transition-all">
                                    <div className="w-16 h-16 bg-primary/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-primary/20 dark:text-ink/20 group-hover:text-secondary transition-colors">
                                        <ImageIcon size={40} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-black text-primary dark:text-ink">اسحب وافلت الصورة هنا</div>
                                        <div className="text-xs text-gray-600 dark:text-muted font-bold">أقصى حجم: 5MB (WEBP, PNG, JPG)</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label htmlFor="btn-text" className="block text-sm font-black text-primary dark:text-ink uppercase tracking-widest">نص الزر 1</label>
                                    <input id="btn-text" className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold" defaultValue="تسوق الآن" />
                                </div>
                                <div className="space-y-4">
                                    <label htmlFor="btn-link" className="block text-sm font-black text-primary dark:text-ink uppercase tracking-widest">رابط الزر 1</label>
                                    <input id="btn-link" className="w-full bg-gray-50 dark:bg-white/5 border border-primary/5 dark:border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-bold font-inter" defaultValue="/categories" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-primary/5 dark:border-white/10 flex justify-end gap-4">
                            <button className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-muted py-4 px-8 rounded-2xl font-bold hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 transition-all flex items-center gap-2">
                                <Trash2 size={20} />
                                حذف القسم
                            </button>
                            <button className="bg-primary text-white py-4 px-10 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all">
                                <Send size={20} />
                                نشر التعديل
                            </button>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-[32px] p-8 border border-amber-200 dark:border-amber-400/25 flex items-start gap-4">
                        <div className="bg-amber-400 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"><Bell size={24} /></div>
                        <div className="space-y-1">
                            <p className="font-bold text-amber-900 dark:text-amber-200">تنبيه المراجعة</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300/90 font-medium">سيتم تحديث المحتوى لجميع المستخدمين فور الضغط على «نشر التعديل». ننصح بمعاينة التغييرات في نافذة التصفح المتخفي أولاً.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
