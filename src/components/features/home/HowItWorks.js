'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import GradientText from '../../ui/GradientText';
import Image from 'next/image';
import TabSwitcher from '../../ui/TabSwitcher';
import GlowingText from '../../ui/GlowingText';
import Tooltip from '../../ui/Tooltip';
import Badge from '../../ui/Badge';
import BeamEffect from '../../ui/BeamEffect';
import IntroducingBadge from '../../ui/IntroducingBadge';
import BrowseButton from '../../ui/BrowseButton';

const HowItWorks = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Add state to track active tab
  const [activeTab, setActiveTab] = useState('automation');

  const tabs = [
    {
      id: 'setup',
      label: 'Setup',
      content: <SetupContent />,
    },
    {
      id: 'connect',
      label: 'Connect Accounts',
      content: <ConnectContent />,
    },
    {
      id: 'signals',
      label: 'Signals',
      content: <SignalsContent />,
    },
    {
      id: 'automation',
      label: 'Automation',
      content: <AutomationContent />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-[0.03]"></div>

      {/* Animated beam effects */}
      <BeamEffect
        count={2}
        color="bg-violet-500/5"
        thickness={60}
        speed={15}
      />

      <div className="container-custom relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <IntroducingBadge>EASY SETUP</IntroducingBadge>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">How It </span>
            <span className="text-purple-500">Works</span>
          </h2>

          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto">
            Get started in minutes with our simple 4-step process. No coding knowledge required.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
            {/* Custom tab navigation */}
            <div className="border-b border-zinc-800 mb-8">
              <div className="flex mb-[-2px]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`py-3 px-6 font-medium text-base transition-colors ${activeTab === tab.id
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-zinc-400 hover:text-zinc-300'
                      }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Show content based on active tab */}
            {tabs.find(tab => tab.id === activeTab)?.content}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <BrowseButton dark href="#pricing">
            View Plans
          </BrowseButton>
        </div>
      </div>
    </section>
  );
};

const SetupContent = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
    >
      <div>
        <h3 className="text-2xl font-bold mb-4 text-white">Create Your Account</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold">
              1
            </div>
            <div>
              <Tooltip
                content="Sign up takes less than 60 seconds"
                position="top"
              >
                <h4 className="text-lg font-semibold text-white">Sign Up</h4>
              </Tooltip>
              <p className="text-zinc-400 mt-1">
                Create your account with email or social login.
                <Badge variant="info" size="sm" className="ml-2">
                  FREE
                </Badge>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold">
              2
            </div>
            <div>
              <Tooltip
                content="Verify your account to unlock all features"
                position="top"
              >
                <h4 className="text-lg font-semibold text-white">Verify Email</h4>
              </Tooltip>
              <p className="text-zinc-400 mt-1">
                Confirm your email address to secure your account.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold">
              3
            </div>
            <div>
              <Tooltip
                content="Choose the plan that fits your trading volume"
                position="top"
              >
                <h4 className="text-lg font-semibold text-white">Select Plan</h4>
              </Tooltip>
              <p className="text-zinc-400 mt-1">
                Choose a subscription plan based on your trading needs.
                <Badge variant="premium" size="sm" className="ml-2" animated={true}>
                  PRO
                </Badge>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg blur-sm opacity-75"></div>
        <div className="relative bg-zinc-900 p-1 rounded-lg">
          <Image
            src="https://framerusercontent.com/images/S4kVG1FFzSqxr8zKRGIDj7XfGvo.png"
            alt="Account setup screen"
            width={600}
            height={400}
            className="rounded-md w-full h-auto"
          />
        </div>
        <IntroducingBadge
          className="absolute -top-4 -right-4 bg-zinc-950"
        >
          Easy Setup
        </IntroducingBadge>
      </div>
    </motion.div>
  );
};

