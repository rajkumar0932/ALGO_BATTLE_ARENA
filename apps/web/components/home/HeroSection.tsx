'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const ParticleCanvas = dynamic(() => import('@/components/ui/ParticleCanvas'), { ssr: false });

const STATS = [
  { icon: '</>',  value: '5+',    label: 'Problems' },
  { icon: '🏆',  value: '1200',  label: 'Peak ELO' },
  { icon: '⚔️',  value: '10min', label: 'Battle Time' },
  { icon: '🛡️',  value: 'vm2',   label: 'Sandboxed' },
];

export default function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#080c18',
        padding: '0 24px',
      }}
    >
      {/* LAYER 0: Particle Canvas */}
      <ParticleCanvas />

      {/* LAYER 1: Gradient Orbs */}
      <div style={{
        position: 'absolute', top: '-200px', left: '-150px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(0,212,255,0.09) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'float1 10s ease-in-out infinite',
        zIndex: 1, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-150px', right: '-100px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.11) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'float2 13s ease-in-out infinite',
        zIndex: 1, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)',
        filter: 'blur(80px)',
        transform: 'translate(-50%, -50%)',
        animation: 'float3 16s ease-in-out infinite',
        zIndex: 1, pointerEvents: 'none',
      }} />

      {/* LAYER 2: Hero Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        maxWidth: '900px', width: '100%',
      }}>

        {/* Top Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 20px',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: '9999px',
          background: 'rgba(0,212,255,0.06)',
          backdropFilter: 'blur(8px)',
          marginBottom: '32px',
          animation: 'fadeSlideDown 0.6s ease forwards, badgePulse 3s ease-in-out 1s infinite',
          fontSize: '13px', fontWeight: 600,
          color: '#00d4ff', letterSpacing: '0.04em',
        }}>
          <span style={{ fontSize: '14px' }}>⚡</span>
          Real-time 1v1 Coding Battles
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
            animation: 'blobPulse 2s ease-in-out infinite',
          }} />
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
          fontWeight: 900,
          lineHeight: 1.0,
          letterSpacing: '-0.03em',
          margin: '0 0 28px 0',
          animation: 'fadeSlideUp 0.7s ease 0.2s both',
        }}>
          <span style={{ color: '#f1f5f9', display: 'block' }}>Code. Battle.</span>
          <span style={{
            display: 'block',
            background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 60%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            backgroundSize: '200% 200%',
            animation: 'shimmer 4s linear infinite, fadeSlideUp 0.7s ease 0.35s both',
          }}>
            Conquer.
          </span>
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: '#94a3b8', lineHeight: 1.7,
          maxWidth: '560px', margin: '0 0 44px 0',
          animation: 'fadeSlideUp 0.7s ease 0.45s both',
        }}>
          Get matched with an opponent, solve the same algorithm problem, and
          race to submit the best solution. Climb the ELO leaderboard and prove
          your skills.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex', gap: '16px', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '56px',
          animation: 'fadeSlideUp 0.7s ease 0.55s both',
        }}>
          <Link href="/play" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '16px 36px',
            background: 'linear-gradient(135deg, #00d4ff, #0099bb)',
            color: '#080c18', fontWeight: 800, fontSize: '1.05rem',
            borderRadius: '12px', textDecoration: 'none',
            boxShadow: '0 0 30px rgba(0,212,255,0.35), 0 4px 20px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.03)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(0,212,255,0.5), 0 8px 30px rgba(0,0,0,0.5)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,212,255,0.35), 0 4px 20px rgba(0,0,0,0.4)';
          }}>
            Start Battling →
          </Link>
          <Link href="/problems" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '16px 36px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem',
            borderRadius: '12px', textDecoration: 'none',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}>
            &lt;/&gt; Practice Problems
          </Link>
        </div>

        {/* Stat Pills Row — REPLACES the old square cards */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '12px',
          justifyContent: 'center',
          animation: 'fadeSlideUp 0.7s ease 0.7s both',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '10px 22px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: '9999px',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.4)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.06)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,212,255,0.15)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
            }}>
              <span style={{ fontSize: '16px' }}>{s.icon}</span>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f1f5f9' }}>{s.value}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* LAYER 3: Scroll chevron */}
      <div style={{
        position: 'absolute', bottom: '32px', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '6px',
        animation: 'fadeSlideUp 1s ease 1.2s both',
      }}>
        <span style={{ fontSize: '11px', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          style={{ animation: 'float1 2s ease-in-out infinite', color: '#475569' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

    </section>
  );
}
