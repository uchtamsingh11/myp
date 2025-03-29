'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * IntroducingBadge - A subtle badge component similar to the one in the image
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content of the badge
 * @param {string} props.className - Additional classes for the badge
 * @param {boolean} props.arrow - Whether to show an arrow on the right
 * @param {string} props.href - Optional link URL
 */
const IntroducingBadge = ({
        children,
        className = '',
        arrow = false,
        href,
        ...props
}) => {
        const [hover, setHover] = useState(false);

        const BadgeComponent = ({ children }) => (
                <motion.span
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 bg-purple-900/90 text-xs font-semibold text-white shadow-[0_0_15px_2px_rgba(139,92,246,0.5)] ${className}`}
                        animate={{ y: hover ? -1 : 0 }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        {...props}
                >
                        {children}
                        {arrow && (
                                <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`transition-transform duration-300 ${hover ? 'translate-x-0.5' : ''}`}
                                >
                                        <path
                                                d="M6.5 12.5L10.5 8.5L6.5 4.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                        />
                                </svg>
                        )}
                </motion.span>
        );

        if (href) {
                return (
                        <a href={href} className="no-underline">
                                <BadgeComponent>{children}</BadgeComponent>
                        </a>
                );
        }

        return <BadgeComponent>{children}</BadgeComponent>;
};

export default IntroducingBadge;