"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export const SparkleBackground = () => {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
    
    // Generate random spark positions client-side only
    const [sparks, setSparks] = useState<{ top: string, left: string, size: number, delay: number, duration: number }[]>([]);

    // One-time client-only random layout (no SSR equivalent). Seeded once
    // post-mount; values are stable afterwards.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        const newSparks = Array.from({ length: 40 }).map(() => ({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 5,
            duration: 3 + Math.random() * 2
        }));
        setSparks(newSparks);
    }, []);
    /* eslint-enable react-hooks/set-state-in-effect */

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Parallax Glows */}
            <motion.div style={{ y: y1 }} className="absolute top-[10%] -right-[10%] w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[140px] animate-glow" />
            <motion.div style={{ y: y2 }} className="absolute bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-primary/5 dark:bg-white/5 rounded-full blur-[120px] animate-glow delay-1000" />
            
            {/* Animated Sparkles */}
            <div className="absolute inset-0">
                {sparks.map((spark, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                            opacity: [0, 1, 0], 
                            scale: [0, 1, 0],
                            rotate: [0, 90, 180] 
                        }}
                        transition={{
                            duration: spark.duration,
                            repeat: Infinity,
                            delay: spark.delay,
                            ease: "easeInOut"
                        }}
                        style={{
                            top: spark.top,
                            left: spark.left,
                            width: spark.size,
                            height: spark.size,
                        }}
                        className="absolute bg-secondary/40 rounded-full blur-[1px] shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    />
                ))}
            </div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
    );
};

export const Floating3DBox = ({ className }: { className?: string }) => {
    return (
        <motion.div 
            animate={{ 
                rotateY: [0, 360],
                rotateZ: [0, 15, -15, 0],
                y: [0, -20, 0]
            }}
            transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
            }}
            className={className}
            style={{ transformStyle: "preserve-3d" }}
        >
            <div className="relative w-32 h-32">
                {/* 6 faces of a cube for a 3D effect */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 bg-white/10 dark:bg-card/10 backdrop-blur-sm border border-white/20 shadow-inner"
                        style={{
                            transform: `rotate${i < 2 ? 'X' : (i < 4 ? 'Y' : 'Z')}(${(i % 2) * 180}deg) translateZ(64px)`
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
};
