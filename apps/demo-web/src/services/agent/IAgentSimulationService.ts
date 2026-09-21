import type { 
  ScanPageResponse, 
  CheckActionResponse, 
  ProposedAction 
} from '../../types/agentguard-contract';

export type AgentStepPhase = 
  | 'perception'    // Ingesting content (safe vs raw)
  | 'deliberation'  // LLM internal reasoning / goal alignment
  | 'formulation'   // Constructing tool/action call
  | 'gating'        // AgentGuard intercept
  | 'execution';    // Sandbox state change or block

export interface AgentTraceStep {
  id: string;
  stepNumber: number;
  phase: AgentStepPhase;
  title: string;
  detail: string;
  status: 'pending' | 'active' | 'success' | 'blocked' | 'warning';
  payload?: any;
}

export interface AgentSimulationOutcome {
  steps: AgentTraceStep[];
  proposedAction: ProposedAction;
  gateVerdict: CheckActionResponse;
  finalSandboxState: string;
  executionSummary: string;
}

export interface IAgentSimulationService {
  readonly isRealLlm: boolean;
  
  runAgentTrace(
    userTask: string,
    scanResponse: ScanPageResponse,
    proposedAction: ProposedAction,
    gateVerdict: CheckActionResponse,
    fixtureId: string
  ): Promise<AgentSimulationOutcome>;
}
