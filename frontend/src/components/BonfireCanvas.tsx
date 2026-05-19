"use client";
import { useEffect, useRef, useState } from "react";
import { EMOTION_NAMES } from "@/lib/config";

interface Props {
  color: string;
  dominantEmotion: number;
  burnDuration: bigint;
  isBurning: boolean;
  secondsUntilExtinguish: number;
}

export default function BonfireCanvas({
  color,
  dominantEmotion,
  burnDuration,
  isBurning,
  secondsUntilExtinguish,
}: Props) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; size: number; delay: number }>>([]);
  const particleRef = useRef(0);

  useEffect(() => {
    if (!isBurning) return;
    const interval = setInterval(() => {
      const id = ++particleRef.current;
      setParticles((prev) => [
        ...prev.slice(-20),
        {
          id,
          x: (Math.random() - 0.5) * 60,
          size: 4 + Math.random() * 8,
          delay: Math.random() * 0.3,
        },
      ]);
    }, 200);
    return () => clearInterval(interval);
  }, [isBurning]);

  const urgencyOpacity = isBurning
    ? Math.max(0.3, secondsUntilExtinguish / 300)
    : 0.15;

  const formatDuration = (secs: bigint) => {
    const s = Number(secs);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer glow */}
      <div
        className="absolute rounded-full transition-all duration-1000"
        style={{
          width: 360,
          height: 360,
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          opacity: urgencyOpacity,
        }}
      />

      {/* Mid glow */}
      <div
        className="absolute rounded-full transition-all duration-500"
        style={{
          width: 220,
          height: 220,
          background: `radial-gradient(circle, ${color}44 0%, transparent 70%)`,
          filter: "blur(20px)",
          opacity: isBurning ? 1 : 0.3,
        }}
      />

      {/* Particles */}
      {isBurning && (
        <div className="absolute" style={{ bottom: 100, left: "50%", transform: "translateX(-50%)" }}>
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: color,
                left: p.x,
                bottom: 0,
                animation: `particleRise ${1.2 + p.delay}s ease-out forwards`,
                "--dx": `${p.x * 0.5}px`,
                opacity: 0.9,
              } as React.CSSProperties}
              onAnimationEnd={() =>
                setParticles((prev) => prev.filter((pp) => pp.id !== p.id))
              }
            />
          ))}
        </div>
      )}

      {/* Fire body */}
      <div
        className={`relative flex items-end justify-center ${isBurning ? "flame-animate" : ""}`}
        style={{ width: 160, height: 200 }}
      >
        {/* Main flame */}
        <svg viewBox="0 0 160 200" style={{ filter: `drop-shadow(0 0 20px ${color})` }}>
          {isBurning ? (
            <>
              <ellipse cx="80" cy="160" rx="55" ry="30" fill={color} opacity="0.9" />
              <path
                d="M80 20 C60 60 30 80 40 130 C50 160 80 170 80 170 C80 170 110 160 120 130 C130 80 100 60 80 20Z"
                fill={color}
                opacity="0.95"
              />
              <path
                d="M80 60 C68 85 55 100 60 130 C65 150 80 158 80 158 C80 158 95 150 100 130 C105 100 92 85 80 60Z"
                fill="white"
                opacity="0.3"
              />
            </>
          ) : (
            <>
              {/* Dormant ember */}
              <ellipse cx="80" cy="160" rx="50" ry="20" fill="#333" />
              <ellipse cx="80" cy="158" rx="30" ry="12" fill="#555" opacity="0.6" />
              <text x="80" y="163" textAnchor="middle" fill="#888" fontSize="12">
                dormant
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Status info */}
      <div className="mt-6 text-center space-y-1">
        {isBurning ? (
          <>
            <p className="text-sm font-medium" style={{ color }}>
              {EMOTION_NAMES[dominantEmotion]}
            </p>
            <p className="text-xs text-gray-400">
              Burning for{" "}
              <span className="text-white font-mono">{formatDuration(burnDuration)}</span>
            </p>
            <p className="text-xs" style={{ color: secondsUntilExtinguish < 60 ? "#DC143C" : "#888" }}>
              {secondsUntilExtinguish < 60
                ? `⚠️ Fades in ${secondsUntilExtinguish}s — throw something!`
                : `Fades in ${Math.floor(secondsUntilExtinguish / 60)}m ${secondsUntilExtinguish % 60}s`}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">The fire is out. Be the first spark.</p>
        )}
      </div>
    </div>
  );
}
