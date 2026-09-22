import React from 'react';
import { ALL_FIXTURES } from '../fixtures/catalog';
import type { FixtureScenario } from '../fixtures/types';
import { Sparkles, Layers } from 'lucide-react';
import { DoubleBezelCard } from './common/DoubleBezelCard';

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
    <DoubleBezelCard
      headerLeft={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--primary)" />
          <span>Evaluation Scenario</span>
        </div>
      }
      headerRight={
        <span style={{ fontSize: '0.74rem', color: '#818cf8', fontWeight: 600 }}>
          {currentFixture.category}
        </span>
      }
      innerStyle={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
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
          fontSize: '0.88rem',
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
      <div
        style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45
        }}
      >
        {currentFixture.id === 'aria-injection' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 600, marginBottom: '4px' }}>
            <Sparkles size={14} />
            <span>Featured Star Demo Scenario</span>
          </div>
        )}
        {currentFixture.description}
      </div>
    </DoubleBezelCard>
  );
};

export default ScenarioSelector;
