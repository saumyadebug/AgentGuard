import type { 
  ScanPageRequest, 
  ScanPageResponse, 
  CheckActionResponse, 
  ProposedAction 
} from '../types/agentguard-contract';

export interface FixtureScenario {
  id: string;
  title: string;
  tagline: string;
  category: 'Safe Baseline' | 'Direct Injection' | 'Indirect / Hidden Injection' | 'Policy Alignment' | 'Hard Negative';
  description: string;
  defaultUserTask: string;
  expectedRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  expectedDecision: 'allow' | 'sanitize' | 'confirm' | 'block';
  
  // Contract-compliant scan request payload
  scanRequest: ScanPageRequest;
  
  // Default mock response when running in offline/standalone mode
  mockScanResponse: ScanPageResponse;
  
  // Default proposed agent action
  proposedAction: ProposedAction;
  
  // Default mock action check response
  mockActionResponse: CheckActionResponse;

  // Local simulated sandbox state change after execution
  simulatedAgentResult: {
    benignOutput?: string;
    attemptedExploit?: string;
    sandboxStateMutation: string;
  };
}
