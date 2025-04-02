'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Tooltip - A floating tooltip component that appears on hover
 */
const Tooltip = ({
        children,
        content,
        position = 'top',
        delay = 300,
        duration = 200,
        disabled = false,
}) => {
        const [isVisible, setIsVisible] = useState(false);
        const [coords, setCoords] = useState({ x: 0, y: 0 });
        const targetRef = useRef(null);
        const tooltipRef = useRef(null);
        const timerRef = useRef(null);

        // Calculate tooltip position relative to target element
        const updatePosition = () => {
                if (!targetRef.current || !tooltipRef.current) return;

                const targetRect = targetRef.current.getBoundingClientRect();
                const tooltipRect = tooltipRef.current.getBoundingClientRect();

                let x = 0;
                let y = 0;

                switch (position) {
                        case 'top':
                                x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                                y = targetRect.top - tooltipRect.height - 8;
                                break;
                        case 'bottom':
                                x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                                y = targetRect.bottom + 8;
                                break;
                        case 'left':
                                x = targetRect.left - tooltipRect.width - 8;
                                y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                                break;
                        case 'right':
                                x = targetRect.right + 8;
                                y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                                break;
                        default:
                                x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                                y = targetRect.top - tooltipRect.height - 8;
                }

                // Adjust if tooltip would go off screen
                if (x < 0) x = 0;
                if (x + tooltipRect.width > window.innerWidth)
                        x = window.innerWidth - tooltipRect.width;
                if (y < 0) y = targetRect.bottom + 8;
                if (y + tooltipRect.height > window.innerHeight)
                        y = targetRect.top - tooltipRect.height - 8;

                setCoords({ x, y });
        };

        // Handle mouse events
        const handleMouseEnter = () => {
                if (disabled) return;
                timerRef.current = setTimeout(() => {
                        setIsVisible(true);
                }, delay);
        };

        const handleMouseLeave = () => {
                clearTimeout(timerRef.current);
                setIsVisible(false);
        };

        // Update position whenever tooltip visibility changes
        useEffect(() => {
                if (isVisible) {
                        updatePosition();
                        // Also update on resize and scroll
                        window.addEventListener('resize', updatePosition);
                        window.addEventListener('scroll', updatePosition);
                }

                return () => {
                        window.removeEventListener('resize', updatePosition);
                        window.removeEventListener('scroll', updatePosition);
                };
        }, [isVisible]);

        // Get arrow classes based on position
        const getArrowClasses = () => {
                switch (position) {
                        case 'top': return 'bottom-[-4px] left-1/2 transform -translate-x-1/2 rotate-45';
                        case 'bottom': return 'top-[-4px] left-1/2 transform -translate-x-1/2 rotate-45';
                        case 'left': return 'right-[-4px] top-1/2 transform -translate-y-1/2 rotate-45';
                        case 'right': return 'left-[-4px] top-1/2 transform -translate-y-1/2 rotate-45';
                        default: return 'bottom-[-4px] left-1/2 transform -translate-x-1/2 rotate-45';
                }
        };

        return (
                <>
                        <div
                                ref={targetRef}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                className="inline-block"
                        >
                                {children}
                        </div>

                        <AnimatePresence>
                                {isVisible && (
                                        <motion.div
                                                ref={tooltipRef}
                                                className="fixed z-50 pointer-events-none"
                                                style={{ left: coords.x, top: coords.y }}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: duration / 1000 }}
                                        >
                                                <div className="bg-zinc-900 text-zinc-200 px-3 py-1.5 rounded-md text-sm shadow-lg border border-zinc-800">
                                                        {content}
                                                        <div className={`absolute w-2 h-2 bg-zinc-900 border-zinc-800 ${getArrowClasses()}`} />
                                                </div>
                                        </motion.div>
                                )}
                        </AnimatePresence>
                </>
        );
};

export default Tooltip; 