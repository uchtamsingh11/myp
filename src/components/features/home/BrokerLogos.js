'use client';

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "../../magicui/animated-beam";

const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-20 items-center justify-center rounded-full border-2 border-indigo-600/40 bg-black p-2 shadow-[0_0_20px_-12px_rgba(99,102,241,0.5)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

const brokerLogos = {
  aliceBlue: () => (
    <div className="text-white text-base font-bold">Alice</div>
  ),
  angelBroking: () => (
    <div className="text-white text-base font-bold">Angel</div>
  ),
  binance: () => (
    <div className="text-white text-base font-bold">Binance</div>
  ),
  deltaExchange: () => (
    <div className="text-white text-base font-bold">Delta</div>
  ),
  dhan: () => (
    <div className="text-white text-base font-bold">Dhan</div>
  ),
  finvasia: () => (
    <div className="text-white text-base font-bold">Finvasia</div>
  ),
  fyers: () => (
    <div className="text-white text-base font-bold">Fyers</div>
  ),
  iciciDirect: () => (
    <div className="text-white text-base font-bold">ICICI</div>
  ),
  iifl: () => (
    <div className="text-white text-base font-bold">IIFL</div>
  ),
  kotakNeo: () => (
    <div className="text-white text-base font-bold">Kotak</div>
  ),
  metatrader4: () => (
    <div className="text-white text-base font-bold">MT4</div>
  ),
  metatrader5: () => (
    <div className="text-white text-base font-bold">MT5</div>
  ),
  upstox: () => (
    <div className="text-white text-base font-bold">Upstox</div>
  ),
  zerodha: () => (
    <div className="text-white text-base font-bold">Zerodha</div>
  ),
};

export default function BrokerLogos() {
  const containerRef = useRef(null);
  const centerRef = useRef(null);

  // Create refs for all logos
  const logo1Ref = useRef(null);
  const logo2Ref = useRef(null);
  const logo3Ref = useRef(null);
  const logo4Ref = useRef(null);
  const logo5Ref = useRef(null);
  const logo6Ref = useRef(null);
  const logo7Ref = useRef(null);
  const logo8Ref = useRef(null);

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-900/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-900/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-900/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      <div className="container-lg mx-auto px-4 relative z-10">
        <h2 className="text-center text-2xl md:text-3xl font-bold mb-12 text-white">Supported Brokers & Platforms</h2>

        <div
          className="relative flex h-[500px] w-full items-center justify-center overflow-hidden p-5"
          ref={containerRef}
        >
          <div className="flex size-full max-h-[380px] max-w-6xl flex-col items-stretch justify-between gap-16">
            <div className="flex flex-row items-center justify-between">
              <Circle ref={logo1Ref}>
                {brokerLogos.zerodha()}
              </Circle>
              <Circle ref={logo2Ref}>
                {brokerLogos.upstox()}
              </Circle>
              <Circle ref={logo3Ref}>
                {brokerLogos.iifl()}
              </Circle>
            </div>

            <div className="flex flex-row items-center justify-between">
              <Circle ref={logo4Ref}>
                {brokerLogos.aliceBlue()}
              </Circle>
              <Circle ref={centerRef} className="size-36 border-indigo-500/70 bg-gradient-to-br from-indigo-900/30 to-indigo-600/20">
                <div className="text-white text-xl font-bold text-center">
                  <span className="text-indigo-400">AlgoZ</span>
                </div>
              </Circle>
              <Circle ref={logo5Ref}>
                {brokerLogos.dhan()}
              </Circle>
            </div>

            <div className="flex flex-row items-center justify-between">
              <Circle ref={logo6Ref}>
                {brokerLogos.angelBroking()}
              </Circle>
              <Circle ref={logo7Ref}>
                {brokerLogos.iciciDirect()}
              </Circle>
              <Circle ref={logo8Ref}>
                {brokerLogos.fyers()}
              </Circle>
            </div>
          </div>

          {/* Animated beams connecting to center */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={logo1Ref}
            toRef={centerRef}
            curvature={-75}
            endYOffset={-10}
            className="stroke-indigo-500/50"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={logo2Ref}
            toRef={centerRef}
            className="stroke-blue-500/50"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={logo3Ref}
            toRef={centerRef}
            curvature={75}
            endYOffset={10}
            className="stroke-violet-500/50"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={logo4Ref}
            toRef={centerRef}
            curvature={-75}
            endYOffset={-10}
            className="stroke-indigo-600/50"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={logo5Ref}
            toRef={centerRef}
            curvature={75}
            endYOffset={10}
            className="stroke-blue-600/50"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={logo6Ref}
            toRef={centerRef}
            curvature={-75}
            endYOffset={-10}
            reverse
            className="stroke-violet-600/50"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={logo7Ref}
            toRef={centerRef}
            reverse
            className="stroke-indigo-500/50"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={logo8Ref}
            toRef={centerRef}
            curvature={75}
            endYOffset={10}
            reverse
            className="stroke-blue-500/50"
          />
        </div>

        {/* Adding bottom margin to create more space */}
        <div className="mb-12"></div>
      </div>
    </section>
  );
} 