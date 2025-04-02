'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Terminal - A reusable component for creating Magic UI-inspired terminal effects
 * 
 * @param {Object} props
 * @param {string[]} props.lines - Array of text lines to display
 * @param {boolean} props.showCursor - Whether to show the blinking cursor at the end
 * @param {string} props.title - Title for the terminal window
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showHeader - Whether to show the window header
 * @param {number} props.typingSpeed - Typing speed in milliseconds per character
 * @param {number} props.startDelay - Delay before starting the animation in milliseconds
 * @param {Object} props.lineStyles - Custom styles for specific line indices
 * @param {boolean} props.disabled - Disable animations for accessibility
 */
const Terminal = ({
        lines = [],
        showCursor = true,
        title = 'Terminal',
        className = '',
        showHeader = true,
        typingSpeed = 40,
        startDelay = 500,
        lineStyles = {},
        disabled = false,
        ...props
}) => {
        const [visibleLines, setVisibleLines] = useState([]);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [currentCharIndex, setCurrentCharIndex] = useState(0);
        const [isTypingComplete, setIsTypingComplete] = useState(false);
        const [shouldAnimate, setShouldAnimate] = useState(!disabled);

        // Check for reduced motion preference
        useEffect(() => {
                if (typeof window !== 'undefined' && window.matchMedia) {
                        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                        setShouldAnimate(!mediaQuery.matches && !disabled);

                        // If reduced motion is preferred, show all lines immediately
                        if (mediaQuery.matches || disabled) {
                                setVisibleLines([...lines]);
                                setIsTypingComplete(true);
                        }

                        const handleChange = () => {
                                const prefersReducedMotion = mediaQuery.matches;
                                setShouldAnimate(!prefersReducedMotion && !disabled);

                                if (prefersReducedMotion || disabled) {
                                        setVisibleLines([...lines]);
                                        setIsTypingComplete(true);
                                }
                        };

                        mediaQuery.addEventListener('change', handleChange);
                        return () => mediaQuery.removeEventListener('change', handleChange);
                }
        }, [lines, disabled]);

        // Manage typing animation
        useEffect(() => {
                if (!shouldAnimate) {
                        // If animations disabled, show all content immediately
                        if (visibleLines.length !== lines.length) {
                                setVisibleLines([...lines]);
                                setIsTypingComplete(true);
                        }
                        return;
                }

                if (lines.length === 0 || currentIndex >= lines.length) {
                        setIsTypingComplete(true);
                        return;
                }

                // Start typing after initial delay
                const initialTimeout = setTimeout(() => {
                        const typeNextChar = () => {
                                if (currentCharIndex < lines[currentIndex].length) {
                                        setCurrentCharIndex(currentCharIndex + 1);
                                } else {
                                        // Move to next line
                                        setVisibleLines([...visibleLines, lines[currentIndex]]);
                                        setCurrentIndex(currentIndex + 1);
                                        setCurrentCharIndex(0);
                                }
                        };

                        const typingTimeout = setTimeout(typeNextChar, typingSpeed);
                        return () => clearTimeout(typingTimeout);
                }, currentIndex === 0 && currentCharIndex === 0 ? startDelay : 0);

                return () => clearTimeout(initialTimeout);
        }, [currentIndex, currentCharIndex, lines, visibleLines, startDelay, typingSpeed, shouldAnimate]);

        // Get style for a specific line
        const getLineStyle = (index) => {
                return lineStyles[index] || '';
        };

        return (
                <div
                        className={`bg-zinc-950 border border-zinc-800/50 rounded-xl overflow-hidden shadow-2xl ${className}`}
                        {...props}
                >
                        {/* Terminal header */}
                        {showHeader && (
                                <div className="flex items-center px-4 py-2 border-b border-zinc-800 bg-zinc-900">
                                        <div className="flex space-x-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="text-zinc-400 text-xs mx-auto pr-14">{title}</div>
                                </div>
                        )}

                        {/* Terminal content */}
                        <div className="font-mono text-sm p-4 space-y-1 min-h-[100px]">
                                {/* Already typed lines */}
                                {visibleLines.map((line, index) => (
                                        <div key={index} className={getLineStyle(index)}>
                                                {line}
                                        </div>
                                ))}

                                {/* Currently typing line */}
                                {shouldAnimate && currentIndex < lines.length && (
                                        <div className={getLineStyle(currentIndex)}>
                                                {lines[currentIndex].substring(0, currentCharIndex)}
                                                {/* Blinking cursor while typing */}
                                                <motion.span
                                                        animate={{ opacity: [1, 0, 1] }}
                                                        transition={{ duration: 0.8, repeat: Infinity }}
                                                        className="inline-block w-2 h-4 bg-white ml-1"
                                                ></motion.span>
                                        </div>
                                )}

                                {/* Final blinking cursor */}
                                {isTypingComplete && showCursor && (
                                        <motion.span
                                                animate={{ opacity: [1, 0, 1] }}
                                                transition={{ duration: 0.8, repeat: Infinity }}
                                                className="inline-block w-2 h-4 bg-white"
                                        ></motion.span>
                                )}
                        </div>
                </div>
        );
};

export default Terminal; 