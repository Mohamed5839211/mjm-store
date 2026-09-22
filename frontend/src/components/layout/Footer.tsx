"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Instagram, Twitter, Facebook, MessageCircle, Send, Linkedin, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { LogoMark } from "@/components/layout/logo";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useCmsSettings } from "@/hooks/queries/use-catalog";
import WhatsAppFloatingIcon from "@/components/site/WhatsAppFloatingIcon";

const SOCIAL_ARIA_LABELS: Record<string, string> = {
    instagram: "حسابنا على انستغرام",
    twitter: "حسابنا على تويتر",
    facebook: "حسابنا على فيسبوك",
    snapchat: "حسابنا على سناب شات",
    tiktok: "حسابنا على تيك توك",
    linkedin: "حسابنا على لينكدإن",
    whatsapp: "تواصل معنا عبر واتساب",
};

export default function Footer() {
    const { data: settings } = useCmsSettings();

    const socialLinksData = (settings?.socialLinks ?? {}) as Record<string, string>;

    const availableSocials = [
        { key: 'instagram', icon: Instagram, url: socialLinksData.instagram },
        { key: 'twitter', icon: Twitter, url: socialLinksData.twitter },
        { key: 'facebook', icon: Facebook, url: socialLinksData.facebook },
        { key: 'snapchat', icon: Send, url: socialLinksData.snapchat },
        { key: 'tiktok', icon: PlayCircle, url: socialLinksData.tiktok },
        { key: 'linkedin', icon: Linkedin, url: socialLinksData.linkedin },
        { key: 'whatsapp', icon: MessageCircle, url: socialLinksData.whatsapp },
    ].filter(s => s.url && s.url.trim() !== "");

    return (
        <motion.footer 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="bg-primary text-white pt-20 pb-8 relative overflow-hidden"
        >
            {/* Decorative Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Info */}
                    <motion.div variants={fadeUp}>
                        <Link href="/" className="flex items-center gap-3 mb-6 group inline-flex" aria-label="MJM Store - الرئيسية">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-[#2a3d66] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:rotate-6 transition-all">
                                <LogoMark size={30} />
                            </div>
                            <span className="text-2xl font-black font-inter tracking-tight text-white" dir="ltr">MJM Store</span>
                        </Link>
                        <p className="text-blue-100/60 text-sm leading-loose mb-8 font-medium">
                            رواد في مجال حلول التغليف المتكاملة والطباعة المخصصة للمشاريع الكبيرة والصغيرة. نضمن لك الجودة والاحترافية بأفضل الأسعار المتاحة في السوق.
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                            {availableSocials.map(({ key, icon: Icon, url }) => (
                                <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_ARIA_LABELS[key] ?? key} className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-secondary hover:border-secondary transition-all hover:-translate-y-1 shadow-lg hover:shadow-secondary/20 group">
                                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={fadeUp}>
                        <h2 className="text-xl font-black mb-8 text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-secondary" />
                            روابط سريعة
                        </h2>
                        <ul className="space-y-4 text-sm text-blue-100/60 font-medium">
                            {[
                                { name: "الرئيسية", href: "/" },
                                { name: "جميع المنتجات", href: "/shop" },
                                { name: "العروض والباكجات", href: "/bundles" },
                                { name: "خدمات الطباعة B2B", href: "/custom-printing" },
                                { name: "تتبع طلبك", href: "/profile" },
                                // { name: "المدونة", href: "/blog" }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link href={link.href} className="hover:text-secondary hover:translate-x-[-8px] transition-all inline-block flex items-center gap-2">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Support */}
                    <motion.div variants={fadeUp}>
                        <h2 className="text-xl font-black mb-8 text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            الدعم الفني
                        </h2>
                        <ul className="space-y-4 text-sm text-blue-100/60 font-medium">
                            {[
                                { name: "من نحن", href: "/about" },
                                { name: "سياسة الشحن", href: "/shipping" },
                                { name: "سياسة الاسترجاع", href: "/returns" },
                                { name: "الشروط والأحكام", href: "/terms" },
                                { name: "الأسئلة الشائعة", href: "/faq" },
                                { name: "اتصل بنا", href: "/contact" }
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link href={link.href} className="hover:text-accent hover:translate-x-[-8px] transition-all inline-block">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact */}
                    <motion.div variants={fadeUp}>
                        <h2 className="text-xl font-black mb-8 text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white" />
                            تواصل معنا
                        </h2>
                        <ul className="space-y-6 text-sm text-blue-100/60 font-medium">
                            <li className="flex gap-4 group cursor-default">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-primary transition-colors shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <span>المملكة العربية السعودية، الرياض، المنطقة الصناعية الثانية</span>
                            </li>
                            <li className="flex gap-4 group cursor-default">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-primary transition-colors shrink-0">
                                    <Phone size={20} />
                                </div>
                                <span dir="ltr" className="font-sans tracking-wider">+966 50 000 0000</span>
                            </li>
                            <li className="flex gap-4 group cursor-default">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-primary transition-colors shrink-0">
                                    <Mail size={20} />
                                </div>
                                <span className="font-sans">info@mjm-store.com</span>
                            </li>
                        </ul>
                    </motion.div>
                </motion.div>

                {/* Bottom Bar */}
                <motion.div variants={fadeUp} className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-blue-100/70 font-medium">
                    <p>© 2026 متجر MJM للتغليف والمستلزمات. جميع الحقوق محفوظة.</p>
                    <div className="flex items-center gap-3">
                        {["Mada", "Visa", "MasterCard", "Tamara", "Tabby"].map((card, i) => (
                            <div key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/70 font-bold tracking-wider hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                                {card}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
            {/* Floating contact button lives inside the contentinfo landmark so
                it is contained by a landmark (axe `region` rule). It is
                `position: fixed`, so DOM placement never affects layout. */}
            <WhatsAppFloatingIcon />
        </motion.footer>
    );
}
