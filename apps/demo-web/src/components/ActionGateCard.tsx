import type { ProposedAction, CheckActionResponse } from '../types/agentguard-contract';
import { ShieldAlert, ShieldCheck, PlayCircle, AlertTriangle } from 'lucide-react';

interface ActionGateCardProps {
  proposedAction: ProposedAction;
  actionResult: CheckActionResponse | null;
  onCheckAction: () => void;
  isChecking: boolean;
  canCheck: boolean;
  onOpenConfirmModal?: () => void;
}

export const ActionGateCard: React.FC<ActionGateCardProps> = ({
  proposedAction,
  actionResult,
  onCheckAction,
  isChecking,
  canCheck,
  onOpenConfirmModal
}) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          Proposed Agent Action
        </span>
        <span style={{
          fontSize: '0.72rem',
          padding: '2px 8px',
          borderRadius: '4px',
          background: proposedAction.riskCategory === 'general' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.15)',
          color: proposedAction.riskCategory === 'general' ? '#34d399' : '#f87171',
          fontWeight: 600
        }}>
          {proposedAction.riskCategory}
        </span>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.85rem'
      }}>
        <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>
          {proposedAction.label}
        </div>
        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
          Action Type: {proposedAction.type}()
        </div>
      </div>

      {/* Button to run Action Gate */}
      <button
        onClick={onCheckAction}
        disabled={!canCheck || isChecking}
        className="btn-action"
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '0.88rem',
          background: canCheck ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : undefined
        }}
      >
        <PlayCircle size={16} />
        <span>{isChecking ? 'Evaluating Action Alignment...' : 'Simulate & Gate Agent Action'}</span>
      </button>

      {!canCheck && (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          (Requires page scan result first)
        </span>
      )}

      {/* Action Check Outcome Banner */}
      {actionResult && (
        <div style={{
          marginTop: '4px',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          background: actionResult.allowed 
            ? 'rgba(16, 185, 129, 0.1)' 
            : (actionResult.confirmationRequired ? 'rgba(139, 92, 246, 0.12)' : 'rgba(239, 68, 68, 0.12)'),
          border: `1px solid ${actionResult.allowed ? '#10b981' : (actionResult.confirmationRequired ? '#8b5cf6' : '#ef4444')}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontWeight: 800,
              fontSize: '0.85rem',
              color: actionResult.allowed ? '#34d399' : (actionResult.confirmationRequired ? '#c084fc' : '#f87171'),
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {actionResult.allowed ? <ShieldCheck size={16} /> : (actionResult.confirmationRequired ? <AlertTriangle size={16} /> : <ShieldAlert size={16} />)}
              <span>ACTION GATE VERDICT: {actionResult.decision.toUpperCase()}</span>
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              Risk: {actionResult.riskScore}
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4, margin: 0 }}>
            {actionResult.reason}
          </p>

          {actionResult.confirmationRequired && onOpenConfirmModal && (
            <button
              onClick={onOpenConfirmModal}
              style={{
                marginTop: '6px',
                background: 'rgba(139, 92, 246, 0.25)',
                border: '1px solid #8b5cf6',
                color: '#e9d5ff',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Review Authorization Request
            </button>
          )}
        </div>
      )}
    </div>
  );
};
