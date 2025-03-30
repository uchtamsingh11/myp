'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Badge - A versatile badge component with various styles and animation options
 */
const Badge = ({
        children,
        variant = 'default',
        size = 'md',
        className = '',
        animated = true,
        style = {},
        ...props
}) => {
        // Variant styles
        const variants = {
                default: 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50',
                primary: 'bg-blue-500/20 text-blue-200 border border-blue-500/30',
                secondary: 'bg-purple-500/20 text-purple-200 border border-purple-500/30',
                success: 'bg-green-500/20 text-green-200 border border-green-500/30',
                warning: 'bg-amber-500/20 text-amber-200 border border-amber-500/30',
                danger: 'bg-red-500/20 text-red-200 border border-red-500/30',
                info: 'bg-blue-500/20 text-blue-200 border border-blue-500/30',
                premium: 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30',
                subtle: 'bg-zinc-800/30 text-zinc-400 border border-zinc-800/50',
        };

        // Size styles
        const sizes = {
                sm: 'text-xs px-2 py-0.5 rounded',
                md: 'text-sm px-2.5 py-1 rounded-md',
                lg: 'text-base px-3 py-1.5 rounded-md',
        };

        // Animation variants
        const pulseAnimation = {
                animate: {
                        scale: [1, 1.05, 1],
                        opacity: [0.9, 1, 0.9],
                },
                transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                },
        };

        // Combined classes
        const badgeClasses = `inline-flex items-center font-medium ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`;

        return animated ? (
                <motion.span
                        className={badgeClasses}
                        {...pulseAnimation}
                        style={style}
                        {...props}
                >
                        {children}
                </motion.span>
        ) : (
                <span className={badgeClasses} style={style} {...props}>
                        {children}
                </span>
        );
};

export default Badge; 