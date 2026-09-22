"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloatingIcon() {
    const whatsappNumber = "966505550000"; // Real MJM Number
    const message = "مرحباً متجر MJM، أحتاج إلى مساعدة بخصوص...";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تحدث معنا عبر واتساب"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl shadow-[#25D366]/40 flex items-center justify-center hover:bg-[#128C7E] transition-colors"
        >
            <MessageCircle size={32} aria-hidden="true" />
            <span aria-hidden="true" className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />

            {/* Tooltip */}
            <div aria-hidden="true" className="absolute right-full mr-4 bg-white dark:bg-card text-primary dark:text-ink px-4 py-2 rounded-xl text-xs font-black shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden lg:block border border-primary/5 dark:border-white/10">
                تحدث معنا الآن
            </div>
        </motion.a>
    );
}
