import { Variants } from "framer-motion";

// Configuration for consistent spring physics
export const springConfig = {
    type: "spring" as const,
    damping: 25,
    stiffness: 120,
    mass: 1,
};

// Storefront: Bold & Engaging Iterations
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { ...springConfig }
    },
};

// RTL-Aware Horizontal Slide
export const slideInRTL: Variants = {
    hidden: { opacity: 0, x: 60 }, // Slides from right in RTL
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { ...springConfig }
    },
};

export const slideInLTR: Variants = {
    hidden: { opacity: 0, x: -60 }, // For English/LTR contexts
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { ...springConfig }
    },
};

// Staggered Container for Lists (e.g., Products Grid)
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { ...springConfig }
    }
};

// Admin: Quiet & Efficient Transitions
export const adminFade: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: { 
        opacity: 0,
        transition: { duration: 0.15, ease: "easeIn" }
    }
};

export const adminSlideDown: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.2, ease: "easeOut" }
    },
};

// Shimmer Background Variant
export const shimmerEffect: Variants = {
    hidden: { x: "-100%" },
    visible: {
        x: "100%",
        transition: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 2,
            ease: "linear"
        }
    }
};

// 3D Parallax Helpers for Hero
export const tiltVariant: Variants = {
    hidden: { rotateX: 15, rotateY: 15, opacity: 0, translateZ: -100 },
    visible: { 
        rotateX: 0, 
        rotateY: 0, 
        opacity: 1, 
        translateZ: 0,
        transition: { ...springConfig, damping: 20 }
    }
};
