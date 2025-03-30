"use client";

import React from "react";
import { cn } from "@/lib/utils.js";
import PropTypes from 'prop-types';

export const Meteors = ({
  number = 20,
  className,
  minDuration = 5,
  maxDuration = 10,
  angle = 145,
}) => {
  const meteors = Array.from({ length: number }, (_, i) => i);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      {meteors.map((_, i) => {
        const duration = Math.floor(
          Math.random() * (maxDuration - minDuration + 1) + minDuration
        );
        const size = Math.floor(Math.random() * 1) + 1;
        const opacity = Math.random() * 0.7 + 0.3;
        const left = Math.floor(Math.random() * 100);
        const delay = Math.random() * 10;
        const deg = Math.floor(Math.random() * 360 + angle);

        return (
          <span
            key={i}
            className={cn(
              "absolute top-0 w-0.5 h-0.5 rounded-full bg-white rotate-[215deg] shadow-[0_0_0_1px_#ffffff10] animate-meteor",
              size === 1 ? "w-1 h-1" : "",
              size === 2 ? "w-1.5 h-1.5" : ""
            )}
            style={{
              top: "0%",
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity: opacity,
              transform: `rotate(${deg}deg)`,
            }}
          ></span>
        );
      })}
    </div>
  );
};

Meteors.propTypes = {
  number: PropTypes.number,
  className: PropTypes.string,
  minDuration: PropTypes.number,
  maxDuration: PropTypes.number,
  angle: PropTypes.number
}; 