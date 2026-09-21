import React from 'react';
import type { Finding } from '../types/agentguard-contract';
import { AlertCircle, ShieldAlert, Tag } from 'lucide-react';

interface FindingsListProps {
  findings: Finding[];
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings }) => {
  if (findings.length === 0) {
    return (
      <div style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        color: '#6ee7b7',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <ShieldAlert size={16} color="#10b981" />
        <span>No malicious prompt injection signatures detected on this webpage.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Security Findings ({findings.length})
      </span>

      {findings.map((f) => (
        <div
          key={f.id}
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} />
              <span>{f.id.toUpperCase()} · {f.severity.toUpperCase()} SEVERITY</span>
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              +{f.scoreContribution} Score
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
            "{f.text}"
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
            <span style={{
              fontSize: '0.7rem',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              View: {f.view}
            </span>
            {f.selector && (
              <span style={{
                fontSize: '0.7rem',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}>
                Target: {f.selector}
              </span>
            )}
            {f.signals.map(signal => (
              <span
                key={signal}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Tag size={10} />
                <span>{signal}</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
