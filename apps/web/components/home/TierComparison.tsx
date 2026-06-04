'use client';

const TIERS = [
  { name: 'Bronze', range: '0 - 1199', color: '#cd7f32', desc: 'Where the journey begins. Focus on syntax and basic loops.' },
  { name: 'Silver', range: '1200 - 1499', color: '#c0c0c0', desc: 'Understanding data structures like HashMaps and Stacks.' },
  { name: 'Gold', range: '1500 - 1799', color: '#ffd700', desc: 'Dynamic Programming, Trees, and Graph Traversals.' },
  { name: 'Master', range: '1800+', color: '#ff00ff', desc: 'Elite algorithmic thinkers. Flawless execution.' },
];

export default function TierComparison() {
  return (
    <section style={{ padding: '100px 24px', backgroundColor: '#080c18' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '16px' }}>
            Climb the <span style={{ color: '#f59e0b' }}>Ranks</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Earn ELO for every win. Lose ELO for every defeat. Where do you stand?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {TIERS.map((t, i) => (
            <div key={i} className="reveal-left" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '24px',
                padding: '24px 32px', background: '#111827',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                transition: 'background 0.3s'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#151e30';
                (e.currentTarget as HTMLElement).style.borderColor = `${t.color}50`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#111827';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
              }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: `radial-gradient(circle at top left, ${t.color}, transparent)`,
                  border: `2px solid ${t.color}`,
                  boxShadow: `0 0 20px ${t.color}40`,
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: t.color }}>{t.name}</h3>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 700 }}>{t.range} ELO</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.5 }}>
                    {t.desc}
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
