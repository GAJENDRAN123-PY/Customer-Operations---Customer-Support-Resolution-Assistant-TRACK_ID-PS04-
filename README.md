TRACK_ID=PS04

# Customer Operations - Customer Support Resolution Assistant

A production-ready AI Resolution Assistant engineered for a broadband and mobile provider's customer support desk. The system operates across incoming customer requests (speed faults, optical line drops, roaming billing disputes, repeat hardware failures, device eSIM setups) and intelligently routes cases through **three distinct decision pathways**:

1. **Routine Resolution Drafts**: Automatically drafts courteous, professional responses grounded directly in matching support articles, with citations to specific clauses and personalized with customer account facts, ready for frontline agents to review, approve, and send with one click.
2. **Missing Information Clarification**: Detects when crucial diagnostic data is missing (e.g., optical network terminal LED labels or colors, wired vs. wireless speed tests) and asks the customer for exactly what is needed while providing immediate guidance to the agent.
3. **Complex / Urgent Human Handover**: For chronic faults (multiple router swaps failing), environmental issues (rain-induced optical dropouts), or customers demanding fee-free contract cancellation and business loss compensation (Directive CO-77), the assistant immediately halts automated deflection and generates a comprehensive **Zero-Context-Loss Handover Dossier** so the customer never repeats themselves.

---

## Demo Video

