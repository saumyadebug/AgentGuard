import type { 
  IAgentSimulationService, 
  AgentTraceStep, 
  AgentSimulationOutcome 
} from './IAgentSimulationService';
import type { 
  ScanPageResponse, 
  CheckActionResponse, 
  ProposedAction 
} from '../../types/agentguard-contract';
import { getFixtureById } from '../../fixtures/catalog';

export class DeterministicAgentSimulator implements IAgentSimulationService {
  readonly isRealLlm = false;

  async runAgentTrace(
    userTask: string,
    scanResponse: ScanPageResponse,
    proposedAction: ProposedAction,
    gateVerdict: CheckActionResponse,
    fixtureId: string
  ): Promise<AgentSimulationOutcome> {
    const fixture = getFixtureById(fixtureId);
    const steps: AgentTraceStep[] = [];

    // Step 1: Perception / Ingestion
    const contentReceived = scanResponse.safeContent.length > 0 
      ? scanResponse.safeContent.map(s => s.text).join(' ') 
      : '(No safe content approved)';

    steps.push({
      id: 'step-1-perception',
      stepNumber: 1,
      phase: 'perception',
      title: 'Context Ingestion (AgentGuard Filtered)',
      detail: `Agent context window populated with approved safe content (${scanResponse.safeContent.length} segments). Blocked spans were isolated from model prompt.`,
      status: 'success',
      payload: { safeContentLength: scanResponse.safeContent.length, contentSnippet: contentReceived.slice(0, 160) + '...' }
    });

    // Step 2: Reasoning / Deliberation
    const isAttacked = scanResponse.decision === 'block' || scanResponse.riskScore >= 70;
    steps.push({
      id: 'step-2-deliberation',
      stepNumber: 2,
      phase: 'deliberation',
      title: 'Goal Deliberation & Policy Analysis',
      detail: isAttacked
        ? `Untrusted source requested an action shift toward "${proposedAction.label}". AgentGuard flags risk score (${scanResponse.riskScore}/100).`
        : `User goal "${userTask}" parsed. Synthesizing authorized response from approved context.`,
      status: isAttacked ? 'warning' : 'success'
    });

    // Step 3: Tool / Action Formulation
    steps.push({
      id: 'step-3-formulation',
      stepNumber: 3,
      phase: 'formulation',
      title: `Proposed Browser Action: [${proposedAction.type}]`,
      detail: `Agent formulated action intent: "${proposedAction.label}". Risk category: ${proposedAction.riskCategory}. Submitting to AgentGuard action gate.`,
      status: 'active',
      payload: proposedAction
    });

    // Step 4: Action Gate Intercept
    steps.push({
      id: 'step-4-gating',
      stepNumber: 4,
      phase: 'gating',
      title: `AgentGuard Action Gate: [${gateVerdict.decision.toUpperCase()}]`,
      detail: gateVerdict.allowed
        ? `Verdict: PERMITTED. ${gateVerdict.reason}`
        : `Verdict: INTERCEPTED & BLOCKED. ${gateVerdict.reason}`,
      status: gateVerdict.allowed ? 'success' : (gateVerdict.confirmationRequired ? 'warning' : 'blocked'),
      payload: gateVerdict
    });

    // Step 5: Execution & Sandbox Outcome
    const sandboxState = gateVerdict.allowed
      ? (fixture.simulatedAgentResult.benignOutput || 'Action executed successfully in local sandbox.')
      : (fixture.simulatedAgentResult.sandboxStateMutation || 'BLOCKED: Zero state change occurred.');

    steps.push({
      id: 'step-5-execution',
      stepNumber: 5,
      phase: 'execution',
      title: gateVerdict.allowed ? 'Execution Permitted' : 'Containment Active (Zero Mutation)',
      detail: sandboxState,
      status: gateVerdict.allowed ? 'success' : 'blocked'
    });

    return {
      steps,
      proposedAction,
      gateVerdict,
      finalSandboxState: sandboxState,
      executionSummary: gateVerdict.allowed 
        ? 'Agent executed user task safely with sanitized context.' 
        : 'AgentGuard prevented unauthorized exploit execution. Sandbox state intact.'
    };
  }
}
