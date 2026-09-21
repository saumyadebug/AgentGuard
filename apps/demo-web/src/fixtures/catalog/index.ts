import type { FixtureScenario } from '../types';
import { safeRefundFixture } from './safeRefund';
import { visibleAttackFixture } from './visibleAttack';
import { ariaAttackFixture } from './ariaAttack';
import { taskDeviationFixture } from './taskDeviation';
import { benignAriaFixture } from './benignAria';

export const ALL_FIXTURES: FixtureScenario[] = [
  safeRefundFixture,
  visibleAttackFixture,
  ariaAttackFixture,
  taskDeviationFixture,
  benignAriaFixture
];

export function getFixtureById(id: string): FixtureScenario {
  const found = ALL_FIXTURES.find(f => f.id === id);
  if (!found) {
    return safeRefundFixture;
  }
  return found;
}