const ConnectContent = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
    >
      <div className="order-2 md:order-1 relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur-sm opacity-75"></div>
        <div className="relative bg-zinc-900 p-1 rounded-lg">
          <Image
            src="https://framerusercontent.com/images/AX9PukosNfGVcZXRcTvvV7Vx0Qc.png"
            alt="Connect trading accounts"
            width={600}
            height={400}
            className="rounded-md w-full h-auto"
          />
        </div>
        <IntroducingBadge
          className="absolute -top-4 -left-4 bg-zinc-950"
        >
          Secure Connection
        </IntroducingBadge>
      </div>

      <div className="order-1 md:order-2">
        <h3 className="text-2xl font-bold mb-4 text-white">Connect Your Accounts</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              1
            </div>
            <div>
              <Tooltip
                content="We support all major exchanges including Binance, Coinbase, Bybit and more"
                position="top"
              >
                <h4 className="text-lg font-semibold text-white">Select Exchange</h4>
              </Tooltip>
              <p className="text-zinc-400 mt-1">
                Choose from our list of supported crypto exchanges and brokers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              2
            </div>
            <div>
              <Tooltip
                content="Your API keys are encrypted and securely stored"
                position="top"
              >
                <h4 className="text-lg font-semibold text-white">Generate API Key</h4>
              </Tooltip>
              <p className="text-zinc-400 mt-1">
                Create read-only or trading API keys on your exchange.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              3
            </div>
            <div>
              <Tooltip
                content="Connect as many exchanges as you need"
                position="top"
              >
                <h4 className="text-lg font-semibold text-white">Input Details</h4>
              </Tooltip>
              <p className="text-zinc-400 mt-1">
                Enter your API credentials securely to connect your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SignalsContent = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
    >
      <div>
        <h3 className="text-2xl font-bold mb-4 text-white">Configure Your Trading Signals</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
              1
            </div>
            <div>
              <Tooltip
                content="Choose from pre-built strategies or create custom ones"
                position="top"
              >
                <h4 className="text-lg font-semibold text-white">Select Strategy</h4>
              </Tooltip>
              <p className="text-zinc-400 mt-1">
                Choose from our library of pre-built strategies or create your own.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
              2
            </div>
            <div>
              <Tooltip
                content="Adjust parameters to match your risk tolerance"
                position="top"
              >
                <h4 className="text-lg font-semibold text-white">Customize Parameters</h4>
              </Tooltip>
              <p className="text-zinc-400 mt-1">
                Fine-tune strategy parameters to match your trading style.
                <Badge variant="warning" size="sm" className="ml-2">
                  PRO
                </Badge>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
              3
            </div>
            <div>
              <Tooltip
                content="Test your strategy against historical data"
                position="top"
              >
                <h4 className="text-lg font-semibold text-white">Backtest Performance</h4>
              </Tooltip>
              <p className="text-zinc-400 mt-1">
                Test your strategy against historical market data to validate performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur-sm opacity-75"></div>
        <div className="relative bg-zinc-900 p-1 rounded-lg">
          <Image
            src="https://framerusercontent.com/images/TlFjhNigX1QYrQWJwRYl0o47A.png"
            alt="Trading signals dashboard"
            width={600}
            height={400}
            className="rounded-md w-full h-auto"
          />
        </div>
        <IntroducingBadge
          className="absolute -top-4 -right-4 bg-zinc-950"
        >
          AI-Powered
        </IntroducingBadge>
      </div>
    </motion.div>
  );
};

const AutomationContent = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
    >
      <div className="order-2 md:order-1 relative">
        <IntroducingBadge
          className="absolute top-4 right-4 z-10"
        >
          24/7 Trading
        </IntroducingBadge>
        <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
          <Image
            src="https://framerusercontent.com/images/dWS6ZTeT0JALwqwRY85BjLaJHU.png"
            alt="Automation dashboard"
            width={600}
            height={400}
            className="w-full h-auto"
          />
        </div>
      </div>

      <div className="order-1 md:order-2">
        <h3 className="text-3xl font-bold mb-6 flex items-center">
          <span className="text-purple-500 mr-2">Automate</span>
          <span className="text-white">Your Trading</span>
        </h3>

        <div className="space-y-6">
          <div className="flex items-start">
            <div className="mr-4 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/90 text-white font-medium">
              1
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-1">Set Execution Mode</h4>
              <p className="text-zinc-400">
                Choose between fully automated or semi-automated trading.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-4 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/90 text-white font-medium">
              2
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-1">Configure Risk Management</h4>
              <p className="text-zinc-400 flex items-center">
                Set position sizes, risk limits, and maximum drawdown.
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-900/80 text-red-200 rounded-full">
                  Important
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-4 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/90 text-white font-medium">
              3
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-1">Monitor & Optimize</h4>
              <p className="text-zinc-400 flex items-center">
                Track performance and fine-tune your strategy over time.
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-900/80 text-green-200 rounded-full">
                  Real-time
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HowItWorks;
