import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ScenarioSelector } from './components/ScenarioSelector';
import { TaskInput } from './components/TaskInput';
import { WebpagePreview } from './components/WebpagePreview';
import { VerdictPanel } from './components/VerdictPanel';
import { MultiViewInspector } from './components/MultiViewInspector';
import { FindingsList } from './components/FindingsList';
import { ActionGateCard } from './components/ActionGateCard';
import { SimulatedAgentTrace } from './components/SimulatedAgentTrace';
import { ConfirmationModal } from './components/ConfirmationModal';
import { FallbackAlertBanner } from './components/FallbackAlertBanner';
import { ToastProvider, useToast } from './components/common/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';

import { ALL_FIXTURES } from './fixtures/catalog';
import type { FixtureScenario } from './fixtures/types';
import type { 
  ScanPageResponse, 
  CheckActionResponse, 
  ScanPageRequest, 
  CheckActionRequest 
} from './types/agentguard-contract';
import { getProtectionService, getHttpProtectionService, type HealthStatus } from './services/protection';
import { getAgentSimulationService, type AgentSimulationOutcome } from './services/agent';
import { getExtractor, type ExtractionMode } from './services/extraction';
import './App.css';

const AppDashboard: React.FC = () => {
  const { showToast } = useToast();

  // Mode: Default to 'mock' for 100% offline standalone reliability
  const [mode, setMode] = useState<'mock' | 'live'>('mock');
  const [health, setHealth] = useState<HealthStatus>({ online: true, latencyMs: 8 });
  const [isRetryingPing, setIsRetryingPing] = useState<boolean>(false);

  // Extraction Mode: 'catalog' vs 'live-dom'
  const [extractionMode, setExtractionMode] = useState<ExtractionMode>('catalog');
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Scenario & User Task
  const [fixture, setFixture] = useState<FixtureScenario>(ALL_FIXTURES[2]); // Star demo (ARIA) by default
  const [userTask, setUserTask] = useState<string>(ALL_FIXTURES[2].defaultUserTask);

  // Scan State
  const [scanResult, setScanResult] = useState<ScanPageResponse | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasScanRun, setHasScanRun] = useState<boolean>(false);

  // Action Check State
  const [actionResult, setActionResult] = useState<CheckActionResponse | null>(null);
  const [isCheckingAction, setIsCheckingAction] = useState<boolean>(false);
  const [agentTrace, setAgentTrace] = useState<AgentSimulationOutcome | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Health ping
  const runPing = useCallback(async () => {
    setIsRetryingPing(true);
    try {
      const service = getProtectionService(mode);
      const res = await service.checkHealth();
      setHealth(res);
    } catch {
      setHealth({ online: false, message: 'Protection API unreachable' });
    } finally {
      setIsRetryingPing(false);
    }
  }, [mode]);

  useEffect(() => {
    let isMounted = true;

    const executePing = async () => {
      try {
        const service = getProtectionService(mode);
        const res = await service.checkHealth();
        if (isMounted) {
          setHealth(res);
        }
      } catch {
        if (isMounted) {
          setHealth({ online: false, message: 'Protection API unreachable' });
        }
      }
    };

    void executePing();
    const interval = setInterval(() => {
      void executePing();
    }, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [mode]);

  // Handle Scenario Change
  const handleSelectScenario = (newFixture: FixtureScenario) => {
    setFixture(newFixture);
    setUserTask(newFixture.defaultUserTask);
    setScanResult(null);
    setHasScanRun(false);
    setActionResult(null);
    setAgentTrace(null);
  };

  // Reset Demo
  const handleResetDemo = () => {
    setUserTask(fixture.defaultUserTask);
    setScanResult(null);
    setHasScanRun(false);
    setActionResult(null);
    setAgentTrace(null);
    showToast({
      type: 'info',
      title: 'Demo State Reset',
      message: `Scenario "${fixture.title}" returned to baseline.`
    });
  };

  // Toggle Mode
  const handleToggleMode = () => {
    if (mode === 'mock') {
      setMode('live');
      showToast({
        type: 'info',
        title: 'Switched to Live API Mode',
        message: `Connecting to ${getHttpProtectionService().getBaseUrl()}...`
      });
    } else {
      setMode('mock');
      showToast({
        type: 'info',
        title: 'Switched to Offline Mock Mode',
        message: 'Using standalone contract fixture catalog.'
      });
    }
  };

  // Switch specifically to mock
  const handleSwitchToMock = () => {
    setMode('mock');
    showToast({
      type: 'info',
      title: 'Switched to Offline Mock Mode',
      message: 'Using standalone contract fixture catalog.'
    });
  };

  // Handle endpoint updated via config modal
  const handleEndpointUpdated = (newUrl: string) => {
    showToast({
      type: 'success',
      title: 'Endpoint Updated',
      message: `Targeting AgentGuard API at ${newUrl}`
    });
    void runPing();
  };

  // Toggle Extraction Mode
  const handleToggleExtractionMode = () => {
    const next = extractionMode === 'catalog' ? 'live-dom' : 'catalog';
    setExtractionMode(next);
    showToast({
      type: 'info',
      title: 'Extractor Changed',
      message: `Active extractor: ${next === 'live-dom' ? 'Live DOM Extractor' : 'Catalog Specification'}`
    });
  };

  // Trigger Scan
  const handleRunScan = async () => {
    // If in live mode and offline, prompt user
    if (mode === 'live' && !health.online) {
      showToast({
        type: 'error',
        title: 'Scan Blocked · API Offline',
        message: 'Live AgentGuard API is unreachable. Switch to Mock mode or start the backend adapter.'
      });
      return;
    }

    setIsScanning(true);
    try {
      const service = getProtectionService(mode);
      let pagePayload = fixture.scanRequest.page;

      // Extract dynamically from live container if in live-dom mode
      if (extractionMode === 'live-dom') {
        const extractor = getExtractor('live-dom');
        const extracted = await extractor.extractFromContainer(
          previewContainerRef.current,
          fixture.scanRequest.page
        );
        pagePayload = extracted.page;
      }

      const request: ScanPageRequest = {
        ...fixture.scanRequest,
        page: pagePayload,
        userTask: userTask
      };
      const response = await service.scanPage(request);
      setScanResult(response);
      setHasScanRun(true);
      setActionResult(null);
      setAgentTrace(null);

      showToast({
        type: response.decision === 'block' ? 'warning' : 'success',
        title: response.decision === 'block' ? 'Scan Flagged Attack' : 'Security Scan Completed',
        message: `Analyzed 3 views · Score: ${response.riskScore}/100 · Decision: ${response.decision.toUpperCase()}`
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Scan Execution Failed',
        message: err.message || 'Error communicating with AgentGuard protection service.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Trigger Action Check
  const handleCheckAction = async () => {
    if (!scanResult) return;
    setIsCheckingAction(true);

    try {
      const service = getProtectionService(mode);
      const request: CheckActionRequest = {
        scanId: scanResult.scanId,
        userTask: userTask,
        proposedAction: fixture.proposedAction
      };
      const response = await service.checkAction(request);
      setActionResult(response);

      // Generate Agent Simulation Trace
      const agentService = getAgentSimulationService();
      const traceOutcome = await agentService.runAgentTrace(
        userTask,
        scanResult,
        fixture.proposedAction,
        response,
        fixture.id
      );
      setAgentTrace(traceOutcome);

      if (response.confirmationRequired) {
        setIsConfirmModalOpen(true);
        showToast({
          type: 'warning',
          title: 'Human Authorization Needed',
          message: 'Proposed action deviates from stated user goal.'
        });
      } else if (!response.allowed) {
        showToast({
          type: 'error',
          title: 'Action Gate: EXPLOIT BLOCKED',
          message: `${response.reason} (Zero state mutation)`
        });
      } else {
        showToast({
          type: 'success',
          title: 'Action Gate: PERMITTED',
          message: 'Task-aligned browser tool execution approved.'
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Check Failed',
        message: err.message || 'Error communicating with action gate.'
      });
    } finally {
      setIsCheckingAction(false);
    }
  };

  // Human Confirmation Action
  const handleConfirmAction = () => {
    setIsConfirmModalOpen(false);
    if (actionResult) {
      setActionResult({
        ...actionResult,
        allowed: true,
        decision: 'allow',
        reason: 'Authorized via explicit human confirmation override.'
      });
      if (agentTrace) {
        setAgentTrace({
          ...agentTrace,
          finalSandboxState: 'SUCCESS: Action authorized and executed via human override.',
          executionSummary: 'Human authorized action override. Executed safely.'
        });
      }
      showToast({
        type: 'success',
        title: 'Action Authorized by Human Override',
        message: 'Granted one-time execution permission for this action.'
      });
    }
  };

  return (
    <div className="app-container">
      <Header
        mode={mode}
        onToggleMode={handleToggleMode}
        health={health}
        onReset={handleResetDemo}
        isScanning={isScanning}
        onEndpointUpdated={handleEndpointUpdated}
      />

      {/* Fallback banner when in Live Mode and API is offline */}
      {mode === 'live' && !health.online && (
        <FallbackAlertBanner
          apiUrl={getHttpProtectionService().getBaseUrl()}
          onSwitchToMock={handleSwitchToMock}
          onRetryConnection={runPing}
          onOpenConfig={() => {
            const configBtn = document.querySelector('button[title*="Configure Live Protection API"]') as HTMLButtonElement | null;
            if (configBtn) configBtn.click();
          }}
          isRetrying={isRetryingPing}
        />
      )}

      <main className="dashboard-main">
        {/* Main 3-Column Asymmetric Cockpit Grid */}
        <div className="cockpit-grid">
          {/* Column 1: Inputs & Preview */}
          <div className="column-stack">
            <ScenarioSelector
              selectedId={fixture.id}
              onSelectScenario={handleSelectScenario}
              disabled={isScanning || isCheckingAction}
            />

            <TaskInput
              task={userTask}
              defaultTask={fixture.defaultUserTask}
              onChange={setUserTask}
              disabled={isScanning || isCheckingAction}
            />

            <WebpagePreview 
              fixture={fixture}
              extractionMode={extractionMode}
              onToggleExtractionMode={handleToggleExtractionMode}
              containerRef={previewContainerRef}
            />
          </div>

          {/* Column 2: Verdict & Findings */}
          <div className="column-stack cockpit-col-verdict">
            <VerdictPanel
              scanResult={scanResult}
              isScanning={isScanning}
              onScan={handleRunScan}
              hasScanRun={hasScanRun}
            />

            {hasScanRun && scanResult && (
              <FindingsList findings={scanResult.findings} />
            )}
          </div>

          {/* Column 3: Multi-View Evidence & Action Gate */}
          <div className="column-stack">
            <MultiViewInspector
              fixture={fixture}
              scanResult={scanResult}
            />

            <ActionGateCard
              proposedAction={fixture.proposedAction}
              actionResult={actionResult}
              onCheckAction={handleCheckAction}
              isChecking={isCheckingAction}
              canCheck={hasScanRun}
              onOpenConfirmModal={() => setIsConfirmModalOpen(true)}
            />
          </div>
        </div>

        {/* Bottom Timeline: Simulated Agent Trace */}
        <SimulatedAgentTrace
          trace={agentTrace}
          isRunning={isCheckingAction}
        />
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        proposedAction={fixture.proposedAction}
        actionResult={actionResult}
        onConfirm={handleConfirmAction}
        userTask={userTask}
      />

      {/* Floating Tactical Cyber-Toast Container */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppDashboard />
    </ToastProvider>
  );
};

export default App;

