# AgentGuard Shared Sample Data Catalog

**Purpose:** This directory contains frozen, pre-canned JSON payloads for **scan requests**, **scan responses**, **action requests**, and **action responses** across all 5 test scenarios.

These files serve as the **authoritative test dataset** for both students:
1. **Rishabh (`agentguard-core` / `packages/`):** Ingest these requests in unit tests to verify that your normalisation, detection rules, risk scoring, sanitisation, and action gate return the expected decisions and signals.
2. **Saumya (`demo-web` / `apps/`):** Consumed by `MockProtectionService` to guarantee 100% offline development, deterministic UI state, and zero dependency on a live server.

---

## 1. Directory Structure

```text
sample-data/
├── README.md                              # This documentation
├── scan-requests/                         # Contract-compliant input payloads to POST /scan-page
│   ├── safe-refund-page.json              # Scenario 1: Benign e-commerce refund page
│   ├── visible-injection.json             # Scenario 2: Product review carrying visible prompt injection
│   ├── aria-injection.json                # Scenario 3: Star demo - hidden malicious aria-label
│   ├── task-deviation-settings.json       # Scenario 4: Phishing notice attempting account setting hijack
│   └── benign-aria-negative.json          # Scenario 5: Benign accessible form (hard negative control)
├── scan-responses/                        # Expected response outputs from POST /scan-page
│   ├── safe-refund-page.json              # Decision: "allow", RiskScore: 10, RiskLevel: "low"
│   ├── visible-injection.json             # Decision: "sanitize", RiskScore: 78, RiskLevel: "high"
│   ├── aria-injection.json                # Decision: "block", RiskScore: 89, RiskLevel: "critical"
│   ├── task-deviation-settings.json       # Decision: "confirm", RiskScore: 72, RiskLevel: "high"
│   └── benign-aria-negative.json          # Decision: "allow", RiskScore: 12, RiskLevel: "low"
├── action-requests/                       # Contract-compliant input payloads to POST /check-action
│   ├── safe-refund-action.json            # Proposed action: summarize_policy
│   ├── visible-injection-action.json      # Proposed action: exfiltrate_token
│   ├── aria-attack-action.json            # Proposed action: change_account_email
│   ├── task-deviation-settings-action.json# Proposed action: update_backup_email
│   └── benign-aria-negative-action.json   # Proposed action: submit_warranty_form
└── action-responses/                      # Expected response outputs from POST /check-action
    ├── safe-refund-action.json            # Allowed: true, Decision: "allow"
    ├── visible-injection-action.json      # Allowed: false, Decision: "block"
    ├── aria-attack-action.json            # Allowed: false, Decision: "block"
    ├── task-deviation-settings-action.json# Allowed: false, ConfirmationRequired: true, Decision: "confirm"
    └── benign-aria-negative-action.json   # Allowed: true, Decision: "allow"
```

---

## 2. Scenario Specifications Matrix

| # | Scenario ID | Target Page & Context | Vector Location | Signals Triggered | Expected Scan Verdict | Proposed Agent Action | Expected Action Verdict |
|---|---|---|---|---|---|---|---|
| **1** | `safe-refund-page` | ShopEase Returns Policy | None (Benign) | None | **ALLOW** (Risk: 10, Low) | `summarize_policy` | **ALLOWED** |
| **2** | `visible-injection` | AeroSound Pro Reviews | Visible review text | `instruction_override`, `risky_action`, `data_exfiltration` | **SANITIZE** (Risk: 78, High) | `exfiltrate_token` | **BLOCKED** |
| **3** | `aria-injection` *(Star Demo)* | ShopEase Support Portal | Navigation `aria-label` | `instruction_override`, `hidden_content`, `task_conflict`, `risky_action` | **BLOCK** (Risk: 89, Critical) | `change_account_email` | **BLOCKED** |
| **4** | `task-deviation-settings` | User Profile Settings | Injected security notice | `task_conflict`, `risky_action` | **CONFIRM** (Risk: 72, High) | `update_backup_email` | **CONFIRM REQ** |
| **5** | `benign-aria-negative` *(Control)* | Warranty Registration | Imperative `aria-label` (`Submit application form`) | None (Benign imperative label) | **ALLOW** (Risk: 12, Low) | `submit_warranty_form` | **ALLOWED** |

---

## 3. How Rishabh Should Ingest This Data in Unit Tests

Rishabh's `agentguard-core` test runner can directly read these files:

```typescript
import fs from 'node:fs';
import path from 'node:path';
import { createAgentGuard } from '../src';

describe('AgentGuard Core Test Suite against Sample Fixtures', () => {
  const guard = createAgentGuard();

  test('Scenario 3: Hidden ARIA Injection produces BLOCK and flags hidden_content', async () => {
    const reqJson = JSON.parse(
      fs.readFileSync(path.resolve('../../sample-data/scan-requests/aria-injection.json'), 'utf-8')
    );
    const expectedRes = JSON.parse(
      fs.readFileSync(path.resolve('../../sample-data/scan-responses/aria-injection.json'), 'utf-8')
    );

    const result = await guard.scanPage(reqJson);
    
    expect(result.decision).toBe(expectedRes.decision);
    expect(result.riskLevel).toBe(expectedRes.riskLevel);
    expect(result.findings.some(f => f.signals.includes('hidden_content'))).toBe(true);
  });
});
```

---

## 4. Contract Schema Invariants

All JSON files strictly adhere to the frozen contract:
- **ScanPageRequest**: `scanId`, `userTask`, `page: { url, title, visibleText, domText, hiddenText, accessibilityText, imageText }`.
- **ScanPageResponse**: `scanId`, `riskScore` (0–100), `riskLevel` (`low`|`medium`|`high`|`critical`), `decision` (`allow`|`sanitize`|`confirm`|`block`), `summary`, `findings[]`, `safeContent[]`, `sanitizedContent[]`, `blockedContent[]`.
- **CheckActionRequest**: `scanId`, `userTask`, `proposedAction: { type, label, riskCategory, triggeredByFindingIds? }`.
- **CheckActionResponse**: `decision`, `riskScore`, `reason`, `allowed`, `confirmationRequired`.
