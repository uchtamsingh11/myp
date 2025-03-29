'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * BeamEffect - Creates an animated beam of light that moves across the container
 * This is a signature effect in Magic UI designs
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.direction - Direction of beam movement: 'diagonal', 'horizontal', or 'vertical'
 * @param {number} props.speed - Animation duration in seconds
 * @param {string} props.color - Tailwind color class for the beam
 * @param {boolean} props.disabled - Disable animation for accessibility
 */
const BeamEffect = ({
        count = 1,
        color = 'bg-white/5',
        thickness = 40,
        speed = 10,
        direction = 'horizontal',
        className = '',
        disabled = false,
        ...props
}) => {
        const [isAnimationDisabled, setIsAnimationDisabled] = useState(disabled);
        const [beams, setBeams] = useState([]);

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

        useEffect(() => {
                if (isAnimationDisabled) {
                        setBeams([]);
                        return;
                }

                // Generate random beams
                const newBeams = Array.from({ length: count }, (_, i) => {
                        const position = Math.random() * 100;
                        const delay = Math.random() * 5;

                        return {
                                id: i,
                                position,
                                delay,
                        };
                });

                setBeams(newBeams);
        }, [count, isAnimationDisabled]);

        if (isAnimationDisabled || beams.length === 0) {
                return null;
        }

        return (
                <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} {...props}>
                        {beams.map((beam) => {
                                const isHorizontal = direction === 'horizontal';

                                // Set position and animation based on direction
                                const positionStyle = isHorizontal
                                        ? { top: `${beam.position}%` }
                                        : { left: `${beam.position}%` };

                                // Set dimensions based on direction
                                const dimensionStyle = isHorizontal
                                        ? { height: thickness, width: '200%' }
                                        : { width: thickness, height: '200%' };

                                // Animation values
                                const initialPosition = isHorizontal ? -1000 : -1000;
                                const animatePosition = isHorizontal ? 2000 : 2000;

                                return (
                                        <motion.div
                                                key={beam.id}
                                                className={`absolute ${color} blur-2xl`}
                                                style={{
                                                        ...positionStyle,
                                                        ...dimensionStyle,
                                                        opacity: 0.5,
                                                }}
                                                initial={{
                                                        [isHorizontal ? 'x' : 'y']: initialPosition,
                                                        opacity: 0,
                                                }}
                                                animate={{
                                                        [isHorizontal ? 'x' : 'y']: animatePosition,
                                                        opacity: [0, 0.3, 0],
                                                }}
                                                transition={{
                                                        duration: speed,
                                                        delay: beam.delay,
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                }}
                                        />
                                );
                        })}
                </div>
        );
};

export default BeamEffect; 