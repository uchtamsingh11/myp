'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * Carousel - A smooth, gesture-controlled carousel component with Magic UI styling
 * 
 * @param {Object} props
 * @param {React.ReactNode[]} props.children - Slides to display in the carousel
 * @param {string} props.className - Additional classes for the carousel container
 * @param {boolean} props.autoPlay - Whether to auto-play the carousel
 * @param {number} props.interval - Interval between slides when auto-playing (in ms)
 * @param {boolean} props.showArrows - Whether to show navigation arrows
 * @param {boolean} props.showDots - Whether to show navigation dots
 * @param {boolean} props.loop - Whether to loop back to the first slide after the last
 * @param {string} props.effect - Transition effect (fade, slide)
 * @param {boolean} props.disabled - Disable animations for accessibility
 */
const Carousel = ({
        children,
        className = '',
        autoPlay = false,
        interval = 5000,
        showArrows = true,
        showDots = true,
        loop = true,
        effect = 'slide',
        disabled = false,
}) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const [isAnimationDisabled, setIsAnimationDisabled] = useState(disabled);
        const [isPaused, setIsPaused] = useState(false);
        const [direction, setDirection] = useState(0);
        const sliderControls = useAnimation();
        const slides = Array.isArray(children) ? children : [children];
        const slideRefs = useRef([]);
        const carouselRef = useRef(null);
        const [dragStartX, setDragStartX] = useState(0);
        const autoPlayIntervalRef = useRef(null);
        const touchStartXRef = useRef(0);

        const [ref, inView] = useInView({
                triggerOnce: false,
                threshold: 0.1,
        });

        // Check for reduced motion preference
        useEffect(() => {
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

        // Handle auto-play
        useEffect(() => {
                if (autoPlay && !isPaused && !isAnimationDisabled && inView) {
                        autoPlayIntervalRef.current = setInterval(() => {
                                goToNext();
                        }, interval);
                }

                return () => {
                        if (autoPlayIntervalRef.current) {
                                clearInterval(autoPlayIntervalRef.current);
                        }
                };
        }, [autoPlay, isPaused, currentIndex, isAnimationDisabled, inView, interval]);

        // Go to previous slide
        const goToPrevious = () => {
                setDirection(-1);
                if (currentIndex > 0) {
                        setCurrentIndex(currentIndex - 1);
                } else if (loop) {
                        setCurrentIndex(slides.length - 1);
                }
        };

        // Go to next slide
        const goToNext = () => {
                setDirection(1);
                if (currentIndex < slides.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                } else if (loop) {
                        setCurrentIndex(0);
                }
        };

        // Go to specific slide
        const goToSlide = (index) => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
        };

        // Handle touch start
        const handleTouchStart = (e) => {
                touchStartXRef.current = e.touches[0].clientX;
        };

        // Handle touch end
        const handleTouchEnd = (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartXRef.current - touchEndX;

                // Threshold for swipe detection
                if (Math.abs(diff) > 50) {
                        if (diff > 0) {
                                goToNext();
                        } else {
                                goToPrevious();
                        }
                }
        };

        // Handle mouse down for drag
        const handleMouseDown = (e) => {
                setDragStartX(e.clientX);
        };

        // Handle mouse up for drag
        const handleMouseUp = (e) => {
                const dragEndX = e.clientX;
                const diff = dragStartX - dragEndX;

                // Threshold for drag detection
                if (Math.abs(diff) > 50) {
                        if (diff > 0) {
                                goToNext();
                        } else {
                                goToPrevious();
                        }
                }
        };

        // Animation variants for slides
        const slideVariants = {
                hidden: (custom) => {
                        if (effect === 'fade') return { opacity: 0 };
                        return {
                                x: custom > 0 ? '100%' : '-100%',
                                opacity: 0.5,
                        };
                },
                visible: {
                        x: 0,
                        opacity: 1,
                        transition: {
                                x: { type: 'spring', stiffness: 300, damping: 30 },
                                opacity: { duration: 0.5 }
                        }
                },
                exit: (custom) => {
                        if (effect === 'fade') return { opacity: 0 };
                        return {
                                x: custom > 0 ? '-100%' : '100%',
                                opacity: 0.5,
                                transition: {
                                        x: { type: 'spring', stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.5 }
                                }
                        };
                }
        };

        // Generate dots for navigation
        const renderDots = () => {
                return (
                        <div className="flex justify-center mt-4 space-x-2">
                                {slides.map((_, index) => (
                                        <button
                                                key={index}
                                                onClick={() => goToSlide(index)}
                                                aria-label={`Go to slide ${index + 1}`}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500
              ${currentIndex === index
                                                                ? 'bg-violet-500 w-4'
                                                                : 'bg-zinc-600 hover:bg-zinc-400'
                                                        }`}
                                        />
                                ))}
                        </div>
                );
        };

        return (
                <div
                        ref={ref}
                        className={`relative overflow-hidden rounded-xl ${className}`}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                >
                        {/* Main carousel container */}
                        <div
                                ref={carouselRef}
                                className="relative w-full h-full overflow-hidden"
                                style={{ cursor: isPaused ? 'grab' : 'auto' }}
                        >
                                <AnimatePresence initial={false} mode="wait" custom={direction}>
                                        <motion.div
                                                key={currentIndex}
                                                custom={direction}
                                                variants={isAnimationDisabled ? {} : slideVariants}
                                                initial={isAnimationDisabled ? { opacity: 1, x: 0 } : "hidden"}
                                                animate={isAnimationDisabled ? {} : "visible"}
                                                exit={isAnimationDisabled ? {} : "exit"}
                                                className="absolute inset-0"
                                        >
                                                {slides[currentIndex]}
                                        </motion.div>
                                </AnimatePresence>
                        </div>

                        {/* Navigation arrows */}
                        {showArrows && slides.length > 1 && (
                                <>
                                        <button
                                                className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 
              p-2 rounded-full bg-zinc-900/70 text-white backdrop-blur-sm
              border border-zinc-700/50 hover:bg-zinc-800/70 transition-colors
              hover:shadow-lg hover:shadow-purple-500/20
              ${(!loop && currentIndex === 0) ? 'opacity-50 cursor-not-allowed' : 'opacity-80'}`}
                                                onClick={goToPrevious}
                                                disabled={!loop && currentIndex === 0}
                                                aria-label="Previous slide"
                                        >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                        </button>
                                        <button
                                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10
              p-2 rounded-full bg-zinc-900/70 text-white backdrop-blur-sm
              border border-zinc-700/50 hover:bg-zinc-800/70 transition-colors
              hover:shadow-lg hover:shadow-purple-500/20
              ${(!loop && currentIndex === slides.length - 1) ? 'opacity-50 cursor-not-allowed' : 'opacity-80'}`}
                                                onClick={goToNext}
                                                disabled={!loop && currentIndex === slides.length - 1}
                                                aria-label="Next slide"
                                        >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                        </button>
                                </>
                        )}

                        {/* Navigation dots */}
                        {showDots && slides.length > 1 && renderDots()}
                </div>
        );
};

export default Carousel; 