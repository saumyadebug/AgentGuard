import React from 'react';
import { Target, RotateCcw } from 'lucide-react';

interface TaskInputProps {
  task: string;
  defaultTask: string;
  onChange: (newTask: string) => void;
  disabled?: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  task,
  defaultTask,
  onChange,
  disabled
}) => {
  const isCustomized = task !== defaultTask;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Target size={14} color="#818cf8" />
          <span>User's Original Task</span>
        </label>
        {isCustomized && (
          <button
            onClick={() => onChange(defaultTask)}
            disabled={disabled}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={12} />
            <span>Reset task</span>
          </button>
        )}
      </div>

      <textarea
        value={task}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-sans)',
          resize: 'none',
          outline: 'none',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
          transition: 'border-color 0.2s ease'
        }}
      />
    </div>
  );
};
