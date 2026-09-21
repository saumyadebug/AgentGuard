import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import type { CheckActionResponse, ProposedAction } from '../types/agentguard-contract';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposedAction: ProposedAction;
  actionResult: CheckActionResponse | null;
  onConfirm: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  proposedAction,
  actionResult,
  onConfirm
}) => {
  if (!isOpen || !actionResult) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(139, 92, 246, 0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 700 }}>
            <AlertTriangle size={20} />
            <span>HUMAN CONFIRMATION REQUIRED</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          AgentGuard intercepted an action that deviates from your original goal or affects critical settings. Do you wish to grant one-time execution permission?
        </p>

        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          fontSize: '0.82rem'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Proposed Action:</div>
          <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>{proposedAction.label}</div>
          <div style={{ color: '#c084fc', fontSize: '0.75rem', marginTop: '4px' }}>
            Reason: {actionResult.reason}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '8px 16px' }}
          >
            Block Action
          </button>

          <button
            onClick={onConfirm}
            className="btn-action"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
          >
            <ShieldCheck size={16} />
            <span>Authorize Action</span>
          </button>
        </div>
      </div>
    </div>
  );
};
