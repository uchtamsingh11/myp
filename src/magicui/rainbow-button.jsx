import React from "react";
import { cn } from "../lib/utils";

export const RainbowButton = React.forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-2 font-medium text-white transition-all hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

RainbowButton.displayName = "RainbowButton";