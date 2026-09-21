import React from 'react';
import { ALL_FIXTURES } from '../fixtures/catalog';
import type { FixtureScenario } from '../fixtures/types';
import { Sparkles } from 'lucide-react';

interface ScenarioSelectorProps {
  selectedId: string;
  onSelectScenario: (fixture: FixtureScenario) => void;
  disabled?: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedId,
  onSelectScenario,
  disabled
}) => {
  const currentFixture = ALL_FIXTURES.find(f => f.id === selectedId) || ALL_FIXTURES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Evaluation Scenario
        </label>
        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
          {currentFixture.category}
        </span>
      </div>

      <select
        value={selectedId}
        disabled={disabled}
        onChange={(e) => {
          const found = ALL_FIXTURES.find(f => f.id === e.target.value);
          if (found) onSelectScenario(found);
        }}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
        }}
      >
        {ALL_FIXTURES.map(fixture => (
          <option key={fixture.id} value={fixture.id} style={{ background: '#0f172a', color: '#ffffff' }}>
            {fixture.id === 'aria-injection' ? '★ ' : ''}{fixture.title} ({fixture.category})
          </option>
        ))}
      </select>

      {/* Scenario Brief Description */}
      <div style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.45
      }}>
        {currentFixture.id === 'aria-injection' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 600, marginBottom: '4px' }}>
            <Sparkles size={14} />
            <span>Featured Demo Scenario</span>
          </div>
        )}
        {currentFixture.description}
      </div>
    </div>
  );
};
