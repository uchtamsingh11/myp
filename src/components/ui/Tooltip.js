'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Tooltip - A styled tooltip component with Magic UI styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The element that triggers the tooltip
 * @param {React.ReactNode} props.content - The content of the tooltip
 * @param {string} props.position - The position of the tooltip (top, right, bottom, left)
 * @param {string} props.className - Additional classes for the tooltip
 * @param {boolean} props.showArrow - Whether to show the tooltip arrow
 * @param {boolean} props.disabled - Whether to disable the tooltip
 */
const Tooltip = ({
        children,
        content,
        position = 'top',
        className = '',
        showArrow = true,
        disabled = false,
}) => {
        const [isVisible, setIsVisible] = useState(false);
        const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
        const triggerRef = useRef(null);
        const tooltipRef = useRef(null);

        // Position variants for different tooltip placements
        const positionVariants = {
                top: {
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 },
                },
                right: {
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 },
                },
                bottom: {
                        hidden: { opacity: 0, y: -10 },
                        visible: { opacity: 1, y: 0 },
                },
                left: {
                        hidden: { opacity: 0, x: 10 },
                        visible: { opacity: 1, x: 0 },
                },
        };

        // Calculate position based on trigger element
        const calculatePosition = () => {
                if (!triggerRef.current || !tooltipRef.current) return;

                const triggerRect = triggerRef.current.getBoundingClientRect();
                const tooltipRect = tooltipRef.current.getBoundingClientRect();

                let x = 0;
                let y = 0;

                switch (position) {
                        case 'top':
                                x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                                y = triggerRect.top - tooltipRect.height - 8;
                                break;
                        case 'right':
                                x = triggerRect.right + 8;
                                y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                                break;
                        case 'bottom':
                                x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
                                y = triggerRect.bottom + 8;
                                break;
                        case 'left':
                                x = triggerRect.left - tooltipRect.width - 8;
                                y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
                                break;
                        default:
                                break;
                }

                // Boundary checks to keep tooltip in viewport
                if (x < 10) x = 10;
                if (y < 10) y = 10;
                if (x + tooltipRect.width > window.innerWidth - 10) {
                        x = window.innerWidth - tooltipRect.width - 10;
                }
                if (y + tooltipRect.height > window.innerHeight - 10) {
                        y = window.innerHeight - tooltipRect.height - 10;
                }

                setTooltipPosition({ x, y });
        };

        // Handle mouse events
        const handleMouseEnter = () => {
                if (disabled) return;
                setIsVisible(true);
        };

        const handleMouseLeave = () => {
                setIsVisible(false);
        };

        // Calculate position once tooltip is visible
        useEffect(() => {
                if (isVisible) {
                        calculatePosition();

                        // Recalculate on window resize
                        window.addEventListener('resize', calculatePosition);
                        window.addEventListener('scroll', calculatePosition);

                        return () => {
                                window.removeEventListener('resize', calculatePosition);
                                window.removeEventListener('scroll', calculatePosition);
                        };
                }
        }, [isVisible]);

        // Get arrow position class based on tooltip position
        const getArrowClass = () => {
                switch (position) {
                        case 'top': return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[98%] border-t-zinc-800 border-l-transparent border-r-transparent border-b-transparent';
                        case 'right': return 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-[98%] rotate-90 border-t-zinc-800 border-l-transparent border-r-transparent border-b-transparent';
                        case 'bottom': return 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-[98%] rotate-180 border-t-zinc-800 border-l-transparent border-r-transparent border-b-transparent';
                        case 'left': return 'right-0 top-1/2 transform -translate-y-1/2 translate-x-[98%] -rotate-90 border-t-zinc-800 border-l-transparent border-r-transparent border-b-transparent';
                        default: return '';
                }
        };

        return (
                <div className="relative inline-block">
                        <div
                                ref={triggerRef}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onFocus={handleMouseEnter}
                                onBlur={handleMouseLeave}
                                className="inline-block"
                        >
                                {children}
                        </div>

                        <AnimatePresence>
                                {isVisible && (
                                        <motion.div
                                                ref={tooltipRef}
                                                className="fixed z-50 max-w-xs"
                                                style={{
                                                        left: tooltipPosition.x,
                                                        top: tooltipPosition.y,
                                                        pointerEvents: 'none'
                                                }}
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                variants={positionVariants[position]}
                                                transition={{ duration: 0.2 }}
                                        >
                                                <div
                                                        className={`relative bg-zinc-800 text-white text-sm px-4 py-2 rounded-lg 
              shadow-lg border border-zinc-700/50 backdrop-blur-sm ${className}`}
                                                >
                                                        {/* Gradient glow effect */}
                                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-purple-500/10 to-violet-500/5 blur-sm -z-10" />

                                                        {/* Content */}
                                                        <div className="relative z-10">{content}</div>

                                                        {/* Arrow */}
                                                        {showArrow && (
                                                                <div
                                                                        className={`absolute w-0 h-0 border-solid border-[6px] ${getArrowClass()}`}
                                                                />
                                                        )}
                                                </div>
                                        </motion.div>
                                )}
                        </AnimatePresence>
                </div>
        );
};

export default Tooltip; 