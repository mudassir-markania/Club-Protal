# 🏆 ApexArena - Sports Tournament Management Portal

A modern, production-grade, database-driven **Sports Tournament Management Portal** built for operating multi-sport tournaments (Nov 25th - 28th, 2026).

---

## 🌟 Key Highlights & Capabilities

1. **Role-Based Separation**:
   - **ADMIN PANEL**: Full tournament oversight, clubs, sports, players, referee assignments, fixture scheduling, Google Forms synchronization, match approval, point allocations, and leaderboard recalculations.
   - **REFEREE PANEL**: Simplified, high-contrast, distraction-free match official interface to start assigned matches, record live scores, set-by-set outcomes, select winners, file match observations, submit results, or report disputes.
2. **Google Forms / Sheets Automated Registration Pipeline**:
   - **Method 1 (Google Sheets API Sync)**: Automatic synchronization with linked Google Form response spreadsheets, auto-mapping of fields, and automatic duplicate detection.
   - **Method 2 (CSV/Excel Upload)**: File upload dropzone, automatic header detection, mapping review, duplicate identification, and batch import.
   - **Workflow**: `Submission -> Google Sheets / CSV -> Validation & Duplicate Check -> Registration DB -> Admin Review -> Approved Player`.
3. **Automated Dynamic Leaderboard Engine**:
   - Overall Club Leaderboard (Rank, Club, Gold, Silver, Bronze, Wins, Total Points, Score Diff, Podium view).
   - Sport-Wise Standings (Matches played, won, drawn, lost, points, score difference).
   - Individual Player Leaderboard (Singles disciplines).
   - Doubles Pairs Leaderboard (Doubles disciplines).
   - Recalculation engine updates standings dynamically from validated match results & points history.
4. **Audit Logs & Security**:
   - Every mutation is logged with user, action, entity, record ID, and JSON before/after state diff.
   - Role-based route authorization enforced both on client and server.

---

## 🚀 Quick Start & Running the Portal

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Database Initialization
The SQLite database (`prisma/dev.db`) is already created and seeded with tournament data.
To re-seed fresh demo data at any time:
```bash
npm run db:seed
```

### 2. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

Or to run the optimized production build:
```bash
npm run build
npm start
```

---

## 🔑 Demo Access Credentials

The portal features a **1-Click Quick Demo Login** on the login page (`/login`) as well as an instant **Role Switcher** directly in the sidebar for rapid evaluation:

| Role | Email | Password | Access / Capabilities |
|------|-------|----------|-----------------------|
| **Super Admin** | `admin@sportsportal.com` | `admin123` | Complete Tournament Oversight, Approvals, Leaderboards, Settings |
| **Operations Admin** | `manager@sportsportal.com` | `admin123` | Fixtures, Registrations, Club & Sport Management |
| **Referee 1 (Football & Cricket)** | `ref.marcus@sportsportal.com` | `referee123` | Code: `REF-001`, Match scoring & result submission |
| **Referee 2 (Badminton & TT)** | `ref.sarah@sportsportal.com` | `referee123` | Code: `REF-002`, Match scoring & result submission |
| **Referee 3 (Basketball)** | `ref.david@sportsportal.com` | `referee123` | Code: `REF-003`, Match scoring & result submission |

---

## 🗄️ Database Architecture

The relational schema is configured in `prisma/schema.prisma`:

- `roles`: `SUPER_ADMIN`, `ADMIN`, `REFEREE`
- `users`: User authentication, hashed passwords, role linkage
- `clubs`: Clubs (Apex Predators, Titan Warriors, Velocity Strikers, Phoenix Hawks), captains, points, rank
- `sports`: Disciplines (Football, Cricket T10, Badminton Doubles, Table Tennis Singles, Basketball), formats, scoring configs
- `players`: Participant roster, unique registration IDs, club assignment, eligibility status
- `player_sports`: Multi-sport linkage per player
- `referees`: Field officials, availability, referee codes
- `referee_sports`: Authorized sports per referee
- `venues`: Main Arena Field A, Olympic Indoor Court 1, Basketball Dome, etc.
- `matches`: Fixtures, tournament dates (Nov 25-28, 2026), rounds, statuses (`SCHEDULED`, `UPCOMING`, `IN_PROGRESS`, `SUBMITTED`, `COMPLETED`, `DISPUTED`)
- `match_participants`: Competing clubs or players, scores, set details, winner flags
- `match_referees`: Assigned referees per fixture
- `match_results`: Submitted outcomes by referee, approval workflow state, notes
- `score_entries`: Live set-by-set or half-by-half score entries
- `points_history`: Full audit trail of awarded points per club, sport, and match
- `leaderboard_entries`: Cached/derived standings for overall and sport-specific leaderboards
- `registrations`: Inbound Google Forms and CSV submissions, duplicate flags
- `google_integrations`: Spreadsheet ID, sheet name, column mappings, auto-sync settings
- `synchronization_logs`: Sync metrics (total found, imported, duplicates, failed)
- `notifications`: Centralized alert center
- `audit_logs`: Detailed change logs with previous & updated values
- `tournament_settings`: Tournament name, operational dates, tie-breaker policies

---

## 📱 Navigation & URL Map

### Public / Authentication
- `/login` – Portal Sign In with quick 1-click test buttons

### Admin Panel (`/admin`)
- `/admin/dashboard` – Operations center with 9 metrics cards, charts, progress donuts, and live fixtures
- `/admin/clubs` – Club CRUD, team captains, roster lists, and points history
- `/admin/sports` – Sports CRUD, tournament format (Knockout/League/Doubles), scoring config, referee assignments
- `/admin/players` – Participant roster with multi-sport filters and CSV exports
- `/admin/referees` – Referee account management and authorized discipline assignments
- `/admin/matches` – Fixtures schedule, date filters (Nov 25 - 28), and result approval modal
- `/admin/registrations` – Google Forms sync, CSV dropzone, mapping, duplicate review, and approval
- `/admin/leaderboard` – Overall Club Standings (Gold/Silver/Bronze/Points), Sport-wise, Individual, Doubles
- `/admin/reports` – Export center for rosters, fixtures, results, and point histories (CSV, PDF view)
- `/admin/audit-logs` – Complete audit trail and JSON state diffs

### Referee Panel (`/referee`)
- `/referee/dashboard` – Assigned sports, active matches in progress, pending submissions
- `/referee/matches` – My assigned fixtures filtered by status
- `/referee/matches/[id]` – Dedicated live score sheet, set tracker, winner selector, confirmation modal, dispute reporting

---

## 📋 Technology Stack
- **Framework**: Next.js 14 (App Router, Server Actions & API Routes)
- **Language**: TypeScript
- **Database & ORM**: SQLite via Prisma Client (self-contained, zero-config)
- **Styling**: Tailwind CSS (Deep navy `#0B192C`, white/light surfaces, status indicators)
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **Security**: bcryptjs password hashing, JWT session cookies, audit logs

