"use client";

import { useMemo } from "react";

const COLORS = ["#fbbf24", "#f59e0b", "#8b5cf6", "#a78bfa", "#ec4899", "#f0abfc", "#facc15"];

interface ConfettiProps {
  count?: number;
}

export function Confetti({ count = 25 }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 7) * 0.4}s`,
        duration: `${2.5 + (i % 5) * 0.6}s`,
        color: COLORS[i % COLORS.length],
        rotation: `${(i % 4) * 90}deg`,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  );
}