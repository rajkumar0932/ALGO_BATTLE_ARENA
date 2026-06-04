"use client";
import { useState, useEffect } from "react";
export function StatCounter({ value, isFloat = false }: { value: number, isFloat?: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = () => { start += (value - start) * 0.1; setCount(start); if(value - start > 0.1) requestAnimationFrame(step); else setCount(value); };
    requestAnimationFrame(step);
  }, [value]);
  return <>{isFloat ? count.toFixed(1) : Math.round(count)}</>;
}
