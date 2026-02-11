/* ========================================
   FREE PDF TTS READER — Footer
   by Analyst Sandeep
   Redesign: Warm Premium Reader
   ======================================== */

import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        padding: '6px 24px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-secondary)',
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '12px' }}>🎧</span>
        <span className="gradient-text" style={{ fontSize: '11px', fontWeight: 700 }}>
          PDF TTS READER
        </span>

        <span style={{ width: '1px', height: '12px', backgroundColor: 'var(--border-color)' }} />

        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Built by{' '}
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Analyst Sandeep</span>
        </span>

        <span style={{ width: '1px', height: '12px', backgroundColor: 'var(--border-color)' }} />

        <a
          href="mailto:itbusinessanalystsandeep@gmail.com"
          style={{
            fontSize: '11px',
            color: 'var(--accent-start)',
            textDecoration: 'none',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <Mail size={10} />
          itbusinessanalystsandeep@gmail.com
        </a>

        <span style={{ width: '1px', height: '12px', backgroundColor: 'var(--border-color)' }} />

        {['Free', 'Local', 'Private', 'Chrome / Edge'].map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: '9px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </footer>
  );
}