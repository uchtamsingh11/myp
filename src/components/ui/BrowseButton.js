'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * BrowseButton - A button styled after the "Browse Components" and "Browse Templates" buttons
 * in the screenshot
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.dark - Whether to use dark styling
 * @param {function} props.onClick - Click handler
 * @param {string} props.href - Optional link URL
 */
const BrowseButton = ({
        children,
        className = '',
        dark = false,
        onClick,
        href,
        ...props
}) => {
        const [hover, setHover] = useState(false);

        const buttonStyles = dark
                ? 'bg-zinc-900 text-white border border-zinc-800'
                : 'bg-white text-black border border-zinc-200';

        const ButtonComponent = ({ children }) => (
                <motion.button
                        className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-md font-medium ${buttonStyles} ${className}`}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={onClick}
                        {...props}
                >
                        <span>{children}</span>

                        <motion.div
                                animate={{ x: hover ? 3 : 0 }}
                                transition={{ duration: 0.2 }}
                        >
                                <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="text-current"
                                >
                                        <path
                                                d="M7.5 15L12.5 10L7.5 5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                        />
                                </svg>
                        </motion.div>

                        {/* Rainbow glow effect */}
                        <motion.div
                                className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-md blur opacity-0 transition duration-300 group-hover:opacity-30"
                                animate={{
                                        opacity: hover ? 0.3 : 0
                                }}
                        />
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

export default BrowseButton; 