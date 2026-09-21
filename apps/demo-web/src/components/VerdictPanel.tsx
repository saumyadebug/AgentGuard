import React from 'react';
import type { ScanPageResponse, Decision } from '../types/agentguard-contract';
import { ShieldCheck, ShieldAlert, AlertTriangle, Play, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface VerdictPanelProps {
  scanResult: ScanPageResponse | null;
  isScanning: boolean;
  onScan: () => void;
  hasScanRun: boolean;
}

export const VerdictPanel: React.FC<VerdictPanelProps> = ({
  scanResult,
  isScanning,
  onScan,
  hasScanRun
}) => {
  const score = scanResult ? scanResult.riskScore : 0;
  const decision: Decision = scanResult ? scanResult.decision : 'allow';

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  // Determine color based on score/decision
  let gaugeColor = '#10b981';
  let badgeClass = 'badge-allow';
  let decisionTitle = 'SAFE TO PROCEED';
  let DecisionIcon = ShieldCheck;

  if (decision === 'sanitize') {
    gaugeColor = '#f59e0b';
    badgeClass = 'badge-sanitize';
    decisionTitle = 'CONTENT SANITIZED';
    DecisionIcon = AlertTriangle;
  } else if (decision === 'confirm') {
    gaugeColor = '#8b5cf6';
    badgeClass = 'badge-confirm';
    decisionTitle = 'CONFIRMATION REQUIRED';
    DecisionIcon = AlertTriangle;
  } else if (decision === 'block') {
    gaugeColor = '#ef4444';
    badgeClass = 'badge-block';
    decisionTitle = 'ATTACK BLOCKED';
    DecisionIcon = ShieldAlert;
  }

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glow highlight background */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '240px',
        height: '140px',
        background: hasScanRun ? gaugeColor : 'rgba(99, 102, 241, 0.2)',
        filter: 'blur(70px)',
        opacity: 0.25,
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          Protection Engine Verdict
        </span>
        {hasScanRun && scanResult && (
          <span className={`badge ${badgeClass}`}>
            {scanResult.riskLevel} risk
          </span>
        )}
      </div>

      {/* Scan Trigger Button */}
      <button
        onClick={onScan}
        disabled={isScanning}
        className="btn-action"
        style={{ width: '100%', padding: '12px 20px', fontSize: '1rem' }}
      >
        {isScanning ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            <span>Scanning Multi-View Representations...</span>
          </>
        ) : (
          <>
            <Play size={18} />
            <span>{hasScanRun ? 'Re-Scan Page' : 'Run AgentGuard Scan'}</span>
          </>
        )}
      </button>

      {/* Circular Risk Score Meter */}
      <div style={{ position: 'relative', width: '130px', height: '130px', margin: '4px 0' }}>
        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track background */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="10"
          />
          {/* Animated score indicator */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="transparent"
            stroke={hasScanRun ? gaugeColor : 'rgba(255, 255, 255, 0.15)'}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={hasScanRun ? strokeOffset : circumference}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease' }}
          />
        </svg>

        {/* Center Score Text */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {hasScanRun ? score : '--'}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
            Risk Score
          </span>
        </div>
      </div>

      {/* Decision Status Pill */}
      {hasScanRun && scanResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9999px',
            background: `rgba(${decision === 'allow' ? '16, 185, 129' : decision === 'block' ? '239, 68, 68' : '245, 158, 11'}, 0.15)`,
            border: `1px solid ${gaugeColor}`,
            color: gaugeColor,
            fontWeight: 800,
            fontSize: '0.95rem',
            letterSpacing: '0.04em'
          }}>
            <DecisionIcon size={18} />
            <span>{decisionTitle} ({scanResult.decision.toUpperCase()})</span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '6px 0 0 0' }}>
            {scanResult.summary}
          </p>

          {/* Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            width: '100%',
            marginTop: '10px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Safe Context</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                <span>{scanResult.safeContent.length} segments</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Blocked Spans</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: scanResult.blockedContent.length > 0 ? '#f87171' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <XCircle size={14} />
                <span>{scanResult.blockedContent.length} isolated</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '10px 0' }}>
          Click <strong>Run AgentGuard Scan</strong> to inspect page representations through the multi-view defense layer.
        </div>
      )}
    </div>
  );
};
