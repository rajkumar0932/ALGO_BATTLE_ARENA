
const FEATURES = [
  { title: 'Secure Execution', desc: 'Code runs in isolated Docker containers via Piston API.', icon: '🛡️' },
  { title: 'Multi-Language', desc: 'Support for Python, JS, C++, Java, Rust, and Go.', icon: '🌍' },
  { title: 'Anti-Cheat', desc: 'Tab-focus tracking and code similarity checks.', icon: '👁️' },
  { title: 'Instant Matchmaking', desc: 'WebSocket-powered queues to get you playing instantly.', icon: '⚡' },
];

export default function TrustFeatures() {
  return (
    <section style={{ padding: '80px 24px', backgroundColor: '#0d1425' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px'
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="reveal-right" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div style={{
                padding: '24px', background: '#111827',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px',
                display: 'flex', flexDirection: 'column', gap: '12px',
                height: '100%'
              }}>
                <div style={{ fontSize: '28px' }}>{f.icon}</div>
                <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>{f.title}</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
