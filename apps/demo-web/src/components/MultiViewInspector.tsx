import React, { useState } from 'react';
import type { FixtureScenario } from '../fixtures/types';
import type { ScanPageResponse } from '../types/agentguard-contract';
import { Eye, Code, Accessibility } from 'lucide-react';

interface MultiViewInspectorProps {
  fixture: FixtureScenario;
  scanResult: ScanPageResponse | null;
}

type TabType = 'visible' | 'dom' | 'accessibility';

export const MultiViewInspector: React.FC<MultiViewInspectorProps> = ({
  fixture,
  scanResult
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('accessibility');
  const page = fixture.scanRequest.page;
  const findings = scanResult ? scanResult.findings : [];

  // Check if findings exist in specific views
  const hasAriaFinding = findings.some(f => f.view === 'accessibility_tree');
  const hasVisibleFinding = findings.some(f => f.view === 'visible_text');

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      gap: '14px',
      height: '100%'
    }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          Multi-View Representation Audit
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          3 Extraction Channels
        </span>
      </div>

      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '4px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setActiveTab('visible')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'visible' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'visible' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          <Eye size={14} />
          <span>Visible Text</span>
          {hasVisibleFinding && (
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
          )}
        </button>

        <button
          onClick={() => setActiveTab('dom')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'dom' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'dom' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          <Code size={14} />
          <span>DOM Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('accessibility')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: activeTab === 'accessibility' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'accessibility' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          <Accessibility size={14} />
          <span>AXTree / ARIA</span>
          {hasAriaFinding && (
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
          )}
        </button>
      </div>

      {/* Tab View Content */}
      <div style={{
        flex: 1,
        maxHeight: '260px',
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        fontSize: '0.8rem',
        lineHeight: 1.6
      }}>
        {activeTab === 'visible' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Extracted rendered text nodes visible to normal sighted users:
            </div>
            {page.visibleText.map((item, i) => {
              const matchingFinding = findings.find(f => f.view === 'visible_text' && item.includes(f.text));
              return (
                <div 
                  key={i} 
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    background: matchingFinding ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: matchingFinding ? '1px dashed #ef4444' : '1px solid rgba(255, 255, 255, 0.03)',
                    color: matchingFinding ? '#fca5a5' : '#cbd5e1'
                  }}
                >
                  {matchingFinding && (
                    <span style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                      [FLAGGED INJECTION]
                    </span>
                  )}
                  {item}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'dom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>
              Normalized HTML / DOM representation sent to LLM context:
            </div>
            {page.domText.map((item, i) => (
              <div 
                key={i} 
                style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  background: item.includes('aria-label') ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  color: '#94a3b8',
                  wordBreak: 'break-all'
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Extracted Accessibility Tree elements (accessible names, roles, aria-labels):
            </div>

            {page.accessibilityText.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                No accessibility attributes extracted on this page.
              </div>
            ) : (
              page.accessibilityText.map((entry, i) => {
                const isMaliciousAria = findings.some(f => f.view === 'accessibility_tree' && f.text.includes(entry.text));

                return (
                  <div 
                    key={i}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isMaliciousAria ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                      border: isMaliciousAria ? '1px solid #ef4444' : '1px solid rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: isMaliciousAria ? '#f87171' : '#34d399'
                      }}>
                        {entry.kind} {entry.selector ? `(${entry.selector})` : ''}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isMaliciousAria ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                        color: isMaliciousAria ? '#fecaca' : '#a7f3d0',
                        fontWeight: 600
                      }}>
                        {isMaliciousAria ? 'CRITICAL INJECTION' : 'BENIGN ACCESSIBILITY'}
                      </span>
                    </div>
                    <div style={{
                      color: isMaliciousAria ? '#fca5a5' : '#e2e8f0',
                      fontWeight: isMaliciousAria ? 600 : 400
                    }}>
                      "{entry.text}"
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
