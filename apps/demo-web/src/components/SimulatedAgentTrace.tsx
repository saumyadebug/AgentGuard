import React from 'react';
import type { AgentSimulationOutcome } from '../services/agent';
import { Bot, CheckCircle, XCircle, AlertTriangle, Terminal } from 'lucide-react';

interface SimulatedAgentTraceProps {
  trace: AgentSimulationOutcome | null;
  isRunning: boolean;
}

export const SimulatedAgentTrace: React.FC<SimulatedAgentTraceProps> = ({
  trace,
  isRunning
}) => {
  if (!trace && !isRunning) {
    return (
      <div className="glass-panel" style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <Bot size={18} />
        <span>Simulated LLM Agent Trace will appear here once an action check is conducted.</span>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={18} color="#818cf8" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Simulated LLM Web Agent Execution Lifecycle
          </span>
        </div>

        {trace && (
          <span style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '6px',
            fontWeight: 700,
            background: trace.gateVerdict.allowed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: trace.gateVerdict.allowed ? '#34d399' : '#f87171',
            border: `1px solid ${trace.gateVerdict.allowed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            {trace.gateVerdict.allowed ? 'TASK SAFELY COMPLETED' : 'EXPLOIT PREVENTED (ZERO MUTATION)'}
          </span>
        )}
      </div>

      {/* 5-Step Timeline Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px'
      }}>
        {trace?.steps.map((step) => {
          let stepBorder = 'var(--border-subtle)';
          let StepIcon = CheckCircle;
          let iconColor = '#10b981';

          if (step.status === 'blocked') {
            stepBorder = 'rgba(239, 68, 68, 0.4)';
            StepIcon = XCircle;
            iconColor = '#ef4444';
          } else if (step.status === 'warning') {
            stepBorder = 'rgba(245, 158, 11, 0.4)';
            StepIcon = AlertTriangle;
            iconColor = '#f59e0b';
          } else if (step.status === 'active') {
            stepBorder = 'rgba(6, 182, 212, 0.4)';
            StepIcon = Terminal;
            iconColor = '#06b6d4';
          }

          return (
            <div
              key={step.id}
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: `1px solid ${stepBorder}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)'
                }}>
                  STEP 0{step.stepNumber}
                </span>
                <StepIcon size={14} color={iconColor} />
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                {step.title}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {step.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Sandbox State Box */}
      {trace && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.82rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', display: 'block' }}>
              Final Local Sandbox State:
            </span>
            <span style={{ color: trace.gateVerdict.allowed ? '#34d399' : '#f87171', fontWeight: 600 }}>
              {trace.finalSandboxState}
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Evaluation: <strong>{trace.executionSummary}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