- **Video Link**: [Watch the 3-Minute Demo Video](https://youtu.be/placeholder-demo-ps04) *(Replace with recorded demonstration link)*
- Demonstrates handling a routine case (roaming waiver / Wi-Fi channel optimization) and a difficult edge case (Directive CO-77 repeat hardware failure during rainfall with ombudsman/churn risk).

---

## One-Command Quickstart

The application adheres strictly to the single-command runner specification:

### Prerequisites
- Python 3.11 or 3.12 installed.
- (Optional) `GEMINI_API_KEY` for live Gemini LLM reasoning. If no key is set or the network is offline, the built-in deterministic expert engine ensures 100% operational functionality without failing.

### Setup & Run
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. (Optional) Set your Gemini API key
export GEMINI_API_KEY="your-gemini-api-key"
# On Windows PowerShell:
# $env:GEMINI_API_KEY="your-gemini-api-key"

# 3. Start the application (serves both backend API and compiled UI)
python app.py
```

The unified application will be live at:
**http://localhost:8000**

---

## Architecture & System Design

```
+-----------------------------------------------------------------------------------+
|                           Unified Fast Python Server (app.py)                     |
|                               (Serving on port 8000)                              |
+-----------------------------------------------------------------------------------+
       |                                       |                               |
       v                                       v                               v
[Compiled UI (dist/)]               [REST API Endpoints]             [Local Retrieval RAG]
  - Ticket Queue (5 Scenarios)        - GET  /api/health               - NumPy Cosine Sim
  - Customer 360 Record               - GET  /api/articles             - BM25 Keyword Matching
  - Case Conversation Panel           - GET  /api/articles/search      - Precomputed Vectors
  - Grounding Knowledge Base          - POST /api/resolve              - Zero 3rd party DBs
  - Handover Dossier Modal            - POST /api/tickets/:id/message
                                      - POST /api/tickets/:id/handover
                                               |
                                               v
                             +-----------------------------------+
                             |     Resolution Decision Engine    |
                             +-----------------------------------+
                                   |                       |
                                   v                       v
                         [Deterministic Policy]    [Gemini LLM Reasoner]
                         - Directive CO-77         - Gemini 2.5 / 3.8 Flash
                         - ONT Missing Fields      - Strict JSON Schema
                         - Courtesy Credit Caps    - Graceful Fallback
```

### Clean Separation of LLM Reasoning & Deterministic Logic
- **Deterministic Guardrails (`src/backend/heuristics.py`)**: Hard business rules (e.g. Directive CO-77 requiring immediate escalation when >=2 repeat faults or rain-correlated outages occur) are enforced deterministically. The bot never hallucinates self-help advice for high-risk churn cases.
- **Local Hybrid Vector Retrieval (`src/backend/retrieval.py`)**: Vector retrieval pipeline built purely with standard Python and `numpy`, utilizing TF-IDF and BM25 token weighting over precomputed embeddings. Fully compliant with competition rules prohibiting hosted external vector stores or 3rd party RAG services.
- **Gemini GenAI Engine (`src/backend/llm_assistant.py`)**: Uses the official Google GenAI SDK (`google-genai`). Dynamically contextualizes conversation turns, Customer 360 facts, and retrieved knowledge articles into a structured prompt, guaranteeing schema compliance.
- **Resilience & Graceful Degradation**: If the Gemini API is offline, experiencing rate limits, or if `GEMINI_API_KEY` is omitted, the engine automatically falls back to deterministic rule synthesis so the operator interface never breaks.

---

## Generated Data & Knowledge Base

All data was specifically authored to test routine, ambiguous, and edge scenarios:

1. **`data/support_articles.json`**:
   - `KB-BB-101`: *Flashing or Red PON / LOS Light on Optical Terminal (ONT)* — Cable reseating, optical Rx thresholds (-8 to -27 dBm healthy vs < -30 dBm line cut), PON vs LOS LED status.
   - `KB-BB-102`: *Wi-Fi Speed Discrepancy vs Guaranteed Sync Speed* — 2.4GHz vs 5GHz channel interference, band steering, free Apex Mesh Extender eligibility for Priority Plus / Gigabit tiers.
   - `KB-BIL-201`: *Unexpected Roaming & Out-of-Bundle Charge Inquiry* — First-time inadvertent maritime/coastal border roaming waiver under $50.00, safety spend caps.
   - `KB-BIL-202`: *Direct Debit Bounce & Payment Promise Arrangement* — 14-day grace period, payment promises, non-restricted line terms.
   - `KB-MOB-301`: *Mobile: eSIM Transfer, QR Code Expiration & Device Swap* — 24-hour security expiry window, regenerating fresh replacement profiles to verified email.
   - `KB-RET-401`: *Complex Policy: Repeat Hardware Failures, Water Ingress & Termination Demands* — Customer Operations Directive CO-77 mandatory escalation rules.

2. **`data/customers.json`**:
   - Complete Customer 360 records with plan tier, tenure, billing status, itemized charges, prior ticket logs, and real-time equipment telemetry:
     - `routerStatus`, `opticalRxPower` (dBm), `ontPonLight`, `ontLosLight`, `wifiCongestion`, `uptime`.

3. **`data/tickets.json`**:
   - 5 end-to-end support scenarios demonstrating every facet of the specification:
     - **Ticket #TCK-7821 (Sarah Chen)**: Routine Wi-Fi speed drop in bedroom -> Solved with channel optimization + complimentary Mesh Extender.
     - **Ticket #TCK-7822 (David Miller)**: Missing diagnostic info on wall box -> Clarification requested for PON vs LOS light and color before acting.
     - **Ticket #TCK-7823 (Emma Watson)**: Unexpected maritime roaming fee from ferry trip -> Solved with $20 courtesy credit waiver + spend cap.
     - **Ticket #TCK-7824 (Marcus Vance)**: 3rd router swap failing in heavy rain with ombudsman threat -> Escalated via Directive CO-77 to Senior Field Engineering & Retention with complete Handover Dossier.
     - **Ticket #TCK-7825 (Priya Patel)**: Expired eSIM QR code after phone upgrade -> Solved with instant voucher re-issue.

4. **`data/embeddings.json`**:
   - Precomputed vector vocabulary and document embeddings for sub-millisecond local RAG retrieval at startup.

---

## Automated Verification

A comprehensive test suite is included:
```bash
python test_resolution.py
```

### Verified Test Cases:
- `test_health_endpoint`: Checks `/api/health` 200 response and metadata.
- `test_local_retriever`: Validates local vector search accuracy across roaming, ONT, speed, and churn queries.
- `test_pathway_1_routine_wifi`: Confirms grounded routine draft with KB-BB-102 citation and customer personalization.
- `test_pathway_2_clarify_missing_ont_details`: Confirms missing fields detection (PON vs LOS, Red vs Green) with KB-BB-101.
- `test_pathway_3_complex_handover_directive_co77`: Confirms Directive CO-77 trigger, Handover Dossier generation, and Urgent/Critical priority assignment.
- `test_api_resolve_endpoint`: Validates REST schema output.

---

## Interactive Operator Console Features

The frontend interface (`dist/`) provides frontline agents with a complete workstation:
- **Live Ticket Queue**: Switch between customer inquiries with color-coded triage status badges (`Routine`, `Needs Info`, `Handover`).
- **Customer 360 & Hardware Telemetry**: Live inspection of line sync speed, optical Rx power gauge, ONT PON/LOS status, Wi-Fi channel spectrum, and past ticket history.
- **Resolution Assistant Card**:
  - Highlights confidence score and grounding explanation.
  - One-click **"Approve & Send to Customer"** for routine drafts.
  - One-click **"Ask Customer for Missing Details"** for clarification prompts.
  - One-click **"Initiate Zero-Context Handover"** opening the specialist transfer modal.
  - In-place draft editing and customer reply simulation.
- **Grounded Knowledge Base Panel**: Inspect full policy texts, checklists, and highlighted sections cited by the assistant.
- **Zero-Context-Loss Handover Modal**: Displays established facts, attempted steps, and recommended engineering actions, allowing clean transfer to Tier-2 queues.
