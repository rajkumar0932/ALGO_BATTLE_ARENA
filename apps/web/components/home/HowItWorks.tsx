'use client';

const STEPS = [
  { step: '01', title: 'Join a Match', desc: 'Click "Find Battle" and our matchmaking system will pair you with a coder of similar ELO rating within seconds.', icon: '🔍', color: '#00d4ff' },
  { step: '02', title: 'Read the Problem', desc: 'Both players receive the exact same algorithmic problem. Read carefully, think of the edge cases, and plan your approach.', icon: '📖', color: '#8b5cf6' },
  { step: '03', title: 'Code & Test', desc: 'Write your solution in the integrated IDE. Run against sample test cases in our secure sandboxed environments.', icon: '💻', color: '#f59e0b' },
  { step: '04', title: 'Submit & Win', desc: 'First to pass all hidden test cases wins the match, steals ELO from the loser, and climbs the global leaderboard.', icon: '🏆', color: '#10b981' }
];

export default function HowItWorks() {
  return (
    <section style={{ padding: '100px 24px', backgroundColor: '#0d1425', position: 'relative' }}>
      
      {/* Background flare */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '80%', height: '80%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.04) 0%, transparent 60%)', pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '20px' }}>
            How The Arena <span style={{ color: '#8b5cf6' }}>Works</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Four simple steps to glory. Prove your algorithms are faster, cleaner, and better.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '32px'
        }}>
          {STEPS.map((s, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
              <div style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px', padding: '32px',
                position: 'relative', overflow: 'hidden',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${s.color}25`;
                (e.currentTarget as HTMLElement).style.borderColor = `${s.color}60`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
              }}>
                {/* Large Background Step Number */}
                <div style={{
                  position: 'absolute', top: '-10px', right: '10px',
                  fontSize: '8rem', fontWeight: 900, color: '#080c18',
                  WebkitTextStroke: '1px rgba(255,255,255,0.03)',
                  zIndex: 0, userSelect: 'none'
                }}>
                  {s.step}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    background: `${s.color}15`, border: `1px solid ${s.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '32px', marginBottom: '24px'
                  }}>
                    {s.icon}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px', color: '#f1f5f9' }}>
                    {s.title}
                  </h3>
                  <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
