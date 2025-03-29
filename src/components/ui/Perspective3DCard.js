'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * Perspective3DCard - A card with 3D perspective effects on hover
 * Similar to Magic UI's 3D cards with depth and motion
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.depth - Perspective depth (1-20)
 * @param {number} props.rotateIntensity - Rotation intensity (1-20)
 * @param {string} props.shadowColor - Shadow color in rgba format
 * @param {boolean} props.disabled - Disable animations for accessibility
 */
const Perspective3DCard = ({
        children,
        className = '',
        depth = 10,
        rotateIntensity = 8,
        shadowColor = 'rgba(138, 43, 226, 0.4)',
        initial,
        animate,
        transition,
        disabled = false,
}) => {
        const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
        const [isAnimationDisabled, setIsAnimationDisabled] = useState(disabled);
        const cardRef = useRef(null);
        const [ref, inView] = useInView({
                triggerOnce: true,
                threshold: 0.1,
        });

        useEffect(() => {
                // Check if user prefers reduced motion
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

                const updateAnimationPreference = () => {
                        setIsAnimationDisabled(disabled || prefersReducedMotion.matches);
                };

                updateAnimationPreference();
                prefersReducedMotion.addEventListener('change', updateAnimationPreference);

                return () => {
                        prefersReducedMotion.removeEventListener('change', updateAnimationPreference);
                };
        }, [disabled]);

        const handleMouseMove = (e) => {
                if (cardRef.current && !isAnimationDisabled) {
                        const rect = cardRef.current.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;

                        const mouseX = (e.clientX - centerX) / (rect.width / 2);
                        const mouseY = (e.clientY - centerY) / (rect.height / 2);

                        setMousePosition({ x: mouseX, y: mouseY });
                }
        };

        const resetMousePosition = () => {
                setMousePosition({ x: 0, y: 0 });
        };

        // Calculate rotation and transform values based on mouse position
        const rotateX = isAnimationDisabled ? 0 : -mousePosition.y * rotateIntensity;
        const rotateY = isAnimationDisabled ? 0 : mousePosition.x * rotateIntensity;
        const translateZ = isAnimationDisabled ? 0 : depth;

        return (
                <motion.div
                        ref={ref}
                        className={`relative bg-zinc-900/40 border border-zinc-800 backdrop-blur-sm rounded-xl overflow-hidden ${className}`}
                        style={{
                                perspective: '1000px',
                                transformStyle: 'preserve-3d',
                        }}
                        initial={initial}
                        animate={animate}
                        transition={transition}
                >
                        <motion.div
                                ref={cardRef}
                                className="w-full h-full relative transition-transform duration-200 ease-out"
                                style={{
                                        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
                                        transformStyle: 'preserve-3d',
                                }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={resetMousePosition}
                                whileHover={!isAnimationDisabled ? { scale: 1.02 } : {}}
                                whileTap={!isAnimationDisabled ? { scale: 0.98 } : {}}
                        >
                                {/* Shadow Element */}
                                <div
                                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{
                                                boxShadow: isAnimationDisabled ? 'none' : `0 50px 100px ${shadowColor}`,
                                                transform: `translateZ(-${translateZ}px)`,
                                                transformStyle: 'preserve-3d',
                                        }}
                                />

                                {/* Content */}
                                <div className="relative z-10">{children}</div>

                                {/* Card edge effect */}
                                {!isAnimationDisabled && (
                                        <div
                                                className="absolute inset-0 rounded-xl border border-white/10"
                                                style={{
                                                        transform: `translateZ(1px)`,
                                                        transformStyle: 'preserve-3d',
                                                }}
                                        />
                                )}

                                {/* Card background glow effect */}
                                {!isAnimationDisabled && (
                                        <div
                                                className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 hover:opacity-20"
                                                style={{
                                                        background: `radial-gradient(circle at ${50 + mousePosition.x * 50}% ${50 + mousePosition.y * 50}%, ${shadowColor}, transparent 70%)`,
                                                        transform: `translateZ(-1px)`,
                                                }}
                                        />
                                )}
                        </motion.div>
                </motion.div>
        );
};

export default Perspective3DCard; 