"use client";

import { cn } from "../lib/utils";

export const BorderBeam = ({
  className,
  colorFrom = "#6B7280",
  colorTo = "#4B5563",
  size = 70,
  duration = 6,
  delay = 0,
}) => {
  return (
    <div className={cn(
      "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
      className
    )}>
      <div 
        className="absolute inset-0 rounded-[inherit]" 
        style={{
          background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
          opacity: 0.3,
        }}
      />
      <div
        className="absolute -inset-[10px] opacity-0"
        style={{
          background: `conic-gradient(from 0deg, transparent 0 ${size}%, ${colorFrom}, ${colorTo}, transparent ${100 - size}% 100%)`,
          animation: `border-beam ${duration}s linear ${delay}s infinite`,
        }}
      />
      <style jsx>{`
        @keyframes border-beam {
          from {
            transform: rotate(0deg);
            opacity: 0.8;
          }
          to {
            transform: rotate(360deg);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};