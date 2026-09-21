# AgentGuard Prototype

**Multi-View Prompt-Injection Protection Layer for LLM Web Agents**

[![Phase 1: Verified](https://img.shields.io/badge/Phase%201-Verified-success)](#)
[![Phase 2: Verified](https://img.shields.io/badge/Phase%202-Verified-success)](#)
[![Zero-Conflict Isolation](https://img.shields.io/badge/Zero--Conflict-Guaranteed-blue)](#)

AgentGuard is a multi-view security layer designed to protect autonomous LLM web agents against direct and indirect prompt-injection attacks. By evaluating multiple browser views—**Visible Text**, **Raw DOM**, and the **Accessibility Tree (AXTree/ARIA attributes)**—AgentGuard detects hidden instruction overrides, enforces task alignment, sanitizes untrusted input, and gates dangerous agent actions before execution.

---

## 1. Team Division of Responsibilities & Zero-Conflict Boundaries

| Member | Assigned Workstream | Ownership Scope |
|---|---|---|
| **Rishabh Tripathi** (24BRS1136) | **Protection Layer & SDK** | `packages/agentguard-core/`<br>`packages/agentguard-cli/`<br>`apps/protection-api/` |
| **Saumya** (24BRS1065) | **Demo WebApp, Fixtures & UI** | `apps/demo-web/`<br>`sample-data/`<br>`requirement/` |

### Strict Boundary Rules
1. **Directory Isolation**: Saumya exclusively commits to `apps/demo-web/` and fixture definitions. Rishabh's package directories remain untouched.
2. **Zero Logic Duplication**: Security scoring, signal detection, and action gating algorithms belong strictly in Rishabh's SDK. The frontend relies exclusively on the frozen API contracts (`POST /scan-page`, `POST /check-action`, `GET /health`).
3. **100% Offline Standalone Development**: `apps/demo-web` implements a clean Adapter/Mock pattern (`MockProtectionService`), allowing UI development and demonstrations to run without a running backend server.

---

## 2. Repository Layout

```text
AgentGuard/
├── README.md                              # This root project overview
├── requirement/                           # Architectural & development planning documents
│   ├── PROTOTYPE_BUILD_CONTEXT.md         # Problem definition, attack taxonomy, and research context
│   ├── TEAM_DEVELOPMENT_PLAN.md           # Shared technical contracts, API schemas, and assignments
│   └── SAUMYA_IMPLEMENTATION_PLAN.md      # Detailed phased roadmap for Saumya's workstream
├── sample-data/                           # Frozen contract test payloads & handoff dataset
│   ├── README.md                          # Handoff guide and scenario matrix for Rishabh
│   ├── scan-requests/                     # 5 sample scan requests
│   ├── scan-responses/                    # 5 expected scan responses
│   ├── action-requests/                   # 5 proposed action requests
│   └── action-responses/                  # 5 expected action decisions
├── apps/
│   ├── demo-web/                          # [SAUMYA] React + Vite + TypeScript demonstration web app
│   │   ├── src/
│   │   │   ├── components/                # Cockpit UI, Verdict Panel, Multi-View Inspector, Trace
│   │   │   ├── fixtures/                  # 5 realistic test scenarios & modular React templates
│   │   │   ├── services/                  # Protection adapters (Mock/HTTP), Extraction, Agent simulator
│   │   │   └── types/                     # Shared contract types (agentguard-contract.ts)
│   │   └── scripts/                       # Automated verification test suites
│   └── protection-api/                    # [RISHABH] Thin Express/Fastify HTTP bridge (reserved)
└── packages/
    ├── agentguard-core/                   # [RISHABH] Publishable npm core detection SDK (reserved)
    └── agentguard-cli/                    # [RISHABH] Command line interface (reserved)
```

---

## 3. Test Fixture Scenarios

| # | Scenario ID | Target Webpage | Vector Injected | Expected Decision | Proposed Action Result |
|---|---|---|---|---|---|
| **1** | `safe-refund-page` | ShopEase Returns Portal | None (Clean baseline) | **ALLOW** (Risk: 10) | `summarize_policy` → **Allowed** |
| **2** | `visible-injection` | AeroSound Pro Product Reviews | Visible review text | **SANITIZE** (Risk: 78) | `exfiltrate_token` → **Blocked** |
| **3** | `aria-injection` *(Star Demo)* | Support Portal Navigation | Hidden `aria-label` override | **BLOCK** (Risk: 89) | `change_account_email` → **Blocked** |
| **4** | `task-deviation-settings` | User Account Profile | Phishing security warning | **CONFIRM** (Risk: 72) | `update_backup_email` → **Confirmation Modal** |
| **5** | `benign-aria-negative` *(Control)* | Warranty Registration Form | Imperative accessible button label | **ALLOW** (Risk: 14) | `submit_warranty_form` → **Allowed** |

---

## 4. Quick Start & Verification

### Running Automated Test Suites (Saumya Workstream)
```bash
# Verify Phase 1 Setup, Contract Types & Mock Layer (59 checks)
node apps/demo-web/scripts/verify-phase1.mjs

# Verify Phase 2 Fixture Catalog, Templates & Extraction Layer (39 checks)
node apps/demo-web/scripts/verify-phase2.mjs

# Verify Contract & Parity with sample-data (122 checks)
node apps/demo-web/scripts/verify-integration-contract.mjs

# Master Suite: Run All 3 Verification Suites (220 checks)
node apps/demo-web/scripts/verify-all.mjs
```

### Launching the Demonstration Dashboard
```bash
cd apps/demo-web
npm install
npm run dev
```
The demonstration dashboard will be available at `http://localhost:5173`.
