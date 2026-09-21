import type { IProtectionService, HealthStatus } from './IProtectionService';
import type { 
  ScanPageRequest, 
  ScanPageResponse, 
  CheckActionRequest, 
  CheckActionResponse 
} from '../../types/agentguard-contract';

export class HttpProtectionService implements IProtectionService {
  readonly modeName = 'live' as const;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (import.meta as any).env?.VITE_PROTECTION_API_URL || 'http://localhost:3000';
  }

  async checkHealth(): Promise<HealthStatus> {
    const startTime = performance.now();
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        return {
          online: false,
          latencyMs,
          message: `Protection API returned HTTP ${response.status}`
        };
      }

      const data = await response.json().catch(() => ({}));
      return {
        online: true,
        version: data.version || '1.0.0',
        latencyMs,
        message: 'Live AgentGuard SDK connected'
      };
    } catch (err: any) {
      return {
        online: false,
        latencyMs: Math.round(performance.now() - startTime),
        message: `Protection API unreachable at ${this.baseUrl} (${err.message || 'Connection refused'})`
      };
    }
  }

  async scanPage(request: ScanPageRequest): Promise<ScanPageResponse> {
    const response = await fetch(`${this.baseUrl}/scan-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Protection API scan failed (HTTP ${response.status}): ${errorText}`);
    }

    return await response.json();
  }

  async checkAction(request: CheckActionRequest): Promise<CheckActionResponse> {
    const response = await fetch(`${this.baseUrl}/check-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Protection API action-check failed (HTTP ${response.status}): ${errorText}`);
    }

    return await response.json();
  }
}
