# ApexArena - Sports Tournament Management Portal

A modern, production-grade, database-driven **Sports Tournament Management Portal** built for operating multi-sport tournaments (Nov 25th - 28th, 2026).

---

## Key Highlights & Capabilities

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

## Quick Start & Running the Portal

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Database Initialization
The database runs on **MongoDB Atlas** with Mongoose ODM schemas (`src/models/index.ts`).
To re-seed fresh demo data at any time:
```bash
node scripts/seed-mongo.js
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

## Demo Access Credentials

The portal features a **1-Click Quick Demo Login** on the login page (`/login`) as well as an instant **Role Switcher** directly in the sidebar for rapid evaluation:

| Role | Email | Password | Access / Capabilities |
|------|-------|----------|-----------------------|
| **Super Admin** | `admin@sportsportal.com` | `admin123` | Complete Tournament Oversight, Approvals, Leaderboards, Settings |
| **Referee 1 (Marcus)** | `ref.marcus@sportsportal.com` | `referee123` | Code: `REF-001`, Match result submission, points calculation |
| **Referee 2 (Sarah)** | `ref.sarah@sportsportal.com` | `referee123` | Code: `REF-002`, Match result submission, points calculation |
| **Referee 3 (David)** | `ref.david@sportsportal.com` | `referee123` | Code: `REF-003`, Match result submission, points calculation |

---

## Database Architecture

The system is powered by **MongoDB Atlas** using structured Mongoose schemas in `src/models/index.ts`:

- `clubs`: The 5 Houses (Mavericks, Dominators, Alphas, Spartans, Phoenix) with live points and rank
- `cricket_teams`: 10 Cricket Teams (2 per House: Team A & Team B) rolling points up to parent houses
- `sports`: The 7 Sports (BGMI, Carrom, Badminton, Chess, Table Tennis, Cricket, Football)
- `matches`: Event fixtures, rounds, assigned referees, status lifecycle (`SCHEDULED`, `SUBMITTED`, `COMPLETED`, `DISPUTED`)
- `match_participants`: Competing squads/athletes with club affiliations, points, rank, and distribution preview
- `points_history`: Full audit trail of awarded points per club, sport, match, and referee with 2-decimal precision
- `leaderboard_entries`: Cached house standings across sports and overall championship
- `synchronization_logs`: Sync metrics (total found, imported, duplicates, failed)
- `notifications`: Centralized alert center
- `audit_logs`: Detailed change logs with previous & updated values
- `tournament_settings`: Tournament name, operational dates, tie-breaker policies

---

## Navigation & URL Map

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

## Technology Stack
- **Framework**: Next.js 14 (App Router, Server Actions & API Routes)
- **Language**: TypeScript
- **Database & ORM**: SQLite via Prisma Client (self-contained, zero-config)
- **Styling**: Tailwind CSS (Deep navy `#0B192C`, white/light surfaces, status indicators)
- **Icons**: Lucide React & Custom SVG Badges
- **Data Visualizations**: Recharts
- **Security**: bcryptjs password hashing, JWT session cookies, audit logs

