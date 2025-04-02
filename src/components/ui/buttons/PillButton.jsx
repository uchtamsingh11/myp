'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * PillButton - A rectangular button similar to the browse buttons in the screenshot
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.dark - Whether to use dark mode style
 * @param {function} props.onClick - Click handler
 * @param {string} props.href - Optional link URL
 * @param {boolean} props.showArrow - Whether to show right arrow
 */
const PillButton = ({
        children,
        className = '',
        dark = false,
        onClick,
        href,
        showArrow = true,
        ...props
}) => {
        const [hover, setHover] = useState(false);

        const buttonStyles = dark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                : 'bg-white hover:bg-zinc-100 text-black';

        const ButtonComponent = ({ children }) => (
                <motion.button
                        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-md font-medium transition-colors overflow-hidden ${buttonStyles} ${className}`}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={onClick}
                        {...props}
                >
                        {/* Rainbow bottom border effect */}
                        <motion.div
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                                initial={{ opacity: 0 }}
                                animate={{
                                        opacity: hover ? 1 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                        />

                        <span>{children}</span>
                        {showArrow && (
                                <motion.div
                                        animate={{ x: hover ? 3 : 0 }}
                                        transition={{ duration: 0.2 }}
                                >
                                        <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                        >
                                                <path
                                                        d="M6 12L10 8L6 4"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                />
                                        </svg>
                                </motion.div>
                        )}
                </motion.button>
        );

        if (href) {
                return (
                        <a href={href} className="no-underline">
                                <ButtonComponent>{children}</ButtonComponent>
                        </a>
                );
        }

        return <ButtonComponent>{children}</ButtonComponent>;
};

export default PillButton; 