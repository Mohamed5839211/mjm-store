"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Star, Heart, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface ProductCardProps {
    id: number;
    name: string;
    price: number;
    discountPrice?: number;
    image?: string;
    category?: string;
    isBestSeller?: boolean;
}

export default function ProductCard({ id, name, price, discountPrice, image, category, isBestSeller }: ProductCardProps) {
    const { addToCart, formatPrice } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAdding(true);
        addToCart({
            kind: 'product',
            productId: id,
            name,
            price,
            discountPrice,
            image,
            category,
        });
        setTimeout(() => setIsAdding(false), 2000);
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 20, stiffness: 100 } }
            }}
            whileHover={{ y: -10, scale: 1.02, rotateX: 2, rotateY: -2 }}
            className="bg-white dark:bg-card rounded-[32px] p-5 shadow-xl shadow-primary/5 border border-primary/5 dark:border-white/10 group relative transition-colors duration-500 hover:border-secondary/20 hover:shadow-2xl hover:shadow-secondary/10 transform-gpu"
        >
            {/* Badges */}
            <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                {isBestSeller && (
                    <div className="bg-secondary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-secondary/20 uppercase tracking-tighter">
                        الأكثر مبيعاً
                    </div>
                )}
                {discountPrice && (
                    <div className="bg-accent text-primary text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-accent/20 uppercase tracking-tighter">
                        وفر {Math.round(((price - discountPrice) / price) * 100)}%
                    </div>
                )}
            </div>

            {/* Wishlist Button */}
            <button
                type="button"
                aria-label={`أضف ${name} إلى المفضلة`}
                className="absolute top-6 left-6 z-10 w-10 h-10 bg-white/80 dark:bg-card/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 dark:text-muted hover:text-red-500 transition-colors shadow-sm"
            >
                <Heart size={20} aria-hidden="true" />
            </button>

            {/* Image Wrapper */}
            <Link href={`/products/${id}`} className="block aspect-square rounded-2xl mb-6 overflow-hidden bg-gray-50 dark:bg-white/5 relative group-hover:bg-primary/5 transition-colors duration-500">
                <div className="w-full h-full flex items-center justify-center text-primary/10 dark:text-ink/10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3">
                    {image ? (
                        <Image src={image} alt={name} width={300} height={300} className="w-full h-full object-contain p-4" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" priority={false} />
                    ) : (
                        <Package size={80} strokeWidth={0.5} />
                    )}
                </div>
            </Link>

            {/* Info */}
            <div className="space-y-3">
                <div className="text-[10px] font-bold text-bronze dark:text-secondary uppercase tracking-widest">{category || "منتج MJM"}</div>
                <Link href={`/products/${id}`}>
                    <h3 className="font-bold text-primary dark:text-ink hover:text-secondary transition-colors line-clamp-2 min-h-[3rem] leading-snug">
                        {name}
                    </h3>
                </Link>

                <div className="flex items-center gap-1 text-amber-400">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <span className="text-[10px] text-gray-600 dark:text-muted mr-1 font-bold">(4.9)</span>
                </div>

                <div className="flex justify-between items-end pt-2 border-t border-primary/5 dark:border-white/10">
                    <div className="flex flex-col">
                        {discountPrice && (
                            <span className="text-xs text-gray-600 dark:text-muted line-through font-medium">{formatPrice(price)}</span>
                        )}
                        <span className="text-xl font-black text-primary dark:text-ink">{formatPrice(discountPrice || price)}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        aria-label={`أضف ${name} إلى السلة`}
                        className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90",
                            isAdding ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-secondary hover:text-primary shadow-primary/20"
                        )}
                    >
                        {isAdding ? <ShoppingCart size={22} aria-hidden="true" /> : <ShoppingBag size={22} aria-hidden="true" />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
