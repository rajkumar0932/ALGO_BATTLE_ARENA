'use client';
import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 2400,  suffix: '+', label: 'Active Coders',    color: '#00d4ff' },
  { value: 18900, suffix: '+', label: 'Battles Fought',   color: '#8b5cf6' },
  { value: 94,    suffix: '%', label: 'Acceptance Rate',  color: '#10b981' },
  { value: 3,     suffix: 's', label: 'Avg Match Time',   color: '#f97316', prefix: '<' },
];

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatItem({ value, suffix, label, color, prefix, delay }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 2200, started);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      flex: '1', minWidth: '160px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 24px',
      animation: `countUp 0.6s ease ${delay}s both`,
    }}>
      <div style={{
        fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
        fontWeight: 900, lineHeight: 1,
        color: color, marginBottom: '10px',
        textShadow: `0 0 30px ${color}60`,
      }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section style={{
      background: 'linear-gradient(180deg, #080c18 0%, #0d1425 50%, #080c18 100%)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        position: 'relative',
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'stretch' }}>
            <StatItem {...s} delay={i * 0.1} />
            {i < STATS.length - 1 && (
              <div style={{
                width: '1px', margin: '20px 0',
                background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)',
                alignSelf: 'stretch',
              }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
