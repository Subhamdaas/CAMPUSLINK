# CAMPUSLINK

> **AI-Powered Campus-to-Corporate Placement Management & Analytics Platform**

CAMPUSLINK is an institutional placement operating system that unifies students, corporate recruiters, and placement officers into a single, high-trust ecosystem. Engineered for accredited engineering and management institutions, CAMPUSLINK streamlines automated skill-gap analysis, multi-vector candidate ranking, conflict-free drive scheduling, and NIRF/NAAC accreditation analytics.

---

## Key Capabilities

### 1. Student Career Portal
- **Readiness Benchmark (0–100)**: Multi-pillar evaluation across Academics, DSA, System Design, Projects, and Communication.
- **AI Skill Gap Visualizer**: Compares student competencies against industry demand profiles (Full Stack, AI/Data Science, DevOps/Cloud).
- **AI ATS Resume Scanner**: Detects keyword gaps, formats, and structural alignment with 94%+ hiring accuracy.
- **Interactive Proctored MCQ Assessments**: Timed diagnostic quizzes with instant percentile rankings.
- **Application & Interview Tracker**: Multi-stage progress tracking with verified offer acceptance desks.

### 2. Corporate Recruiter Suite
- **AI Job Description Analyzer**: Converts raw JD text into structured requirements, eligibility criteria, and skill tags.
- **Multi-Vector Candidate Matcher**: Ranks applicant pools across algorithmic benchmarks, domain projects, and academics.
- **Explainability Engine**: Transparent "Why Matched" and "Why Not Shortlisted" insights for recruiters and students.
- **Conflict-Free Drive Scheduling**: Live timeline manager with 1-click AI conflict resolution for campus interviews and test slots.

### 3. Placement Command Center (Officers / Deans)
- **Executive KPIs**: Real-time conversion metrics, average and highest CTC, placement percentages, and department-wise tracking.
- **NIRF & NAAC Audit Desk**: One-click generation of Criterion V compliance tables with exportable PDF, Excel, and CSV formats.
- **AI Early Risk Flagging**: Proactive identification of at-risk students with mentor assignment workflows.
- **Document Verification Vault**: Centralized administrative approval desk for academic marksheets and certificates.

---

## Tech Stack & Architecture

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 with custom CSS Variables design system, Glassmorphism, Dark/Light mode switcher, and Lucide icons.
- **Backend**: Node.js, Express.js REST API with JWT-based Role-Based Access Control (RBAC).
- **Database**: MySQL relational database (`campuslink_db`) with connection pooling and automated schema initialization.

---

## Directory Structure

```
CAMPUSLINK/
├── DATABASE/
│   ├── .env.example        # Environment variables template
│   ├── db.js               # MySQL pool & schema setup
│   ├── package.json        # Backend dependencies
│   ├── schema.sql          # Clean relational SQL schema
│   ├── server.js           # Express API server (serves API & static frontend)
│   └── test-db.js          # DB test utility
└── FRONTEND/
    ├── app.js              # Core SPA router, portals logic, modals, theme engine
    ├── assets/             # Logos, icons, clean_room.jpg hero background
    ├── auth.css            # Authentication styles & glassmorphic effects
    ├── auth.html           # Authentication desk
    ├── auth.js             # Auth handlers, captcha generator, eye password toggle
    ├── index.html          # Main SPA shell & modal host
    ├── mockData.js         # Reactive store & evaluation dataset
    └── styles.css          # Design tokens, dark/light theme, layout grids
```

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL Server (v8.0+)

### 1. Database Setup
1. Ensure MySQL is running on port 3306.
2. Create the database:
   ```sql
   CREATE DATABASE campuslink_db;
   ```
3. Import `DATABASE/schema.sql` (or allow `DATABASE/server.js` to automatically initialize tables on startup).

### 2. Backend Setup
```bash
cd DATABASE
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
node server.js
```
The server will start at `http://localhost:5000`.

### 3. Access the Platform
Open your browser and navigate to:
```
http://localhost:5000/
```
Or view the standalone authentication desk at:
```
http://localhost:5000/auth.html
```

---

## Evaluation Demo Accounts (1-Click Login Available)

| Role | Email | Password |
|---|---|---|
| **Student Aspirant** | `student@campuslink.edu` | `password123` |
| **Corporate Recruiter** | `rohit@google.com` | `password123` |
| **Placement Officer** | `officer@campuslink.edu` | `password123` |

---

## License
MIT License. Developed for modern higher education institutions and corporate recruitment ecosystems.
