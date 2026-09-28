# CAMPUSLINK

> **Institutional Campus-to-Corporate Placement Management & Analytics Platform**

CAMPUSLINK is an institutional placement operating system designed to unify students, corporate recruiters, and placement officers into a single, high-trust ecosystem. Engineered for accredited engineering and management institutions, CAMPUSLINK provides structured workflows for candidate readiness benchmarking, corporate recruitment drives, conflict-free scheduling, and NIRF/NAAC accreditation reporting.

---

## Architectural Overview

```
┌────────────────────────────────────────────────────────┐
│                   CAMPUSLINK FRONTEND                  │
│  - Single authoritative public entry point (Sign In)   │
│  - Unified authenticated shell (Student/Recruiter/Dean) │
│  - Reactive client store & clean empty/loading states  │
└──────────────────────────┬─────────────────────────────┘
                           │
                  HTTP / REST API Client
                  (FRONTEND/api.js)
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   FUTURE BACKEND / API                 │
│  - Authentication & Session Verification               │
│  - Role-Based Access Control (RBAC)                    │
│  - Python AI Engine (Scoring, Matching, NLP Copilot)   │
│  - Relational Database Operations                      │
└────────────────────────────────────────────────────────┘
```

The frontend is architected as a clean Single-Page Application (SPA) with an API abstraction layer (`FRONTEND/api.js`). It communicates with the backend for session restoration, authentication, and live operational records. When backend or AI microservices are offline, the frontend provides clear empty and unavailable states rather than fabricating synthetic data or mock accounts.

---

## Platform Capabilities

### 1. Student Career Portal
- **Readiness Benchmark**: Multi-pillar employability evaluation across Academics, DSA, System Design, Projects, and Communication.
- **Skill Gap Visualizer**: Compares student competencies against industry benchmark profiles.
- **ATS Resume Analyzer**: Identifies keyword gaps, formatting improvements, and structural alignment.
- **Assessment Center**: Diagnostic technical quizzes and proctored coding assessments.
- **Applications & Offers Vault**: Progress tracking from initial application to offer letter verification.

### 2. Corporate Recruiter Console
- **Job Creation & Requirements**: Standardized job description builder with salary, CGPA, and branch eligibility thresholds.
- **Candidate Matching**: Evaluates applicant compatibility against defined requirements.
- **Drive Scheduler**: Candidate overlap detection and interview loop scheduling.
- **Hiring Pipeline**: Real-time conversion tracking across screening, coding assessment, and technical interview stages.

### 3. Placement Command Center (Deans & Officers)
- **Executive Command**: Departmental placement tracking, verified offers, and median compensation reporting.
- **Accreditation & Compliance Reporting**: NIRF Data Capture System and NAAC Criterion 5 audit tables with CSV export.
- **Academic Risk Identification**: Flagging at-risk students with mentor assignment workflows.
- **Document Verification**: Centralized administrative approval desk for academic transcripts and certificates.

---

## Directory Structure

```
CAMPUSLINK/
├── DATABASE/
│   ├── .env.example        # Environment variables template
│   ├── db.js               # MySQL connection pool
│   ├── package.json        # Backend dependencies
│   ├── schema.sql          # Relational SQL schema
│   └── server.js           # API server & static host
└── FRONTEND/
    ├── app.js              # SPA router, UI renderer, modal controller
    ├── assets/             # Institutional logos and banner assets
    ├── auth.css            # Authentication styling
    ├── api.js              # Centralized API client & HTTP transport
    ├── index.html          # SPA shell and modal host
    ├── mockData.js         # Client-side state definitions & fallbacks
    ├── store.js            # Reactive application state store
    └── styles.css          # Design system tokens and layout styles
```

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL Server (v8.0+)

### Setup Instructions
1. Clone the repository and configure environment variables in `DATABASE/.env` (see `DATABASE/.env.example`).
2. Install dependencies:
   ```bash
   cd DATABASE
   npm install
   ```
3. Start the application:
   ```bash
   node server.js
   ```
4. Access the portal at `http://localhost:5000/`.

---

## Authentication & User Access

- **Public Header**: A single `[ Sign In ]` action in the top public navigation bar serves as the exclusive entry point.
- **Centralized Authentication**: Login authenticates against the backend API endpoint (`/api/auth/login`). The user's authorized role is returned by the server and determines the destination portal (`student`, `recruiter`, or `officer`).
- **Portal Gateways**: Portal cards navigate to the respective dashboard if authenticated with that role, or direct unauthenticated users to the central login screen.
- **Session Security**: Session tokens are verified against the backend. Cached local user records are never treated as proof of authentication if the session validation fails.

---

## License
MIT License. Developed for modern higher education institutions and corporate recruitment ecosystems.
