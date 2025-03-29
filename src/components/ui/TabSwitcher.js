'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TabSwitcher - A component for switching between different tabs with animations
 * 
 * @param {Object} props
 * @param {Object[]} props.tabs - Array of tab objects with { id, label, content }
 * @param {string} props.defaultTab - ID of the default selected tab
 * @param {Function} props.onChange - Callback when tab changes
 * @param {string} props.className - Additional classes for the container
 * @param {string} props.tabClass - Additional classes for each tab
 * @param {string} props.contentClass - Additional classes for the content area
 * @param {string} props.orientation - Tab orientation (horizontal or vertical)
 * @param {boolean} props.disabled - Disable animations for accessibility
 */
const TabSwitcher = ({
        tabs = [],
        defaultTab = '',
        onChange,
        className = '',
        tabClass = '',
        contentClass = '',
        orientation = 'horizontal',
        disabled = false,
}) => {
        const [activeTab, setActiveTab] = useState(defaultTab || (tabs[0]?.id || ''));
        const [isAnimationDisabled, setIsAnimationDisabled] = useState(disabled);
        const tabRefs = useRef({});
        const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, top: 0, height: 0 });

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

        // Update the indicator position when the active tab changes
        useEffect(() => {
                if (!tabRefs.current[activeTab]) return;

                const activeTabElement = tabRefs.current[activeTab];
                if (activeTabElement) {
                        if (orientation === 'horizontal') {
                                setIndicatorStyle({
                                        left: activeTabElement.offsetLeft,
                                        width: activeTabElement.offsetWidth,
                                        height: 3,
                                });
                        } else {
                                setIndicatorStyle({
                                        top: activeTabElement.offsetTop,
                                        height: activeTabElement.offsetHeight,
                                        width: 3,
                                });
                        }
                }
        }, [activeTab, tabs, orientation]);

        // Handle tab change
        const handleTabChange = (tabId) => {
                setActiveTab(tabId);
                if (onChange) onChange(tabId);
        };

        // Find the active tab content
        const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

        return (
                <div className={`${className}`}>
                        {/* Tab header */}
                        <div
                                className={`relative ${orientation === 'horizontal'
                                                ? 'flex space-x-1 border-b border-zinc-800'
                                                : 'flex flex-col space-y-1 border-r border-zinc-800'
                                        }`}
                        >
                                {/* Animated indicator */}
                                {!isAnimationDisabled && (
                                        <motion.div
                                                className={`absolute bg-gradient-to-r from-purple-500 to-violet-500 rounded-full z-10 ${orientation === 'horizontal' ? 'bottom-0' : 'left-0'
                                                        }`}
                                                initial={false}
                                                animate={{
                                                        left: orientation === 'horizontal' ? indicatorStyle.left : undefined,
                                                        width: orientation === 'horizontal' ? indicatorStyle.width : indicatorStyle.width,
                                                        top: orientation === 'vertical' ? indicatorStyle.top : undefined,
                                                        height: orientation === 'vertical' ? indicatorStyle.height : indicatorStyle.height,
                                                }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                )}

                                {/* Tab buttons */}
                                {tabs.map((tab) => (
                                        <button
                                                key={tab.id}
                                                ref={(el) => (tabRefs.current[tab.id] = el)}
                                                onClick={() => handleTabChange(tab.id)}
                                                className={`relative px-4 py-2 text-sm font-medium transition-colors 
              ${activeTab === tab.id
                                                                ? 'text-white'
                                                                : 'text-zinc-400 hover:text-zinc-200'
                                                        } ${tabClass}`}
                                                aria-selected={activeTab === tab.id}
                                                role="tab"
                                        >
                                                {tab.label}

                                                {/* Bottom border for active tab (when disabled) */}
                                                {isAnimationDisabled && activeTab === tab.id && (
                                                        <div
                                                                className={`absolute bg-violet-500 ${orientation === 'horizontal'
                                                                                ? 'bottom-0 left-0 h-0.5 w-full'
                                                                                : 'left-0 top-0 w-0.5 h-full'
                                                                        }`}
                                                        />
                                                )}
                                        </button>
                                ))}
                        </div>

                        {/* Content area with animations */}
                        <div className={`mt-4 ${contentClass}`}>
                                <AnimatePresence mode="wait">
                                        <motion.div
                                                key={activeTab}
                                                initial={isAnimationDisabled ? {} : { opacity: 0, y: 10 }}
                                                animate={isAnimationDisabled ? {} : { opacity: 1, y: 0 }}
                                                exit={isAnimationDisabled ? {} : { opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                        >
                                                {activeTabContent}
                                        </motion.div>
                                </AnimatePresence>
                        </div>
                </div>
        );
};

export default TabSwitcher; 