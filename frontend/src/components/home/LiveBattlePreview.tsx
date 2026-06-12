import { useEffect, useState } from 'react';

const CODE_STRING = `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []`;

export default function LiveBattlePreview() {
  const [typedCode, setTypedCode] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setTypedCode(CODE_STRING.slice(0, i));
      i++;
      if (i > CODE_STRING.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, [started]);

  return (
    <section style={{ padding: '100px 24px', backgroundColor: '#080c18' }} className="reveal">
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>
          Feel the <span style={{ color: '#00d4ff' }}>Pressure</span>.
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '64px' }}>
          Watch your opponent's progress live. Submit before they do.
        </p>

        {/* Pseudo IDE Window */}
        <div 
          style={{
            background: '#111827',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.1)',
            textAlign: 'left',
          }}
          onMouseEnter={() => setStarted(true)}
        >
          {/* Top Bar */}
          <div style={{
            background: '#1f2937', padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Two Sum — Python3</div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ color: '#00d4ff' }}>You: 0/3</span>
              <span style={{ color: '#ef4444' }}>Opponent: 1/3</span>
            </div>
          </div>

          {/* Code Area */}
          <div style={{ padding: '24px', fontFamily: '"JetBrains Mono", monospace', fontSize: '14px', lineHeight: 1.6, minHeight: '240px', position: 'relative' }}>
            {/* Syntax highlighting hack */}
            <pre style={{ margin: 0 }}>
              <code dangerouslySetInnerHTML={{
                __html: typedCode
                  .replace(/def|for|in|if|return/g, '<span style="color:#8b5cf6">$&</span>')
                  .replace(/two_sum|enumerate/g, '<span style="color:#00d4ff">$&</span>')
                  .replace(/({|}|\[|\])/g, '<span style="color:#f59e0b">$&</span>')
              }} />
              <span style={{
                display: 'inline-block', width: '8px', height: '16px',
                background: '#00d4ff', marginLeft: '2px', verticalAlign: 'middle',
                animation: 'typewriterBlink 1s infinite'
              }} />
            </pre>
            
            {/* Overlay Play Button if not started */}
            {!started && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(4px)',
                cursor: 'pointer'
              }} onClick={() => setStarted(true)}>
                <div style={{
                  padding: '16px 32px', background: 'rgba(0,212,255,0.1)',
                  border: '1px solid #00d4ff', borderRadius: '99px',
                  color: '#00d4ff', fontWeight: 700,
                  animation: 'badgePulse 2s infinite'
                }}>
                  Hover to Simulate Battle
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
