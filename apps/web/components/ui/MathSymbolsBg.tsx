"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SYMBOLS = ["∑", "∀", "∃", "O(n)", "O(1)", "O(n²)", "∫", "π", "∞", "∅", "∆", "λ", "μ", "σ"];

interface FloatingSymbol {
  id: number;
  symbol: string;
  x: number;
  y: number;
  scale: number;
  duration: number;
  delay: number;
}

export function MathSymbolsBg() {
  const [symbols, setSymbols] = useState<FloatingSymbol[]>([]);

  useEffect(() => {
    // Generate static initial positions to avoid hydration mismatch
    const generated = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 20 + 20, // 20-40s
      delay: Math.random() * -20, // Start mid-animation
    }));
    setSymbols(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.03]">
      {symbols.map((s) => (
        <motion.div
          key={s.id}
          initial={{ x: `${s.x}vw`, y: `${s.y}vh`, scale: s.scale }}
          animate={{
            y: [`${s.y}vh`, `${(s.y - 30 + 100) % 100}vh`],
            x: [`${s.x}vw`, `${(s.x + (Math.random() > 0.5 ? 10 : -10) + 100) % 100}vw`],
            rotate: [0, 360],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute text-white font-serif font-bold text-4xl select-none"
        >
          {s.symbol}
        </motion.div>
      ))}
    </div>
  );
}
